import { Server } from "socket.io";
import {
	AuthRequest,
	DataBuffer,
	DataType,
	DeviceInfo,
	ListResponse,
	PairEvent,
	ShareEvent,
} from "./types";
import {
	isAuthRequest,
	isPairEvent,
	isShareEvent,
} from "./types.guard";
import { readConfig } from "./config";
import { getFingerprint, verifyChallenge } from "./utils/crypto";
import { createServer } from "http";

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
const onlineDevices = new Map<string, DeviceInfo>();
// Map connections to device id
const connectionMap = new Map<string, string>();

const io = new Server({
	// websocket only
	transports: ["websocket"]
});

io.on("connection", async socket => {
	try {
		if (!isAuthRequest(socket.handshake.auth)) {
			throw new Error("Invalid auth request");
		}
		const { challenge, publicKey, name } = socket.handshake.auth as AuthRequest;

		// Auth via challenge response
		// Challenge: sign an ISO date with prefix within 1 hour (avoid time asynchrony)

		// Verify challenge
		if (!await verifyChallenge(publicKey, challenge)) {
			throw new Error("Invalid public key or challenge");
		};

		if (connectionMap.has(socket.id)) {
			throw new Error("Socket ID already used");
		}

		const deviceId = await getFingerprint(publicKey);
		if (onlineDevices.has(deviceId)) {
			throw new Error("Device already online");
		}

		connectionMap.set(socket.id, deviceId);
		onlineDevices.set(deviceId, { name, socket });
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
					id,
					name: info.name,
				}));
			const listResponse: ListResponse = devices;
			socket.emit("list", listResponse);
		});
		
		// Pair device
		socket.on("pair", data => {
			// Forward messages from devices
			// check type
			if (!isPairEvent(data)) {
				socket.emit("error", "Invalid pair request");
				return;
			}
			const pairEvent = data as PairEvent;
			if (!onlineDevices.has(pairEvent.deviceId)) {
				socket.emit("error", "Device to pair not online");
				return;
			}

			// Info of the other devices
			const otherDevice = onlineDevices.get(pairEvent.deviceId)!;
			if (otherDevice.name != pairEvent.name) {
				socket.emit("error", `Device name ${pairEvent.name} mismatched`);
				return;
			}

			// Send sender's info to receiver
			otherDevice.socket.emit("pair", {
				deviceId,
				name,
				publicKey: pairEvent.publicKey,
			} as PairEvent);
		});
		
		// Share data
		socket.on("share", data => {
			if (!isShareEvent(data)) {
				socket.emit("error", "Invalid share event");
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
				otherDevice.socket.emit("share", {
					...shareEvent,
					deviceId
				} as ShareEvent);
			}
		});
	}
	catch (err) {
		socket.emit("error", (err as Error).message);
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
