import { Device, PairEvent } from "../types/server";
import { atom, selector } from "recoil";
import { hasDevice } from "../utils/device";
import { localStorageEffect } from "./effects";

export const onlineDeviceListState = atom<Device[]>({
	key: "OnlineDeviceList",
	default: []
});

export const pairedDeviceListState = atom<Required<Device>[]>({
	key: "PairedDeviceList",
	default: [],
	effects: [
		localStorageEffect("pairedDeviceList")
	]
});

/// Add new device to paired device list and returns the new list
export function addPairedDevice(pairedDeviceList: Required<Device>[], device: Required<Device>) {
	if (hasDevice(pairedDeviceList, device)) {
		return pairedDeviceList;
	}
	return [...pairedDeviceList, device];
}

/// Remove device from paired device list and returns the new list
export function removePairedDevice(pairedDeviceList: Required<Device>[], device: Required<Device>) {
	return pairedDeviceList.filter(d => d.deviceId !== device.deviceId);
}

/// Remove paired devices from device list
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
});

export const incomingRequestListState = atom<Required<PairEvent>[]>({
	key: "incomingRequestList",
	default: [],
	effects: [
		localStorageEffect("incomingRequestList")
	]
});

export const outgoingRequestListState= atom<PairEvent[]>({
	key: "outgoingRequestList",
	default: [],
	effects: [
		localStorageEffect("outgoingRequestList")
	]
});
