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


/**
 * Message Type for communication
 * (handle multiple requests at the same time)
 * 
 * @see {isMessageType} ts-auto-guard:type-guard
 */
export type MessageType = "pair" | "list" | "share";

/**
 * Error Type
 * 
 * @see {ErrorType} ts-auto-guard:type-guard
 */
export type ErrorType = "request" | "response" | "message" | "internal";


/**
 * BaseRequest used in WebSocket communication
 * 
 * @see {isBaseRequest} ts-auto-guard:type-guard
 */
export interface BaseRequest {
	type: MessageType;
};

/**
 * Request to pair a specific device
 * 
 * @see {isPairRequest} ts-auto-guard:type-guard
 */
export interface PairRequest extends BaseRequest {
	/// the device to pair (fingerprint)
	device: string;
	/// device name
	name: string;
	/// sender's public key for e2ee
	publicKey: string;
}

export class WebSocketError extends Error {
	constructor(public type: MessageType | ErrorType, message: string) {
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
	type: MessageType | ErrorType;
	success: boolean;
	error?: string;
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
	/// receiver (fingerprint)
	device: string;
	/// sender's public key
	publicKey?: string;
};
