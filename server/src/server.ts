import { Server } from "socket.io";
import {
	AuthRequest,
	DataBuffer,
	DataType,
	Device,
	DeviceState,
	ErrCode,
	ErrEvent,
	EventError,
	ShareEvent,
} from "./types";
import {
	isAuthRequest,
	isDevice,
	isShareEvent,
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
const buffer: Map<string, DataBuffer> = new Map();

function addToBuffer(fromDevice: string, toDevice: string, data: ShareEvent["data"]) {
	if (!buffer.has(toDevice)) {
		buffer.set(toDevice, {
			clipboard: [],
			notification: []
		});
	}
	const buf = buffer.get(toDevice)!;
	buf[data.type].push({
		from: fromDevice,
		content: data.content
	});
	if (buf[data.type].length > config.bufferSize[data.type]) {
		buf[data.type].shift();
	}
}


// Map device id to device info
const onlineDevices = new Map<string, DeviceState>();
// Map connections to device id
const connectionMap = new Map<string, string>();

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
			throw new EventError(ErrCode.DeviceAlreadyOnline);
		}

		connectionMap.set(socket.id, deviceId);
		onlineDevices.set(deviceId, {
			name,
			socketId: socket.id,
			publicKey
		});
		console.log(`Device ${name} (${deviceId.substring(0, 17)}) connects`);
		
		// Disconnection
		socket.on("disconnect", () => {
			connectionMap.delete(socket.id);
			onlineDevices.delete(deviceId);
			console.log(`Device ${name} (${deviceId.substring(0, 17)}) disconnects`);
		});

		// send buffered data
		if (buffer.has(deviceId)) {
			const buf = buffer.get(deviceId)!;
			const types: DataType[] = ["clipboard", "notification"];
			for (const type of types) {
				for (const data of buf[type]) {
					const shareEvent: ShareEvent = {
						deviceId: data.from,
						data: {
							type,
							content: data.content
						}
					};
					socket.emit("share", shareEvent);
				}
			}
		}

		// List request
		socket.on("list", () => {
			const devices = Array.from(onlineDevices.entries())
				.map(([id, info]) => ({
					deviceId: id,
					name: info.name,
				}))
				.filter(({ deviceId: id }) => id !== deviceId);
			socket.emit("list", devices);
		});
		
		// Pair device
		socket.on("pair", data => {
			// Forward message to the other device
			if (!isDevice(data)) {
				socket.emit("error", newErrEvent(ErrCode.InvalidRequest));
				return;
			}
			const device = data as Device;
			if (!onlineDevices.has(device.deviceId)) {
				socket.emit("error", newErrEvent(ErrCode.DeviceOffline, device));
				return;
			}

			// Info of the other devices
			const otherDevice = onlineDevices.get(device.deviceId)!;
			if (otherDevice.name != device.name) {
				socket.emit("error", newErrEvent(ErrCode.DeviceNameMismatched, device));
				return;
			}

			// Send sender's info to receiver
			io.to(otherDevice.socketId).emit("pair", {
				deviceId,
				name,
				publicKey: otherDevice.publicKey,
			} as Required<Device>);
		});
		
		// Share data
		socket.on("share", data => {
			if (!isShareEvent(data)) {
				socket.emit("error", newErrEvent(ErrCode.InvalidRequest));
				return;
			}
			const shareEvent = data as ShareEvent;
			if (!onlineDevices.has(shareEvent.deviceId)) {
				addToBuffer(deviceId, shareEvent.deviceId, shareEvent.data);
			}
			else {
				// Info of the other devices
				const otherDevice = onlineDevices.get(shareEvent.deviceId)!;
				// Send sender's info to receiver
				io.to(otherDevice.socketId).emit("share", {
					...shareEvent,
					deviceId
				} as ShareEvent);
			}
		});
	}
	catch (err) {
		if (err instanceof EventError) {
			socket.emit("error", err.toErrEvent());
		}
		else {
			socket.emit("error", newErrEvent(ErrCode.InternalError));
			console.error((err as Error).message);
		}
		socket.disconnect();
		return;
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
