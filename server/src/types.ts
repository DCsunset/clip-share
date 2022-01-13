import crypto from "crypto";

export class HttpError extends Error {
	constructor(public statusCode: number, message: string) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
	}
};

/**
 * Server config
 * 
 * @see {isConfig} ts-auto-guard:type-guard
 */
export type Config = {
	// name of jwt token in cookie
	jwt: {
		cookieName: string;
		// Use to sign token
		secret: string;
		maxAgeInDays: number;
	}
};

export type DeviceInfo = {
	name: string;
	// public key (the signature used as identifier)
	key: crypto.KeyObject;
};

/**
 * Requst to create a session (log in)
 * 
 * @see {isSessionRequest} ts-auto-guard:type-guard
 */
export type SessionRequest = {
	// device name
	name: string;
	publicKey: string;
	// Sign the challenge string (base64)
	challengeResponse: string;
	// Use cookie or return the token directly
	cookie?: boolean;
};

/** @see {isRequestType} ts-auto-guard:type-guard */
export type RequestType = "pair" | "list" | "send";

/**
 * Request used in WebSocket communication
 * 
 * @see {isRequest} ts-auto-guard:type-guard
 */
export type Request = {
	type: RequestType;
	data?: string;
};

/**
 * Response used in WebSocket communication
 * 
 * @see {isResponse} ts-auto-guard:type-guard
 */
export type Response = {
	success: boolean;
	data?: string;
};
