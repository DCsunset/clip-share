import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { DeviceType, Notification } from "../types/app";
import { ListResponse, PairEvent } from "../types/types";
import { genKeyPairs } from "./async-actions";

export type NewNotification = Omit<Notification, "id">;
export type SocketStatus = "disconnected" | "connecting" | "connected";
export type PairingDevice = {
	deviceId: string;
	timeout: number;
};

export type AppState = {
	notifications: Notification[];
	showDevices: {
		paired: boolean,
		new: boolean
	};
	socketStatus: SocketStatus;
	onlineDevices: ListResponse;
	// waiting for response
	pairingDevices: PairingDevice[];
	receivedPairEvents: PairEvent[];
};

const initialState = {
	notifications: [],
	showDevices: {
		paired: true,
		new: true
	},
	socketStatus: "disconnected",
	onlineDevices: [],
	pairingDevices: [],
	receivedPairEvents: []
} as AppState;

const createNotification = (payload: NewNotification) => ({
	...payload,
	id: new Date().toISOString()
});

const handleError = (state: typeof initialState, action: any) => {
	const error = action.error;
	let message: string;
	message = (error as Error).message;
	state.notifications.push(createNotification({
		color: "error",
		text: message
	}));
};

const appSlice = createSlice({
	name: "app",
	initialState,
	reducers: {
		addNotification(state, action: PayloadAction<NewNotification>) {
			state.notifications.push(createNotification(action.payload));
		},
		// remove the first notification
		removeNotification(state, action: PayloadAction<string>) {
			_.remove(state.notifications, e => e.id === action.payload);
		},
		
		addPairingDevice(state, action: PayloadAction<PairingDevice>) {
			const index = state.pairingDevices.findIndex(
				d => d.deviceId === action.payload.deviceId
			);
			if (index === -1)
				state.pairingDevices.push(action.payload);
			else
				state.pairingDevices[index].timeout = action.payload.timeout;

			// remove time-out devices
			const currentTimestamp = Date.now();
			_.remove(state.pairingDevices, e => e.timeout < currentTimestamp);
		},
		// remove by deviceId
		removePairingDevices(state, action: PayloadAction<string[]>) {
			const currentTimestamp = Date.now();
			_.remove(state.pairingDevices, e => (
				e.timeout < currentTimestamp
				|| (action.payload.includes(e.deviceId))
			));
		},
		addReceivedPairEvent(state, action: PayloadAction<PairEvent>) {
			// remove duplicates
			_.remove(state.receivedPairEvents, e => e.deviceId === action.payload.deviceId);
			state.receivedPairEvents.push(action.payload);
		},
		// remove by deviceId
		removeReceivedPairEvents(state, action: PayloadAction<string[]>) {
			_.remove(state.receivedPairEvents, e => (
				action.payload.includes(e.deviceId)
			));
		},
		
		setShowDevices(state, action: PayloadAction<{
			type: DeviceType,
			value: boolean
		}>) {
			state.showDevices[action.payload.type] = action.payload.value;
		},

		setOnlineDevices(state, action: PayloadAction<ListResponse>) {
			state.onlineDevices = action.payload;
		},

		setSocketStatus(state, action: PayloadAction<SocketStatus>) {
			state.socketStatus = action.payload;
		}
	},
	extraReducers(builder) {
		// initSettings
		builder.addCase(genKeyPairs.rejected, handleError);
	}
});

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
