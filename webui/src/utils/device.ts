/**
 * Copyright (C) 2022 DCsunset
 * See full notice in README.md in this project
 */

import { Device } from "../types/server";

/// Find a device in list (returns object)
export function findDevice<T extends Device>(deviceList: T[], device: Device) {
	const index = deviceList.findIndex(d => d.deviceId === device.deviceId);
	return index === -1 ? null : deviceList[index];
}

/// Check if a list contains device
export function hasDevice(deviceList: Device[], device: Device) {
	return findDevice(deviceList, device) !== null;
}

/// Add device to a list (return a new list)
export function addDevice<T extends Device>(deviceList: T[], device: T) {
	// remove old devices first
	return [...removeDevice(deviceList, device), device];
}

/// Remove device from a list (return a new list)
export function removeDevice<T extends Device>(deviceList: T[], device: Device) {
	return deviceList.filter(d => d.deviceId !== device.deviceId);
}
