/*
 * Generated type guards for "types.ts".
 * WARNING: Do not manually change this file.
 */
import { Config, SessionRequest, MessageType, BaseMessage, ListResponse, PairMessage, ShareMessage } from "./types";

export function isConfig(obj: any, _argumentName?: string): obj is Config {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        (obj.jwt !== null &&
            typeof obj.jwt === "object" ||
            typeof obj.jwt === "function") &&
        typeof obj.jwt.cookieName === "string" &&
        typeof obj.jwt.secret === "string" &&
        typeof obj.jwt.maxAgeInDays === "number"
    )
}

export function isSessionRequest(obj: any, _argumentName?: string): obj is SessionRequest {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        typeof obj.publicKey === "string" &&
        typeof obj.challengeResponse === "string" &&
        (typeof obj.cookie === "undefined" ||
            obj.cookie === false ||
            obj.cookie === true)
    )
}

export function isMessageType(obj: any, _argumentName?: string): obj is MessageType {
    return (
        (obj === "pair" ||
            obj === "list" ||
            obj === "share" ||
            obj === "error")
    )
}

export function isBaseMessage(obj: any, _argumentName?: string): obj is BaseMessage {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isMessageType(obj.type) as boolean &&
        typeof obj.success === "boolean" &&
        (typeof obj.error === "undefined" ||
            typeof obj.error === "string")
    )
}

export function isListResponse(obj: any, _argumentName?: string): obj is ListResponse {
    return (
        isBaseMessage(obj) as boolean &&
        Array.isArray(obj.devices) &&
        obj.devices.every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            typeof e.name === "string" &&
            typeof e.fingerprint === "string"
        )
    )
}

export function isPairMessage(obj: any, _argumentName?: string): obj is PairMessage {
    return (
        isBaseMessage(obj) as boolean &&
        typeof obj.device === "string" &&
        typeof obj.name === "string" &&
        (typeof obj.publicKey === "undefined" ||
            typeof obj.publicKey === "string")
    )
}

export function isShareMessage(obj: any, _argumentName?: string): obj is ShareMessage {
    return (
        isBaseMessage(obj) as boolean &&
        typeof obj.device === "string" &&
        typeof obj.message === "string"
    )
}
