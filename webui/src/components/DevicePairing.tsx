import { Snackbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { addPairedDevice, incomingRequestListState, outgoingRequestListState, pairedDeviceListState } from "../states/device";
import { notificationState } from "../states/app.js";
import { configState } from "../states/config.js";
import { Device, PairEvent } from "../types/server";
import { hasDevice } from "../utils/device";

type Props = {
	socket: Socket | null
};

function DevicePairing(props: Props) {
	const setNotification = useSetRecoilState(notificationState);
	const config = useRecoilValue(configState);
  const [incomingRequests, setIncomingRequests] = useRecoilState(incomingRequestListState);
  const [outgoingRequests, setOutgoingRequests] = useRecoilState(outgoingRequestListState);
	const [pairedDevices, setPairedDevices] = useRecoilState(pairedDeviceListState);
	// Show one event at a time
	const [currentEvent, setCurrentEvent] = useState<PairEvent | null>(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const socket = props.socket;

	// Update notification on change
	useEffect(() => {
		const currentDevice = incomingRequests[0];
		if (incomingRequests.length) {
			if (hasDevice(outgoingRequests, currentDevice)) {
				// successfully paired
				setPairedDevices(prev => addPairedDevice(prev, currentDevice));
			}
		}

		if (incomingRequests.length && !currentEvent) {
			setCurrentEvent(currentDevice);
			// remove the first event
			setIncomingRequests(prev => prev.slice(1));
			setSnackbarOpen(true);
		}
	}, [incomingRequests, outgoingRequests, currentEvent, snackbarOpen]);
	
	const handleSnackbarClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbarOpen(false);
  };
	
	// Invalidate current event only after the snackbar closes completely
	const handleSnackbarExited = () => {
		setCurrentEvent(null);
	};

	const acceptPairing = (device: Required<PairEvent>) => {
		if (socket === null) {
			setNotification({
				color: "error",
				message: "Connection not established"
			});
			return;
		}

		// successfully paired
		setPairedDevices(prev => addPairedDevice(prev, device));
		// acknowledge back
		socket.emit("pair", {
			...device,
			publicKey: config.localDevice!.publicKey
		} as PairEvent);
	};

	const startPairing = (device: Device) => {
		if (socket === null) {
			setNotification({
				color: "error",
				message: "Connection not established"
			});
			return;
		}
		// Send pair request
		socket.emit("pair", {
			...device,
			publicKey: config.localDevice!.publicKey
		} as PairEvent);
	};

	return (
		<Snackbar
			anchorOrigin={{
				horizontal: "center",
				vertical: "top"
			}}
			onClose={handleSnackbarClose}
			TransitionProps={{
				onExited: handleSnackbarExited
			}}
			open={snackbarOpen}
		>
			<>
				<Typography>
					Pairing Request
				</Typography>
				Device {currentEvent?.name} ({currentEvent?.deviceId.substring(0, 17)})
			</>
		</Snackbar>
	);
}

export default DevicePairing;
