import { Device } from "../types/server";

/// Helper function to check if list contains device
export function hasDevice(deviceList: Device[], device: Device) {
	return deviceList.findIndex(d => d.deviceId === device.deviceId) !== -1;
}
