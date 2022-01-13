import Fastify from "fastify";
import FastifyWebSocket from "fastify-websocket";
import FastifyCookie from "fastify-cookie";
import crypto from "crypto";
import { DeviceInfo, HttpError, Request, Response, SessionRequest } from "./types";
import { isRequest, isSessionRequest } from "./types.guard";
import { readConfig } from "./config";
import tokenPlugin from "./plugins/token";
import { generateToken, verifyToken } from "./util/token";
import { computeFingerprint, verifyChallengeReponse } from "./util/crypto";

const config = readConfig();

const fastify = Fastify({
	logger: true
});
fastify.register(FastifyWebSocket);
fastify.register(FastifyCookie);
fastify.register(tokenPlugin, {
	cookieName: config.jwt.cookieName
});

// Server state
const onlineDevices: Map<string, DeviceInfo> = new Map();
// Unsent clipboard data (wait until device online)
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

	onlineDevices.set(fingerprint, {
		name: body.name,
		key: publicKey
	});

	const token = generateToken({ fingerprint }, config);
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
	if (verifyToken(req.token, config)) {
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
	if (!verifyToken(req.token, config)) {
		throw new HttpError(401, "Unauthorized");
	}

	connection.socket.on("message", message => {
		try {
			const rawData = JSON.parse(message.toString());
			// check type
			if (!isRequest(rawData)) {
				throw new Error("Invalid request");
			}

			// TODO
			const request = rawData as Request;
			switch (request.type) {
				case "list":
					break;
				case "pair":
					break;
				case "send":
					break;
			}
		}
		catch (err) {
			const errMsg = `Error: ${(err as Error).message}`;
			connection.socket.send({
				success: false,
				data: errMsg
			} as Response);
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
