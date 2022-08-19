/**
 * Server config
 * 
 * @see {isConfig} ts-auto-guard:type-guard
 */
export type Config = {
	bufferSize: {
		[type in EventType]: number
	}	
};

export type DeviceState = {
	name: string,
	/// socket.io connection
	socketId: string
};

/**
 * Event types to buffer at server
 */
export type EventType = "share" | "unpair";

/**
 * Buffer shared data
 */
export type EventBuffer = {
	[type in EventType]: any[];
};

/**
 * Auth request to initialize a connection
 * 
 * @see {isAuthRequest} ts-auto-guard:type-guard
 */
export type AuthRequest = {
	// OpenPGP armored public key (userID not used)
	publicKey: string,
	// signed challenge string (OpenPGP message format)
	challenge: string,
	// name of the device
	name: string
};

/**
 * Device
 * 
 * @see {isDevice} ts-auto-guard:type-guard
 */
export type Device = {
	/// the device id (fingerprint)
	deviceId: string,
	/// device name
	name: string,
	/// public key for e2ee
	publicKey?: string
}

/**
 * Pair Event
 * 
 * Name and deviceId are the device to pair.
 * Only publicKey belongs to the sender.
 * 
 * @see {isPairEvent} ts-auto-guard:type-guard
 */
export interface PairEvent extends Required<Device> {
	/**
	 * Timestamp of expiration date (ISO string)
	 * (accepting the request doesn't need the expiry date)
	 */
	expiryDate?: string
};

/**
 * Unpair Event
 * 
 * @see {isUnpairEvent} ts-auto-guard:type-guard
 */
export interface UnpairEvent {
	deviceId: string,
	name: string
};



/**
 * Data types shared between devices
 */
export type DataType = "clip" | "notification";

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

/**
 * Error code
 */
export enum ErrCode {
	InvalidRequest,
	AuthFailure,
	SocketIdUsed,
	DeviceAlreadyOnline,
	DeviceOffline,
	DeviceNameMismatched,
	InternalError
};

export type ErrEvent = {
	code: ErrCode,
	// Error from device
	device?: Device
};

export class EventError extends Error {
	constructor(private code: ErrCode, private device?: Device) {
		super();
	}

	toErrEvent() {
		return {
			code: this.code,
			device: this.device
		};
	}
}
