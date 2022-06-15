/*
 * Generated type guards for "types.ts".
 * WARNING: Do not manually change this file.
 */
import { Config, AuthRequest, Device, PairEvent, ShareEvent } from "./types";

export function isConfig(obj: any, _argumentName?: string): obj is Config {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        (obj.bufferSize !== null &&
            typeof obj.bufferSize === "object" ||
            typeof obj.bufferSize === "function") &&
        typeof obj.bufferSize.clipboard === "number" &&
        typeof obj.bufferSize.notification === "number"
    )
}

export function isAuthRequest(obj: any, _argumentName?: string): obj is AuthRequest {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        typeof obj.publicKey === "string" &&
        typeof obj.challenge === "string" &&
        typeof obj.name === "string"
    )
}

export function isDevice(obj: any, _argumentName?: string): obj is Device {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        typeof obj.deviceId === "string" &&
        typeof obj.name === "string" &&
        (typeof obj.publicKey === "undefined" ||
            typeof obj.publicKey === "string")
    )
}

export function isPairEvent(obj: any, _argumentName?: string): obj is PairEvent {
    return (
        isDevice(obj) as boolean &&
        typeof obj.expiryDate === "string"
    )
}

export function isShareEvent(obj: any, _argumentName?: string): obj is ShareEvent {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        typeof obj.deviceId === "string" &&
        (obj.data !== null &&
            typeof obj.data === "object" ||
            typeof obj.data === "function") &&
        (obj.data.type === "clipboard" ||
            obj.data.type === "notification") &&
        typeof obj.data.content === "string"
    )
}
