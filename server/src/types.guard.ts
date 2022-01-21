/*
 * Generated type guards for "types.ts".
 * WARNING: Do not manually change this file.
 */
import { Config, SessionRequest, RequestType, BaseRequest, PairRequest, ResponseType, BaseResponse, ErrorResponse, ListResponse, PairResponse } from "./types";

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

export function isRequestType(obj: any, _argumentName?: string): obj is RequestType {
    return (
        (obj === "pair" ||
            obj === "list" ||
            obj === "send")
    )
}

export function isBaseRequest(obj: any, _argumentName?: string): obj is BaseRequest {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isRequestType(obj.type) as boolean
    )
}

export function isPairRequest(obj: any, _argumentName?: string): obj is PairRequest {
    return (
        isBaseRequest(obj) as boolean &&
        typeof obj.device === "string" &&
        typeof obj.publicKey === "string"
    )
}

export function isResponseType(obj: any, _argumentName?: string): obj is ResponseType {
    return (
        (obj === "pair" ||
            obj === "list" ||
            obj === "send" ||
            obj === "request" ||
            obj === "internal")
    )
}

export function isBaseResponse(obj: any, _argumentName?: string): obj is BaseResponse {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        isResponseType(obj.type) as boolean &&
        typeof obj.success === "boolean"
    )
}

export function isErrorResponse(obj: any, _argumentName?: string): obj is ErrorResponse {
    return (
        isBaseResponse(obj) as boolean &&
        typeof obj.error === "string"
    )
}

export function isListResponse(obj: any, _argumentName?: string): obj is ListResponse {
    return (
        isBaseResponse(obj) as boolean &&
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

export function isPairResponse(obj: any, _argumentName?: string): obj is PairResponse {
    return (
        isBaseResponse(obj) as boolean &&
        typeof obj.name === "string" &&
        typeof obj.publicKey === "string"
    )
}
