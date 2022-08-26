/**
 * Copyright (C) 2022 DCsunset
 * See full notice in README.md in this project
 */

import { Button, Card, CardActions, CardContent, Snackbar, Box } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { incomingRequestListState, outgoingRequestListState, pairedDeviceListState } from "../states/device";
import { notificationState, SocketCtx } from "../states/app.js";
import { configState } from "../states/config.js";
import { PairEvent, UnpairEvent } from "../types/server";
import { addDevice, findDevice, removeDevice } from "../utils/device";
import { DateTime } from "luxon";
import { Icon } from "@mdi/react";
import { mdiSwapHorizontal } from "@mdi/js";

function DevicePairing() {
	const setNotification = useSetRecoilState(notificationState);
	const config = useRecoilValue(configState);
  const [incomingRequests, setIncomingRequests] = useRecoilState(incomingRequestListState);
  const [outgoingRequests, setOutgoingRequests] = useRecoilState(outgoingRequestListState);
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
			if (exp < DateTime.now()) {
				// expired
				setIncomingRequests(prev => prev.slice(1));
				return;
			}
		}

		const req = findDevice(outgoingRequests, event);
		if (req !== null) {
			// remove the outgoing event
			setOutgoingRequests(prev => removeDevice(prev, event));
			const exp = DateTime.fromISO(req.expiryDate!);
			if (exp > DateTime.now()) {
				// successfully paired
				setPairedDevices(prev => addDevice(prev, event));
				// remove the current event
				setIncomingRequests(prev => prev.slice(1));
				setNotification({
					color: "success",
					message: `Device ${event.name} paired successfully`
				})
				return;
			}
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

	const rejectPairing = (device: PairEvent) => {
		if (socket === null) {
			setNotification({
				color: "error",
				message: "Connection not established"
			});
			return;
		}

		// send unpair event to rejecg
		socket.emit("unpair", {
			deviceId: device.deviceId,
			name: device.name
		} as UnpairEvent);

		setSnackbarOpen(false);
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
		setPairedDevices(prev => addDevice(prev, device));
		// acknowledge back
		socket.emit("pair", {
			...device,
			publicKey: config.localDevice!.publicKey
		} as PairEvent);

		setSnackbarOpen(false);
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
			<Card sx={{ p: 0.6 }}>
				<CardContent sx={{ pb: 0.6, pt: 1 }}>
					<Box sx={{
						fontSize: "1.15rem",
						fontWeight: 500,
						pb: 1,
						display: "flex"
					}}>
						<Box sx={{ mt: 0.2, mr: 0.6 }}>
							<Icon path={mdiSwapHorizontal} size={1}></Icon>
						</Box>
						Pairing Request
					</Box>
					{currentEvent?.name} ({currentEvent?.deviceId})
				</CardContent>
				<CardActions sx={{
					justifyContent: "flex-end"
				}}>
					<Button
						color="error"
						onClick={() => rejectPairing(currentEvent!)}
					>
						Reject
					</Button>
					<Button
						color="success"
						onClick={() => acceptPairing(currentEvent!)}
					>
						Accept
					</Button>
				</CardActions>
			</Card>
		</Snackbar>
	);
}

export default DevicePairing;
