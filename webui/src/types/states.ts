import { ListResponse, PairEvent } from "../types/types";

export type Device = PairEvent;
export type DeviceList = ListResponse;
export type OutgoingRequest = {
	deviceId: string,
	// Timestamp of expiration date
	expires: number
};
