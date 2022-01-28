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
export type MessageType = "pair" | "list" | "share" | "error";

/**
 * BaseMessage used in WebSocket communication
 * 
 * @see {isBaseMessage} ts-auto-guard:type-guard
 */
export interface BaseMessage {
	type: MessageType;
	success: boolean;
	error?: string;
};

/**
 * Response for list request
 * 
 * @see {isListResponse} ts-auto-guard:type-guard
 */
export interface ListResponse extends BaseMessage {
	devices: {
		name: string,
		fingerprint: string
	}[];
};

/**
 * Message to pair a specific device
 * (request and reponse share the same type)
 * 
 * @see {isPairMessage} ts-auto-guard:type-guard
 */
export interface PairMessage extends BaseMessage {
	/// the device to pair (fingerprint)
	device: string;
	/// device name
	name: string;
	/// sender's public key for e2ee
	publicKey?: string;
}

/**
 * Request to share message
 * (request and reponse share the same type)
 * 
 * @see {isShareMessage} ts-auto-guard:type-guard
 */
export interface ShareMessage extends BaseMessage {
	/// the device to share (fingerprint)
	device: string;
	/// e2e encrypted message
	message: string;
}

export class WebSocketError extends Error {
	constructor(public type: MessageType, message: string) {
		super(message);
		this.type = type;
	}
};
