import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { DeviceInfo } from "../types/settings";
import { initSettings } from "./async-actions";

export type SettingsState = {
	deviceInfo: Required<DeviceInfo>,
	// JWT token
	token: string | null,
	pairedDevices: DeviceInfo[],
	server: {
		address: string;
		pathPrefix: string;
		tls: boolean;
	};
	lastModified: number;
};

function loadState() {
	const serializedState = localStorage.getItem("clip-share");
	if (serializedState === null)
		return null;
	return JSON.parse(serializedState);
}

// Initialize when no persistent state
const initialState: SettingsState = loadState() || {
	// keys should be initialized by calling initSettings()
	deviceInfo: {
		name: "",
		privateKey: "",
		publicKey: ""
	},
	token: null,
	pairedDevices: [],
	// server
	server: {
		// empty means not set
		address: "",
		pathPrefix: "",
		tls: false
	},
	// timestamp
	lastModified: new Date().getTime()
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
		builder.addCase(initSettings.fulfilled, (state, action) => {
			const { publicKey, privateKey } = action.payload;
			Object.assign(state.deviceInfo, { publicKey, privateKey });
		});
	}
});

// Selectors
export const selectServerBaseUrl = (protocol: "http" | "ws") => (state: SettingsState) => {
	const finalProtocol = `${protocol}${state.server.tls ? "s" : ""}`;
	const url = new URL(`${finalProtocol}://${state.server.address}`);
	url.pathname = state.server.pathPrefix;
	return url.href;
};

export const settingsActions = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
