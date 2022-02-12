import { mdiCog } from "@mdi/js";
import Icon from "@mdi/react";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	ListItemText,
	TextField
} from "@mui/material";
import { useContext, useState } from "react";
import { WebSocketContext } from "../contexts/WebSocketConntext";
import { appActions } from "../store/app";
import { useRootDispatch, useRootSelector } from "../store/hooks";
import { settingsActions, SettingsState } from "../store/settings";
import { BaseMessage, ListResponse } from "../types/types";
import { isBaseMessage, isListResponse } from "../types/types.guard";

interface Props {
	open: boolean;
	onClose: () => void;
};

function connectToServer(server: SettingsState["server"], dispatch: ReturnType<typeof useRootDispatch>) {
	if (server.address.length === 0)
		return null;

	const url = new URL(`wss://${server}`);
	url.pathname = server.pathPrefix;
	// TODO: set device name in URL
	/* url.searchParams.set("name", name); */

	// create a new connection
	const ws = new WebSocket(url);
	// TODO: handle events
	ws.onerror = event => {
		dispatch(appActions.addNotification({
			color: "error",
			text: `WebSocket Error: ${event}`
		}));
	};
	
	ws.onmessage = event => {
		try {
			const msg = JSON.parse(event.data);
			// check type
			if (isBaseMessage(msg)) {
				const baseMessage = msg as BaseMessage;
				if (!baseMessage.success) {
					throw new Error(`Error response for ${baseMessage}: ${baseMessage.error}`);
				}

				switch (baseMessage.type) {
					case "list": {
						if (!isListResponse(baseMessage))
							throw new Error(`Invalid message for type ${baseMessage.type}`);
						const listResponse = baseMessage as ListResponse;
						dispatch(appActions.setOnlineDevices(listResponse.devices));
						break;
					}
					case "pair": {
						// TODO
						break;
					}
					case "share": {
						// TODO
						break;
					}
					default:
						throw new Error(`Invalid message type: ${baseMessage.type}`);
				}
			}
			else {
				throw new Error("Invalid message");
			}
		}
		catch (err) {
			dispatch(appActions.addNotification({
				color: "error",
				text: `WebSocket Error: ${(err as Error).message}`
			}));
		}
	};
		
	return ws;
}

function SettingsDialog(props: Props) {
	const settings = useRootSelector(state => state.settings);
	const dispatch = useRootDispatch();
	const [server, setServer] = useState({ ...settings.server });
	const { setWs } = useContext(WebSocketContext);

	const save = () => {
		let updated = false;
		if (settings.server != server) {
			// create a new connection
			try {
				const ws = connectToServer(server, dispatch);
				setWs(ws);
			}
			catch (err) {
				dispatch(appActions.addNotification({
					color: "error",
					text: `Error: ${(err as Error).message}`
				}));
				return;
			}

			updated = true;
			dispatch(settingsActions.update({
				server
			}));
		}
		
		if (updated) {
			dispatch(appActions.addNotification({
				color: "success",
				text: "Settings updated successfully"
			}));
		}
		else {
			dispatch(appActions.addNotification({
				color: "info",
				text: "No changes in settings"
			}));
		}
		props.onClose();
	};
	
	const reset = () => {
		setServer(settings.server);
	};

	return (
		<Dialog
			open={props.open}
			onClose={props.onClose}
			fullWidth
		>
			<DialogTitle style={{
				display: "flex",
				alignItems: "center"
			}}>
				<Box sx={{ display: "flex", mr: 1.2 }}>
					<Icon path={mdiCog} size={1} />
				</Box>
				Settings
			</DialogTitle>
			<DialogContent>
				<Grid container justifyContent="space-between" sx={{ px: 1 }}>
					<Grid item>
						<ListItemText secondary="host address (not URL)">
							Server Address
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							variant="standard"
							placeholder="(Not set)"
							value={server.address}
							onChange={event => setServer({
								...server,
								address: event.target.value
							})}
						/>
					</Grid>
				</Grid>
				<Grid container justifyContent="space-between" sx={{ px: 1 }}>
					<Grid item>
						<ListItemText secondary={
							<span>
								prefix for all API endpoint.
								(default: <code>/</code>)
							</span>
						}>
							Path Prefix
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							variant="standard"
							placeholder="(Optional)"
							value={server.pathPrefix}
							onChange={event => setServer({
								...server,
								pathPrefix: event.target.value
							})}
						/>
					</Grid>
				</Grid>
			</DialogContent>
			
			<DialogActions>
				<Button color="inherit" onClick={() => {
					props.onClose();
					reset();
				}}>Cancel</Button>
				<Button onClick={reset} color="error">Reset</Button>
				<Button onClick={save}>Save</Button>
			</DialogActions>
		</Dialog>
	)
}

export default SettingsDialog;
