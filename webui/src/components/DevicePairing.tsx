import { Button, Snackbar, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { addPairedDevice, incomingRequestListState, outgoingRequestListState, pairedDeviceListState } from "../states/device";
import { notificationState, SocketCtx } from "../states/app.js";
import { configState } from "../states/config.js";
import { PairEvent } from "../types/server";
import { displayId, hasDevice } from "../utils/device";
import { DateTime } from "luxon";

function DevicePairing() {
	const setNotification = useSetRecoilState(notificationState);
	const config = useRecoilValue(configState);
  const [incomingRequests, setIncomingRequests] = useRecoilState(incomingRequestListState);
  const outgoingRequests = useRecoilValue(outgoingRequestListState);
	const setPairedDevices = useSetRecoilState(pairedDeviceListState);
	// Show one event at a time
	const [currentEvent, setCurrentEvent] = useState<PairEvent | null>(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const socket = useContext(SocketCtx);

	// Update current event on change
	useEffect(() => {
		if (incomingRequests.length === 0) {
			return;
		}

		const event = incomingRequests[0];
		if (event.expiryDate) {
			const exp = DateTime.fromISO(event.expiryDate);
			if (exp < DateTime.local()) {
				// expired
				setIncomingRequests(prev => prev.slice(1));
				return;
			}
		}

		if (hasDevice(outgoingRequests, event)) {
			// successfully paired
			setPairedDevices(prev => addPairedDevice(prev, event));
			// remove the current event
			setIncomingRequests(prev => prev.slice(1));
			setNotification({
				color: "success",
				message: `Device ${event.name} paired successfully`
			})
			return;
		}

		if (!currentEvent) {
			setCurrentEvent(event);
			// remove the current event
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

	const acceptPairing = (device: PairEvent) => {
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
				Device {currentEvent?.name} ({displayId(currentEvent?.deviceId)})
				<div>
					<Button
						variant="contained"
						color="primary"
						onClick={() => acceptPairing(currentEvent!)}
					>
						Accept
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={handleSnackbarClose}
					>
						Reject
					</Button>
				</div>
			</>
		</Snackbar>
	);
}

export default DevicePairing;
