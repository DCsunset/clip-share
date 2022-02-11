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
import { settingsActions } from "../store/settings";

interface Props {
	open: boolean;
	onClose: () => void;
};

function connectToServer(server: string) {
	// create a new connection
	const ws = server.length > 0 ?
		new WebSocket(server) : null;
	
	if (ws) {
		// TODO: handle events
	}
		
	return ws;
}

function SettingsDialog(props: Props) {
	const settings = useRootSelector(state => state.settings);
	const dispatch = useRootDispatch();
	const [server, setServer] = useState(settings.server);
	const { setWs } = useContext(WebSocketContext);
	
	const save = () => {
		let updated = false;
		if (settings.server != server) {
			// create a new connection
			try {
				const ws = connectToServer(server);
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
						<ListItemText secondary="server address">
							Server
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							variant="standard"
							placeholder="(Not set)"
							value={server}
							onChange={event => setServer(event.target.value)}
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
