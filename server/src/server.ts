import Fastify from "fastify";
import FastifyWebSocket from "fastify-websocket";
import FastifyCookie from "fastify-cookie";
import crypto from "crypto";
import {
	DeviceInfo,
	HttpError,
	BaseRequest,
	BaseResponse,
	SessionRequest,
	ErrorResponse,
	ListResponse
} from "./types";
import { isBaseRequest, isSessionRequest } from "./types.guard";
import { readConfig } from "./config";
import tokenPlugin from "./plugins/token";
import { generateToken, verifyToken } from "./util/token";
import { computeFingerprint, verifyChallengeReponse } from "./util/crypto";
import { REPL_MODE_SLOPPY } from "repl";

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

	let publicKey: crypto.KeyObject;
	try {
		publicKey = crypto.createPublicKey(body.publicKey);
	}
	catch (err) {
		throw new HttpError(401, "Invalid public key");
	}

	verifyChallengeReponse(publicKey, body.challengeResponse);
	const fingerprint = computeFingerprint(publicKey);

	const token = generateToken({
		fingerprint,
		name: body.name
	}, config);
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

	onlineDevices.set(fingerprint, { name });

	connection.socket.on("message", message => {
		// assign a default value
		let response: BaseResponse = {
			type: "request",
			success: true
		};
		try {
			const rawData = JSON.parse(message.toString());
			// check type
			if (!isBaseRequest(rawData)) {
				throw new Error("Invalid request");
			}


			const baseRequest = rawData as BaseRequest;
			response.type = baseRequest.type;

			switch (baseRequest.type) {
				case "list":
					const devices = Array.from(onlineDevices.entries())
						.map(([fingerprint, info]) => ({
							name: info.name,
							fingerprint
						}));
					response = {
						...response,
						devices
					} as ListResponse;
					break;
				case "pair":
					// TODO: sent public key to prepare for pairing
					break;
				case "send":
					// TODO
					break;
				default:
					throw new Error("Invalid request type");
			}
		}
		catch (err) {
			response = {
				...response,
				success: false,
				error: `Error: ${(err as Error).message}`
			} as ErrorResponse;
		}
		connection.socket.send(response);
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
