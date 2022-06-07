import { atom } from "recoil";
import { Device } from "../types/server";
import { generateKeyPairs } from "../utils/crypto";

export interface LocalDevice extends Required<Device> {
	privateKey: string
}

export type Config = {
	localDevice: LocalDevice | null,
	serverUrl: string,
	reconnectionDelayMax: number,
	fetchingInterval: number,
};

export const configState = atom<Config>({
	key: "Config",
	default: {
		localDevice: null,
		serverUrl: "",
		reconnectionDelayMax: 5000,
		fetchingInterval: 3000,
	}
});

export async function initDevice(): Promise<LocalDevice> {
	const { fingerprint, publicKey, privateKey } = await generateKeyPairs();
	return {
		deviceId: fingerprint,
		name: "Unnamed",
		publicKey,
		privateKey
	};
};
