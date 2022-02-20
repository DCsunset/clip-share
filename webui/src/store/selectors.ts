import { RootState } from ".";

export const selectNewDevices = (state: RootState) => {
	// filter paired devices
	return state.app.onlineDevices.filter(device => (
		state.settings.pairedDevices.findIndex(({ id }) => (
			device.id === id
		)) === -1
	));
};
