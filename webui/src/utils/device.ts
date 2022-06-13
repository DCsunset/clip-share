import { Device } from "../types/server";

/// Helper function to check if list contains device
export function hasDevice(deviceList: Device[], device: Device) {
	return deviceList.findIndex(d => d.deviceId === device.deviceId) !== -1;
}

export function displayId(id: string) {
	return id.substring(0, 17);
}
