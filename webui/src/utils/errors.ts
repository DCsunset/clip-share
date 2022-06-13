import { ErrCode, ErrEvent } from "../types/server";
import { displayId } from "./device";

export function errorToString(err: ErrEvent) {
	switch (err.code) {
		case ErrCode.InvalidRequest:
			return "invalid requests";
		case ErrCode.AuthFailure:
			return "failed to authenticate";
		case ErrCode.SocketIdUsed:
			return "socket id already used";
		case ErrCode.DeviceAlreadyOnline:
			return "current device already online";
		case ErrCode.DeviceOffline: {
			const { name, deviceId } = err.device!;
			return `device ${name} (${displayId(deviceId)}) not online`;
		}
		case ErrCode.DeviceNameMismatched: {
			const { name, deviceId } = err.device!;
			return `device name ${name} mismatched ${displayId(deviceId)})`;
		}
		case ErrCode.InternalError:
			return "internal server error";
		default:
			return "unknown error";
	}
}
