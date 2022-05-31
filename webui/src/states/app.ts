import { atom } from "recoil";
import { AlertColor } from "@mui/material";

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
