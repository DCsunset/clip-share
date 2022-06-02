import { Snackbar, duration, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { useRecoilState } from "recoil";
import { addPairedDevice, pairedDeviceListState } from "../states/device";
import { Device, PairEvent } from "../types/server";
import { hasDevice } from "../utils/device";

interface OutgoingRequest extends Device {
	// Timestamp of expiration date
	expires: number
};

type Props = {
	socket: Socket | null
};

function DevicePairing(props: Props) {
  const [incomingRequests, setIncomingRequests] = useState<PairEvent[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingRequest[]>([]);
	const [pairedDevices, setPairedDevices] = useRecoilState(pairedDeviceListState);
	// Show one event at a time
	const [currentEvent, setCurrentEvent] = useState<PairEvent | null>(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const socket = props.socket;

	useEffect(() => {
		// Handle pair events
		if (socket) {
			socket.on("pair", (e: PairEvent) => {
				// Use updater form because incomingRequests is not a dependency
				setIncomingRequests(prev => {
					if (prev.findIndex(v => v.deviceId === e.deviceId) !== -1) {
						return prev;
					}
					return [ ...prev, e ];
				});
			});
		}
	}, [socket]);
	
	// Update notification on change
	useEffect(() => {
		const currentDevice = incomingRequests[0];
		if (incomingRequests.length) {
			if (hasDevice(outgoingRequests, currentDevice)) {
				// successfully paired
				if (pairedDevices)
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
