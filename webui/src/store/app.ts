import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { Notification } from "../types/app";

export type NewNotification = Omit<Notification, "id">;

const appSlice = createSlice({
	name: "app",
	initialState: {
		notifications: [] as Notification[]
	},
	reducers: {
		addNotification(state, action: PayloadAction<NewNotification>) {
			state.notifications.push({
				...action.payload,
				id: new Date().toISOString()
			});
		},
		// remove the first notification
		removeNotification(state, action: PayloadAction<string>) {
			_.remove(state.notifications, e => e.id === action.payload);
		}
	}
});

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
