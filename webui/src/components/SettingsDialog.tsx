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
import { useState } from "react";
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
	const [server, setServer] = useState(settings.server);
	
	const save = () => {
		let updated = false;
		if (settings.server != server) {
			updated = true;
			dispatch(settingsActions.update({
				server
			}))
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
