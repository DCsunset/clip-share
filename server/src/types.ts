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
	name: string,
	/// socket.io connection
	socketId: string,
	publicKey: string
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
export interface PairEvent extends Device {
	/// Timestamp of expiration date (ISO string)
	expiryDate: string
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
