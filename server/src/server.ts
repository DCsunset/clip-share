import Fastify from "fastify";
import FastifyWebSocket from "fastify-websocket";
import FastifyCookie from "fastify-cookie";
import openpgp from "openpgp";
import {
	DeviceInfo,
	HttpError,
	BaseRequest,
	BaseResponse,
	SessionRequest,
	ErrorResponse,
	ListResponse,
	PairRequest,
	PairResponse,
	WebSocketError
} from "./types";
import { isBaseRequest, isBaseResponse, isPairRequest, isSessionRequest } from "./types.guard";
import { readConfig } from "./config";
import tokenPlugin from "./plugins/token";
import { generateToken, verifyToken } from "./util/token";
import { getKeyInfo, verifyChallengeReponse } from "./util/crypto";

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
			if (isBaseRequest(rawData)) {
				const baseRequest = rawData as BaseRequest;
				switch (baseRequest.type) {
					case "list": {
						const devices = Array.from(onlineDevices.entries())
							.map(([fingerprint, info]) => ({
								name: info.name,
								fingerprint
							}));
						const listReponse: ListResponse = {
							type: "list",
							success: true,
							devices
						} as ListResponse;
						connection.socket.send(listReponse);
						break;
					}
					case "pair": {
						// Forward request from devices
						// check type
						if (!isPairRequest(baseRequest)) {
							throw new WebSocketError("pair", "Invalid request");
						}
						const { device, publicKey, name: deivceName	} = baseRequest as PairRequest;
						if (!onlineDevices.has(device)) {
							throw new WebSocketError("pair", "Device not online");
						}
						// Info of the other devices
						const info = onlineDevices.get(device)!;
						if (info.name != deivceName) {
							throw new WebSocketError("pair", "Device name not matched");
						}
						// Send sender's info to receiver
						const pairRequest: PairRequest = {
							type: "pair",
							device: fingerprint,
							name,
							publicKey
						};
						info.websocket.send(pairRequest);
						break;
					}
					case "send": {
						// TODO
						break;
					}
					default:
						throw new WebSocketError("request", "Invalid request type");
				}
			}
			else if (isBaseResponse(rawData)) {
				// TODO
			}
			else {
				throw new WebSocketError("request", "Invalid request");
			}
		}
		catch (err) {
			let errResponse: ErrorResponse;
			if (err instanceof WebSocketError) {
				errResponse = {
					type: err.type,
					success: false,
					error: `Error: ${err.message}`
				};
			}
			else {
				errResponse = {
					type: "internal",
					success: false,
					error: `Error: ${(err as Error).message}`
				};
			}
			connection.socket.send(errResponse);
		}
	});

	// TODO: remove from onlineDevice when connection closed
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
