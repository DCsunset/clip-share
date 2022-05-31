import { atom } from "recoil";

export const pairedDeviceListState = atom<Device[]>({
	key: "PairedDeviceList",
	default: []
});

export type Config = {
	serverUrl: string,
	reconnectionDelayMax: number,
	fetchingInterval: number,
};

export const configState = atom<Config>({
	key: "Config",
	default: {
		serverUrl: "",
		reconnectionDelayMax: 5000,
		fetchingInterval: 3000,
	}
});
