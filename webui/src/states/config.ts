import { atom } from "recoil";
import { Device } from "../types/server";
import { generateKeyPairs } from "../utils/crypto";
import { localStorageEffect } from "./effects";

export interface LocalDevice extends Required<Device> {
	privateKey: string
}

export type Config = {
	localDevice: LocalDevice,
	serverUrl: string,
	/// auto copy received clips into clipboard
	autoCopy: boolean,
	reconnectionDelayMax: number,
	/// timeout in seconds
	pairingTimeout: number
};

export const configState = atom<Config>({
	key: "Config",
	effects: [
		localStorageEffect("config", initConfig)
	]
});

export async function initConfig(): Promise<Config> {
	return {
		localDevice: await initDevice(),
		serverUrl: "",
		// autoCopy: true,
		autoCopy: false,
		reconnectionDelayMax: 5000,
		pairingTimeout: 600
	};
}

export async function initDevice(): Promise<LocalDevice> {
	const { fingerprint, publicKey, privateKey } = await generateKeyPairs();
	return {
		deviceId: fingerprint,
		name: "Unnamed",
		publicKey,
		privateKey
	};
};
