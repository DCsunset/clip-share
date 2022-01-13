/*
 * Generated type guards for "types.ts".
 * WARNING: Do not manually change this file.
 */
import { Config, SessionRequest, RequestType, Request, Response } from "./types";

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
        typeof obj.name === "string" &&
        typeof obj.publicKey === "string" &&
        typeof obj.challengeResponse === "string" &&
        (typeof obj.cookie === "undefined" ||
            obj.cookie === false ||
            obj.cookie === true)
    )
}

export function isRequestType(obj: any, _argumentName?: string): obj is RequestType {
    return (
        (obj === "pair" ||
            obj === "list" ||
            obj === "send")
    )
}

export function isRequest(obj: any, _argumentName?: string): obj is Request {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isRequestType(obj.type) as boolean &&
        (typeof obj.data === "undefined" ||
            typeof obj.data === "string")
    )
}

export function isResponse(obj: any, _argumentName?: string): obj is Response {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        typeof obj.success === "boolean" &&
        (typeof obj.data === "undefined" ||
            typeof obj.data === "string")
    )
}
