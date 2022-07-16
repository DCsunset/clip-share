import { atom } from "recoil";
import { createContext } from "react";
import { AlertColor } from "@mui/material";
import { Socket } from "socket.io-client";

export type Notification = {
	color: AlertColor,
	message: string
};

export const notificationState = atom<Notification | null>({
	key: "Notification",
	default: null
});

export type SocketStatus = "disconnected" | "connecting" | "connected";

export const socketStatusState = atom<SocketStatus>({
	key: "SocketStatus",
	default: "disconnected"
});

/**
 * Use ctx for socket
 * because recoil state allows only read-only access to its fields
 */
export const SocketCtx = createContext<Socket | null>(null);
