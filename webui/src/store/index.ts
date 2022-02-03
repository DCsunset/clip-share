import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./app";

const store = configureStore({
	reducer: {
		app: appReducer
	}
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;
