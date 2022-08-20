/**
 * Copyright (C) 2022 DCsunset
 * See full notice in README.md in this project
 */

import { ErrCode } from "./types";

const errorMessageMap = new Map([
	[ErrCode.InvalidRequest, "invalid request"],
	[ErrCode.AuthFailure, "authentification failed"],
	[ErrCode.SocketIdUsed, "socket id already used"],
	[ErrCode.DeviceAlreadyOnline, "device already online"],
	[ErrCode.DeviceOffline, "device offline"],
	[ErrCode.DeviceNameMismatched, "device name mismatched"],
	[ErrCode.InternalError, "internal server error"]
]);

export function errorMessage(code: ErrCode) {
	return errorMessageMap.get(code) ?? "unknown error";
}
