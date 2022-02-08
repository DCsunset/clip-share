import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./app";
import { settingsReducer } from "./settings";

const store = configureStore({
	reducer: {
		app: appReducer,
		settings: settingsReducer
	}
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;
