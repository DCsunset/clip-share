import { Snackbar, duration, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { useRecoilState, useRecoilValue } from "recoil";
import { incomingRequestListState, outgoingRequestListState, pairedDeviceListState } from "../states/device";
import { PairEvent } from "../types/server";

type Props = {
	socket: Socket | null
};

function DevicePairing(props: Props) {
  const [incomingRequests, setIncomingRequests] = useRecoilState(incomingRequestListState);
	const pairedDevices = useRecoilValue(pairedDeviceListState);
	const [currentEvent, setCurrentEvent] = useState<PairEvent | null>(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const socket = props.socket;
	
	// Update notification on change
	useEffect(() => {
		if (incomingRequests.length && !currentEvent) {
			setCurrentEvent(incomingRequests[0]);
			// remove the first event
			setIncomingRequests(prev => prev.slice(1));
			setSnackbarOpen(true);
		}
	}, [incomingRequests, currentEvent, snackbarOpen]);
	
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

	const acceptPairing = (deviceId: string) => {
		if (socket !== null) {
		}
	};

	const rejectPairing = (deviceId: string) => {
		if (socket !== null) {
		}
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
