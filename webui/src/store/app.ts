import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { DeviceType, Notification } from "../types/app";
import { Device, DeviceList, OutgoingRequest } from "../types/states";
import { genKeyPairs } from "./async-actions";

export type NewNotification = Omit<Notification, "id">;
export type SocketStatus = "disconnected" | "connecting" | "connected";

export type AppState = {
	notifications: Notification[];
	showDevices: {
		paired: boolean,
		new: boolean
	};
	socketStatus: SocketStatus;
	onlineDevices: DeviceList;
	outgoingRequests: OutgoingRequest[];
	incomingRequests: Device[];
};

const initialState = {
	notifications: [],
	showDevices: {
		paired: true,
		new: true
	},
	socketStatus: "disconnected",
	onlineDevices: [],
	outgoingRequests: [],
	incomingRequests: []
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
		
		addOutgoingRequest(state, action: PayloadAction<OutgoingRequest>) {
			const index = state.outgoingRequests.findIndex(
				d => d.deviceId === action.payload.deviceId
			);
			if (index === -1)
				state.outgoingRequests.push(action.payload);
			else
				state.outgoingRequests[index].expires = action.payload.expires;

			// remove time-out devices
			const currentTimestamp = Date.now();
			_.remove(state.outgoingRequests, e => e.expires < currentTimestamp);
		},
		// remove by deviceId
		removeOutgoingRequests(state, action: PayloadAction<string[]>) {
			const currentTimestamp = Date.now();
			_.remove(state.outgoingRequests, e => (
				e.expires < currentTimestamp
				|| (action.payload.includes(e.deviceId))
			));
		},
		addIncomingRequest(state, action: PayloadAction<Device>) {
			// remove duplicates
			_.remove(state.incomingRequests, e => e.deviceId === action.payload.deviceId);
			state.incomingRequests.push(action.payload);
		},
		// remove by deviceId
		removeIncomingRequests(state, action: PayloadAction<string[]>) {
			_.remove(state.incomingRequests, e => (
				action.payload.includes(e.deviceId)
			));
		},
		
		setShowDevices(state, action: PayloadAction<{
			type: DeviceType,
			value: boolean
		}>) {
			state.showDevices[action.payload.type] = action.payload.value;
		},

		setOnlineDevices(state, action: PayloadAction<DeviceList>) {
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
