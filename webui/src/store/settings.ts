import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { DeviceInfo } from "../types/settings";
import { initSettings } from "./async-actions";

type State = {
	deviceInfo: Required<DeviceInfo>,
	pairedDevices: DeviceInfo[],
	// server address
	server: string;
	lastModified: number;
};

function loadState() {
	const serializedState = localStorage.getItem("clip-share");
	if (serializedState === null)
		return null;
	return JSON.parse(serializedState);
}

// Initialize when no persistent state
const initialState: State = loadState() || {
	// keys should be initialized by calling initSettings()
	deviceInfo: {
		name: "",
		privateKey: "",
		publicKey: ""
	},
	pairedDevices: [],
	// server address
	server: "",
	// timestamp
	lastModified: new Date().getTime()
} as State;

const settingsSlice = createSlice({
	name: "settings",
	initialState,
	reducers: {
		update(state, action: PayloadAction<Partial<State>>) {
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

export const settingsActions = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
