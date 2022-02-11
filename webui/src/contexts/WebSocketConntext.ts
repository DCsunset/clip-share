import { createContext } from "react";

export type WebSocketContextType = {
	ws: WebSocket | null;
	setWs: (ws: WebSocket | null) => void
};

export const WebSocketContext = createContext({
	ws: null,
	setWs: () => {}
} as WebSocketContextType);
