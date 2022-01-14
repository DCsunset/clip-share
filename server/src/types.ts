import crypto from "crypto";

/**
 * Payload of the token
 */
export interface TokenPayload {
	fingerprint: string;
	name: string;
}

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
	// public key (the fingerprint used as identifier)
	key?: crypto.KeyObject;
};

/**
 * Requst to create a session (log in)
 * 
 * @see {isSessionRequest} ts-auto-guard:type-guard
 */
export type SessionRequest = {
	// OpenPGP armored public key (userID as device name)
	publicKey: string;
	// Sign the challenge string (OpenPGP message format)
	challengeResponse: string;
	// Use cookie or return the token directly
	cookie?: boolean;
};

/** @see {isRequestType} ts-auto-guard:type-guard */
export type RequestType = "pair" | "list" | "send";

/**
 * BaseRequest used in WebSocket communication
 * 
 * @see {isBaseRequest} ts-auto-guard:type-guard
 */
export interface BaseRequest {
	type: RequestType;
};

/**
 * Request to pair a specific device
 * 
 * @see {isPairRequest} ts-auto-guard:type-guard
 */
export interface PairRequest extends BaseRequest {
	/// the device to pair
	device: string;
	/// public key for e2ee
	publicKey: string;
}


/**
 * ResponseType is necessary for multiplexing
 * (handle multiple requests at the same time)
 * 
 * @see {isResponseType} ts-auto-guard:type-guard
 */
export type ResponseType = "pair" | "list" | "send" | "request";

/**
 * BaseResponse used in WebSocket communication
 * 
 * @see {isBaseResponse} ts-auto-guard:type-guard
 */
export interface BaseResponse {
	type: ResponseType;
	success: boolean;
};

/**
 * Response for errors
 * 
 * @see {isErrorResponse} ts-auto-guard:type-guard
 */
export interface ErrorResponse extends BaseResponse {
	error: string;
};


/**
 * Response for ListRequest
 * 
 * @see {isListResponse} ts-auto-guard:type-guard
 */
export interface ListResponse extends BaseResponse {
	devices: {
		name: string,
		fingerprint: string
	}[];
};
