import { Server } from "socket.io";
import {
	AuthRequest,
	EventBuffer,
	EventType,
	Device,
	DeviceState,
	ErrCode,
	ErrEvent,
	EventError,
	PairEvent,
	ShareEvent,
	UnpairEvent,
	DeleteEvent,
} from "./types";
import {
	isAuthRequest,
	isDeleteEvent,
	isPairEvent,
	isShareEvent,
	isUnpairEvent,
} from "./types.guard";
import { readConfig } from "./config";
import { getFingerprint, verifyChallenge } from "./utils/crypto";
import { createServer } from "http";

function newErrEvent(code: ErrCode, device?: Device): ErrEvent {
	return { code, device };
}

const config = readConfig();
// Buffer unsent data (wait until device online)
// Map<fingerprint, buffer>
// TODO: add expiry data to release memory
const buffer: Map<string, EventBuffer> = new Map();

function addToBuffer(deviceId: string, type: EventType, event: any) {
	if (!buffer.has(deviceId)) {
		buffer.set(deviceId, {
			share: [],
			unpair: []
		});
	}
	const buf = buffer.get(deviceId)!;
	buf[type].push(event);
	if (buf[type].length > config.bufferSize[type]) {
		buf[type].shift();
	}
}


// Map device id to device info
const onlineDevices = new Map<string, DeviceState>();
// Map connections to device id
const connectionMap = new Map<string, string>();

function getOnlineDevices() {
	return Array.from(onlineDevices.entries())
		.map(([id, info]) => ({
			deviceId: id,
			name: info.name,
		}));
}

const io = new Server({
	// websocket only
	transports: ["websocket"]
});


io.on("connection", async socket => {
	try {
		if (!isAuthRequest(socket.handshake.auth)) {
			throw new EventError(ErrCode.InvalidRequest);
		}
		const { challenge, publicKey, name } = socket.handshake.auth as AuthRequest;

		// Auth via challenge response
		// Challenge: sign an ISO date with prefix within 1 hour (avoid time asynchrony)

		// Verify challenge
		if (!await verifyChallenge(publicKey, challenge)) {
			throw new EventError(ErrCode.AuthFailure);
		};

		if (connectionMap.has(socket.id)) {
			throw new EventError(ErrCode.SocketIdUsed);
		}

		const deviceId = await getFingerprint(publicKey);
		if (onlineDevices.has(deviceId)) {
			// Disconnect previous socket
			const state = onlineDevices.get(deviceId)!;
			io.in(state.socketId).disconnectSockets(true);
		}

		connectionMap.set(socket.id, deviceId);
		onlineDevices.set(deviceId, {
			name,
			socketId: socket.id
		});
		console.log(`Device ${name} (${deviceId}) connected`);
		
		// Disconnection
		socket.on("disconnect", () => {
			onlineDevices.delete(deviceId);
			connectionMap.delete(socket.id);
			// Send updated device list to every connected device
			for (const { socketId } of onlineDevices.values()) {
				io.to(socketId).emit("list", getOnlineDevices());
			}
			console.log(`Device ${name} (${deviceId}) disconnected`);
		});

		// send buffered events
		if (buffer.has(deviceId)) {
			const buf = buffer.get(deviceId)!;
			const types: EventType[] = ["share", "unpair"];
			for (const type of types) {
				for (const data of buf[type]) {
					socket.emit(type, data);
				}
			}
		}
		
		const unpairDevices = (devices: Device[]) => {
			for (const d of devices) {
				const event: UnpairEvent = {
					deviceId,
					name
				};

				if (!onlineDevices.has(d.deviceId)) {
					addToBuffer(d.deviceId, "unpair", event);
					continue;
				}

				// Info of the other devices
				const otherDevice = onlineDevices.get(d.deviceId)!;
				if (otherDevice.name != d.name) {
					socket.emit("error", newErrEvent(ErrCode.DeviceNameMismatched, d));
					return;
				}

				// Send sender's info to receiver
				io.to(otherDevice.socketId).emit("unpair", event);
			}
		};
	
		// List request (manually refresh)
		socket.on("list", () => {
			socket.emit("list", getOnlineDevices());
		});
		
		// Pair device
		socket.on("pair", data => {
			// Forward message to the other device
			if (!isPairEvent(data)) {
				socket.emit("error", newErrEvent(ErrCode.InvalidRequest));
				return;
			}
			const event = data as PairEvent;
			if (!onlineDevices.has(event.deviceId)) {
				socket.emit("error", newErrEvent(ErrCode.DeviceOffline, event));
				return;
			}

			// Info of the other devices
			const otherDevice = onlineDevices.get(event.deviceId)!;
			if (otherDevice.name != event.name) {
				socket.emit("error", newErrEvent(ErrCode.DeviceNameMismatched, event));
				return;
			}

			// Send sender's info to receiver
			io.to(otherDevice.socketId).emit("pair", {
				deviceId,
				name,
				publicKey: event.publicKey,
				expiryDate: event.expiryDate
			} as Required<PairEvent>);
		});

		socket.on("unpair", data => {
			if (!isUnpairEvent(data)) {
				socket.emit("error", newErrEvent(ErrCode.InvalidRequest));
				return;
			}

			const event = data as UnpairEvent;
			unpairDevices([event]);
		});
		
		// Share data
		socket.on("share", data => {
			if (!isShareEvent(data)) {
				socket.emit("error", newErrEvent(ErrCode.InvalidRequest));
				return;
			}
			
			const event = data as ShareEvent;
			const sentEvent: ShareEvent = {
				...event,
				deviceId
			};
			if (!onlineDevices.has(event.deviceId)) {
				addToBuffer(event.deviceId, "share", sentEvent);
				return;
			}

			// Info of the other devices
			const otherDevice = onlineDevices.get(event.deviceId)!;
			// Send sender's info to receiver
			io.to(otherDevice.socketId).emit("share", sentEvent);
		});

		// Delete current deivce
		socket.on("delete", data => {
			if (!isDeleteEvent(data)) {
				socket.emit("error", newErrEvent(ErrCode.InvalidRequest));
				return;
			}
			const event = data as DeleteEvent;

			// delete buffer
			buffer.delete(deviceId);
			// unpair devices
			unpairDevices(event.pairedDevices);

			onlineDevices.delete(deviceId);
			connectionMap.delete(deviceId);
			socket.disconnect(true);
		});

		// Send updated device list to every connected device
		for (const { socketId } of onlineDevices.values()) {
			io.to(socketId).emit("list", getOnlineDevices());
		}
	}
	catch (err) {
		if (err instanceof EventError) {
			socket.emit("error", err.toErrEvent());
		}
		else {
			socket.emit("error", newErrEvent(ErrCode.InternalError));
			console.error((err as Error).message);
		}
		socket.disconnect(true);
	}
});

const httpServer = createServer();
io.attach(httpServer);

const isProduction = process.env.NODE_ENV === "production";
const address = isProduction ? "0.0.0.0" : "localhost";
const port = 3000;
httpServer.listen(port, address, 128, () => {
	console.log(`Listening at ${address}:${port}`);
});
