import { Device, PairEvent } from "../types/server";
import { atom, selector } from "recoil";
import { localStorageEffect } from "./effects";
import { configState } from "./config.js";

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

/// Remove paired devices from device list
export const newDeviceListState = selector({
	key: "NewDeviceList",
	get: ({ get }) => {
		const onlineDevices = get(onlineDeviceListState);
		const pairedDevices = get(pairedDeviceListState);
		const config = get(configState);

		// filter out paired devices and local device
		return onlineDevices.filter(device => (
			pairedDevices.findIndex(({ deviceId }) => (
				device.deviceId === deviceId
			)) === -1
				&& device.deviceId !== config.localDevice.deviceId
		));
	}
});

export const incomingRequestListState = atom<PairEvent[]>({
	key: "incomingRequestList",
	default: [],
	effects: [
		localStorageEffect("incomingRequestList")
	]
});

export const outgoingRequestListState = atom<PairEvent[]>({
	key: "outgoingRequestList",
	default: [],
	effects: [
		localStorageEffect("outgoingRequestList")
	]
});

export type DeviceData = {
	[id: string]: {
		/// Received clip
		clip: string
	} | undefined
};

export const deviceDataState = atom<DeviceData>({
	key: "deviceData",
	default: {}
});

export const setDeviceClip = (deviceData: DeviceData, deviceId: string, clip: string) => {
	const data = deviceData[deviceId];
	return {
		...deviceData,
		[deviceId]: {
			...data,
			clip
		}
	};
};
