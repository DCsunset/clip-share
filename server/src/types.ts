import { WebSocket } from "ws";

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
	// websocket connection
	websocket: WebSocket;
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
	/// the device to pair (fingerprint)
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
export type ResponseType = "pair" | "list" | "send" | "request" | "internal";

export class WebSocketError extends Error {
	constructor(public type: ResponseType, message: string) {
		super(message);
		this.type = type;
	}
};


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

/**
 * Response for ListRequest
 * 
 * @see {isPairResponse} ts-auto-guard:type-guard
 */
export interface PairResponse extends BaseResponse {
	/// the other pairing device
	name: string;
	/// public key from the other device
	publicKey: string;
};
