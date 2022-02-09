import { configureStore } from "@reduxjs/toolkit";
import { appReducer } from "./app";
import { settingsReducer } from "./settings";

const store = configureStore({
	reducer: {
		app: appReducer,
		settings: settingsReducer
	}
});

function saveState(state: object) {
	try {
		const serializedState = JSON.stringify(state);
		localStorage.setItem("clip-share", serializedState);
	}
	catch (err) {
		console.error(err);
	}
}

let lastModified = new Date().getTime();
store.subscribe(() => {
	const state = store.getState().settings;
	if (lastModified < state.lastModified) {
		lastModified = state.lastModified;
		saveState(state);
	}
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;
