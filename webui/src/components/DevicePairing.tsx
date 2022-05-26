import { Snackbar, duration, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { appActions } from "../store/app";
import { useRootDispatch, useRootSelector } from "../store/hooks";
import { Socket } from "socket.io-client";

type Props = {
	socket: Socket | null
};

function DevicePairing(props: Props) {
	const dispatch = useRootDispatch();
  const outgoingRequests = useRootSelector(state => state.app.outgoingRequests);
  const incomingRequests = useRootSelector(state => state.app.incomingRequests);
	// TODO: remove duplicate ids
	// Remove already paired devices
	const pendingRequests = incomingRequests.filter(incoming => (
		outgoingRequests.findIndex(d => incoming.deviceId === d.deviceId) === -1
	));
	const [invalidPairEvents, setInvalidPairEvents] = useState<string[]>([]);
	const socket = props.socket;
	
	const removePairedEvent = (deviceId: string) => {
		setInvalidPairEvents(invalidPairEvents.concat([deviceId]));

		// Wait until transition finishes
		setTimeout(() => {
			dispatch(appActions.removeOutgoingRequests([deviceId]));
		}, duration.leavingScreen);
	};

	const acceptPairing = (deviceId: string) => {
		if (socket !== null) {
		}
	};

	const rejectPairing = (deviceId: string) => {
		if (socket !== null) {
		}
	};
	
	// TODO: add to paired devices
	useEffect(() => {

	}, [incomingRequests, outgoingRequests]);

	return (
		<>
			{pendingRequests.map(({ name, deviceId }) => (
				<Snackbar
					anchorOrigin={{
						horizontal: "center",
						vertical: "top"
					}}
					key={deviceId}
					open={!invalidPairEvents.includes(deviceId)}
				>
					<>
						<Typography>
							Pairing Request
						</Typography>
						Device {name} ({deviceId.substring(0, 17)})
					</>
				</Snackbar>
			))}
		</>
	)
}

export default DevicePairing;
