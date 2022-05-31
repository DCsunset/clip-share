import { Device, PairEvent } from "../types/server";
import { atom, selector } from "recoil";

export const onlineDeviceListState = atom<Device[]>({
	key: "OnlineDeviceList",
	default: []
});

export type OutgoingRequest = {
	deviceId: string,
	// Timestamp of expiration date
	expires: number
};
export const outgoingRequestListState = atom<OutgoingRequest[]>({
	key: "OutgoingRequestList",
	default: []
});

export const incomingRequestListState = atom<PairEvent[]>({
	key: "IncomingRequestList",
	default: []
});

export const pairedDeviceListState = atom<Required<Device>[]>({
	key: "PairedDeviceList",
	default: []
});

export const newDeviceListState = selector({
	key: "NewDeviceList",
	get: ({ get }) => {
		const onlineDevices = get(onlineDeviceListState);
		const pairedDevices = get(pairedDeviceListState);

		// filter out paired devices
		return onlineDevices.filter(device => (
			pairedDevices.findIndex(({ deviceId }) => {
				device.deviceId === deviceId
			}) === -1
		));
	}
})

export interface LocalDevice extends Device {
	privateKey: string
}
export const localDeviceState = atom<LocalDevice>({
	key: "LocalDevice",
	default: {
		deviceId: "",
		name: "Unnamed",
		privateKey: "",
		publicKey: ""
	}
});

// TODO: add action to add devices (eliminate duplicates)
