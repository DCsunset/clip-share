import { Device } from "../types/server";

/// Check if a list contains device
export function hasDevice(deviceList: Device[], device: Device) {
	return deviceList.findIndex(d => d.deviceId === device.deviceId) !== -1;
}

/// Add device to a list (return a new list)
export function addDevice<T extends Device>(deviceList: T[], device: T) {
	if (hasDevice(deviceList, device)) {
		return deviceList;
	}
	return [...deviceList, device];
}

/// Remove device from a list (return a new list)
export function removeDevice<T extends Device>(deviceList: T[], device: T) {
	return deviceList.filter(d => d.deviceId !== device.deviceId);
}
