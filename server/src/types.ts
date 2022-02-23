/**
 * Server config
 * 
 * @see {isConfig} ts-auto-guard:type-guard
 */
export type Config = {
	bufferSize: {
		clipboard: number,
		notification: number
	}	
};

export type DeviceState = {
	name: string;
	// socket.io connection
	socketId: string;
};

/* Data type shared between devices
 * 2 types of data:
 *  clipboard
 *  notification
 */
export type DataType = "clipboard" | "notification";

/**
 * Buffer shared data
 */
export type DataBuffer = {
	[type in DataType]: {
		from: string;
		content: string;
	}[];
};

/**
 * Auth request to initialize a connection
 * 
 * @see {isAuthRequest} ts-auto-guard:type-guard
 */
export type AuthRequest = {
	// OpenPGP armored public key (userID not used)
	publicKey: string;
	// signed challenge string (OpenPGP message format)
	challenge: string;
	// name of the device
	name: string;
};

/**
 * Response for list request
 * 
 * @see {isListResponse} ts-auto-guard:type-guard
 */
export type ListResponse = {
	id: string,
	name: string
}[];

/**
 * Event to pair a specific device
 * (request and response share the same type)
 * 
 * @see {isPairEvent} ts-auto-guard:type-guard
 */
export interface PairEvent {
	/// the device to pair (fingerprint)
	deviceId: string;
	/// device name
	name: string;
	/// sender's public key for e2ee
	publicKey?: string;
};

/**
 * Event to share data
 * (request and response share the same type)
 * 
 * @see {isShareEvent} ts-auto-guard:type-guard
 */
export interface ShareEvent {
	/// the device to share from or to
	deviceId: string;
	/// e2e encrypted message
	data: {
		type: DataType;
		content: string;
	}
};
