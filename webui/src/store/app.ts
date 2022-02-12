import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { DeviceType, Notification } from "../types/app";
import { DeviceInfo } from "../types/settings";
import { ListResponse } from "../types/types";
import { initSettings } from "./async-actions";

export type NewNotification = Omit<Notification, "id">;

const initialState = {
	notifications: [] as Notification[],
	showDevices: {
		"paired": true,
		"new": true
	},
	onlineDevices: [] as ListResponse["devices"]
};

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
		
		setShowDevices(state, action: PayloadAction<{
			type: DeviceType,
			value: boolean
		}>) {
			state.showDevices[action.payload.type] = action.payload.value;
		},
		setOnlineDevices(state, action: PayloadAction<ListResponse["devices"]>) {
			state.onlineDevices = action.payload;
		}
	},
	extraReducers(builder) {
		// initSettings
		builder.addCase(initSettings.rejected, handleError);
	}
});

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
