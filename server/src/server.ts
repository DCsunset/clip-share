import Fastify from "fastify";
import FastifyWebSocket from "fastify-websocket";
import FastifyCookie from "fastify-cookie";
import openpgp from "openpgp";
import {
	BaseMessage,
	DeviceInfo,
	HttpError,
	ListResponse,
	PairMessage,
	SessionRequest,
	ShareMessage,
	WebSocketError
} from "./types";
import {
	isBaseMessage,
	isPairMessage,
	isSessionRequest,
	isShareMessage
} from "./types.guard";
import { readConfig } from "./config";
import tokenPlugin from "./plugins/token";
import { generateToken, verifyToken } from "./utils/token";
import { getKeyInfo, verifyChallengeReponse } from "./utils/crypto";

const config = readConfig();

const fastify = Fastify({
	logger: true
});
fastify.register(FastifyWebSocket);
fastify.register(FastifyCookie);
fastify.register(tokenPlugin, {
	cookieName: config.jwt.cookieName
});

// Server state: Map<fingerprint, Device>
const onlineDevices: Map<string, DeviceInfo> = new Map();
// Unsent clipboard data (wait until device online)
// Map<fingerprint, content>
const clipboard: Map<string, string> = new Map();

// Custom error handler
fastify.setErrorHandler(function (err, _req, reply) {
	if (err instanceof HttpError) {
		reply.statusCode = err.statusCode;
		reply.send(err.message);
		this.log.info(err.message);
	}
	else {
		reply.statusCode = 500;
		reply.send("Internal Server Error");
		this.log.error(err);
	}
});

// Create a session (log in using challenge response)
// Challenge: sign an ISO date with prefix within 1 hour (avoid time asynchrony)
fastify.post("/session", async (req, reply) => {
	if (!verifyToken(req.token, config)) {
		throw new HttpError(401, "Unauthorized");
	}

	if (!isSessionRequest(req.body)) {
		throw new HttpError(400, "Bad request");
	}

	const body = req.body as SessionRequest;

	let publicKey: openpgp.Key;
	try {
		publicKey = await openpgp.readKey({
			armoredKey: body.publicKey
		});
	}
	catch (err) {
		throw new HttpError(401, "Invalid public key");
	}

	await verifyChallengeReponse(publicKey, body.challengeResponse);

	const keyInfo = getKeyInfo(publicKey);
	const token = generateToken(keyInfo, config);
	if (body.cookie) {
		reply.setCookie(config.jwt.cookieName, token, {
			httpOnly: true,
			maxAge: config.jwt.maxAgeInDays * 24 * 3600
		});
		reply.statusCode = 204;
	}
	else {
		reply.send(token);
	}
});

// check login
fastify.get("/session", async (req, reply) => {
	if (verifyToken(req.token, config) !== null) {
		reply.statusCode = 204;
	}
	else {
		throw new HttpError(401, "Invalid or empty token")
	}
});

// log out (cookie only)
fastify.delete("/session", async (_req, reply) => {
	reply.clearCookie(config.jwt.cookieName);
	reply.statusCode = 204;
});


// Connect via WebSocket
fastify.get("/", { websocket: true }, async (connection, req) => {
	const payload = verifyToken(req.token, config);
	if (payload === null) {
		throw new HttpError(401, "Unauthorized");
	}

	const { fingerprint, name } = payload;

	if (onlineDevices.has(fingerprint)) {
		throw new HttpError(409, "Device of this key already online");
	}

	onlineDevices.set(fingerprint, {
		name,
		websocket: connection.socket
	});

	connection.socket.on("message", message => {
		try {
			const rawData = JSON.parse(message.toString());
			// check type
			if (isBaseMessage(rawData)) {
				const baseMessage = rawData as BaseMessage;
				switch (baseMessage.type) {
					case "list": {
						const devices = Array.from(onlineDevices.entries())
							.map(([fingerprint, info]) => ({
								name: info.name,
								fingerprint
							}));
						const listResponse: ListResponse = {
							type: "list",
							success: true,
							devices
						};
						connection.socket.send(listResponse);
						break;
					}
					case "pair": {
						// Forward messages from devices
						// check type
						if (!isPairMessage(baseMessage)) {
							throw new WebSocketError("pair", "Invalid request");
						}
						const pairMessage = baseMessage as PairMessage;
						if (!onlineDevices.has(pairMessage.device)) {
							throw new WebSocketError("pair", "Device not online");
						}
						// Info of the other devices
						const info = onlineDevices.get(pairMessage.device)!;
						if (info.name != pairMessage.name) {
							throw new WebSocketError("pair", `Device name ${pairMessage.name} mismatched`);
						}
						// Send sender's info to receiver
						pairMessage.device = fingerprint
						pairMessage.name = name;

						info.websocket.send(pairMessage);
						break;
					}
					case "share": {
						if (!isShareMessage(baseMessage)) {
							throw new WebSocketError("share", "Invalid message");
						}
						const shareMessage = baseMessage as ShareMessage;
						if (!onlineDevices.has(shareMessage.device)) {
							throw new WebSocketError("share", "Device not online");
						}

						// Info of the other devices
						const info = onlineDevices.get(shareMessage.device)!;
						// Send sender's info to receiver
						shareMessage.device = fingerprint

						info.websocket.send(shareMessage);
						break;
					}
					default:
						throw new WebSocketError("error", `Invalid message type: ${baseMessage.type}`);
				}
			}
			else {
				throw new WebSocketError("error", "Invalid message");
			}
		}
		catch (err) {
			let errMessage: BaseMessage;
			if (err instanceof WebSocketError) {
				errMessage = {
					type: err.type,
					success: false,
					error: `Error: ${err.message}`
				};
			}
			else {
				errMessage = {
					type: "error",
					success: false,
					error: `Internal Error: ${(err as Error).message}`
				};
			}
			connection.socket.send(errMessage);
		}
	});

	// remove from onlineDevice when connection closed
	connection.socket.on("close", () => {
		onlineDevices.delete(fingerprint);
		console.log(`Device ${name} (${fingerprint}) disconnects`);
	});
});

const start = async () => {
	const isProduction = process.env.NODE_ENV === "production";
	const address = isProduction ? "0.0.0.0" : "localhost";

	try {
		await fastify.listen(3000, address);
	}
	catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
