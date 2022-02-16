import { mdiCog, mdiServerPlus } from "@mdi/js";
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
import { appActions } from "../store/app";
import { useRootDispatch, useRootSelector } from "../store/hooks";
import { settingsActions } from "../store/settings";

interface Props {
	open: boolean;
	onClose: () => void;
};

function SettingsDialog(props: Props) {
	const settings = useRootSelector(state => state.settings);
	const dispatch = useRootDispatch();
	const [serverUrl, setServerUrl] = useState(settings.serverUrl);

	const save = () => {
		let updated = false;
		if (settings.serverUrl != serverUrl) {
			if (serverUrl.length > 0) {
				// Validate serverUrl
				try {
					const url = new URL(serverUrl);
					if (!["ws:", "wss:"].includes(url.protocol))
						throw new Error();
				}
				catch (_err) {
					dispatch(appActions.addNotification({
						color: "error",
						text: "Error: Invalid server URL"
					}));
					return;
				}
			}

			updated = true;
			dispatch(settingsActions.update({
				serverUrl
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
		setServerUrl(settings.serverUrl);
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
						<ListItemText secondary={
							<span>
								starting with <code>ws://</code>
								&nbsp;or <code>wss://</code>
							</span>
						}>
							Server URL
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							variant="standard"
							placeholder="(Not set)"
							value={serverUrl}
							onChange={event => setServerUrl(event.target.value)}
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
