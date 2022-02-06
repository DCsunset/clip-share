import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { DeviceInfo } from "../types/settings";

const settingsSlice = createSlice({
	name: "settings",
	initialState: {
		deviceInfo: null as (DeviceInfo | null),
		pairedDevices: [] as DeviceInfo[],
		// server address
		server: null as (string | null)
	},
	reducers: {
		setServer(state, action: PayloadAction<string | null>) {
			state.server = action.payload;
		},

		addPairedDevices(state, action: PayloadAction<DeviceInfo[]>) {
			state.pairedDevices.push(...action.payload);
		},
		removePairedDevices(state, action: PayloadAction<number[]>) {
			_.pullAt(state.pairedDevices, action.payload);
		}
	}
});

export const settingsActions = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
