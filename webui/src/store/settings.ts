import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { DeviceInfo } from "../types/settings";
import { genKeyPairs } from "./async-actions";

export type SettingsState = {
	deviceInfo: Required<DeviceInfo>;
	pairedDevices: DeviceInfo[];
	serverUrl: string;
	// reconnection config for socket.io
	reconnectionDelayMax: number,
	// interval for fetching device list
	fetchingInterval: number,
	lastModified: number;
};

function loadState() {
	const serializedState = localStorage.getItem("clip-share");
	if (serializedState === null)
		return null;
	return JSON.parse(serializedState);
}

// Initialize when no persistent state
const initialState: SettingsState = {
	// keys should be initialized by calling genKeyPairs()
	deviceInfo: {
		id: "",
		name: "Unnamed",
		privateKey: "",
		publicKey: ""
	},
	pairedDevices: [],
	serverUrl: "",
	reconnectionDelayMax: 5000,
	fetchingInterval: 3000,
	// timestamp
	lastModified: new Date().getTime(),

	// Use loaded state to overwrite default ones
	// useful for introducing new settings without breaking
	...loadState()
} as SettingsState;

const settingsSlice = createSlice({
	name: "settings",
	initialState,
	reducers: {
		update(state, action: PayloadAction<Partial<SettingsState>>) {
			Object.assign(state, action.payload);
			state.lastModified = new Date().getTime();
		},

		addPairedDevices(state, action: PayloadAction<DeviceInfo[]>) {
			state.pairedDevices.push(...action.payload);
			state.lastModified = new Date().getTime();
		},
		removePairedDevices(state, action: PayloadAction<number[]>) {
			_.pullAt(state.pairedDevices, action.payload);
			state.lastModified = new Date().getTime();
		}
	},
	extraReducers(builder) {
		// initSettings
		builder.addCase(genKeyPairs.fulfilled, (state, action) => {
			const { publicKey, privateKey, fingerprint } = action.payload;
			Object.assign(state.deviceInfo, {
				id: fingerprint,
				publicKey,
				privateKey
			});
			state.lastModified = new Date().getTime();
		});
	}
});

export const settingsActions = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
