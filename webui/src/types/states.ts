import { ListResponse, PairEvent } from "./server";

export type Device = PairEvent;
export type DeviceList = ListResponse;
export type OutgoingRequest = {
	deviceId: string,
	// Timestamp of expiration date
	expires: number
};
