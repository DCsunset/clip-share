import { mdiCog, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	ListItemText,
	TextField,
	TextFieldProps
} from "@mui/material";
import { useEffect, useState } from "react";
import { appActions } from "../store/app";
import { genKeyPairs } from "../store/async-actions";
import { useRootDispatch, useRootSelector } from "../store/hooks";
import { settingsActions } from "../store/settings";
import { getFingerprint } from "../utils/crypto";

interface Props {
	open: boolean;
	onClose: () => void;
};

function SettingsDialog(props: Props) {
	const settings = useRootSelector(state => state.settings);
	const deviceInfo = useRootSelector(state => state.settings.deviceInfo);
	const dispatch = useRootDispatch();
	const [serverUrl, setServerUrl] = useState(settings.serverUrl);
	const [deviceName, setDeviceName] = useState(deviceInfo.name);
	const [fingerprint, setFingerprint] = useState("");
	const [reconnectionMaxDelay, setReconnectionMaxDelay] = useState(settings.reconnectionMaxDelay.toString());
	const [fetchingInterval, setFetchingInterval] = useState(settings.fetchingInterval.toString());

	const validNumber = (s: string) => {
		const num = parseInt(s);
		return num > 0 && num.toString() === s;
	};

	const validName = () => deviceName.length > 0;
	const validReconnectionMaxDelay = () => validNumber(reconnectionMaxDelay);
	const validFetchingInterval = () => validNumber(fetchingInterval);
	const validSettings = () => validName()
		&& validReconnectionMaxDelay()
		&& validFetchingInterval();

	useEffect(() => {
		// Generate key pairs if empty
		if (deviceInfo.publicKey.length === 0)
			dispatch(genKeyPairs());
	}, [deviceInfo]);
	
	// Calculate fingerprint
	useEffect(() => {
		setFingerprint("calculating...");
		// Display only first 6 bytes
		getFingerprint(deviceInfo.publicKey)
			.then(v => setFingerprint(v.substring(0, 17)))
			.catch(err => {
        dispatch(appActions.addNotification({
          color: "error",
          text: `Error: ${err.message}`
        }));
				setFingerprint("error");
			});
	}, [deviceInfo]);

	const save = () => {
		if (!validSettings())
			return;

		let updated = false;
		if (settings.serverUrl != serverUrl) {
			updated = true;
			dispatch(settingsActions.update({
				serverUrl
			}));
		}
		if (deviceInfo.name != deviceName) {
			updated = true;
			dispatch(settingsActions.update({
				deviceInfo: {
					...deviceInfo,
					name: deviceName
				}
			}));
		}
		
		if (updated) {
			dispatch(appActions.addNotification({
				color: "success",
				text: "Settings updated successfully"
			}));
		}
		props.onClose();
	};
	
	const reset = () => {
		setServerUrl(settings.serverUrl);
		setDeviceName(deviceInfo.name);
		setReconnectionMaxDelay(settings.reconnectionMaxDelay.toString());
		setFetchingInterval(settings.fetchingInterval.toString());
	};
	
	// styles for required fields
	const requiredProps: TextFieldProps = {
		placeholder: "Required *",
		sx: {
			"& input::placeholder": {
				color: "error.main",
				opacity: 1
			}
		}
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
						<ListItemText secondary="Absolute URL or relative path">
							Server URL
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							variant="standard"
							placeholder="(default: /)"
							value={serverUrl}
							onChange={event => setServerUrl(event.target.value)}
						/>
					</Grid>
				</Grid>

				{/* Device Info */}
				<Grid container justifyContent="space-between" sx={{ px: 1 }}>
					<Grid item>
						<ListItemText secondary="Name for current device">
							Device Name
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							error={!validName()}
							variant="standard"
							value={deviceName}
							onChange={event => setDeviceName(event.target.value)}
							{...requiredProps}
						/>
					</Grid>
				</Grid>
				<Grid container justifyContent="space-between" sx={{ px: 1 }}>
					<Grid item>
						<ListItemText secondary="Fingerprint for current key pairs">
							Key Fingerprint
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<span>{fingerprint}</span>
						<IconButton
							title="Re-generate"
							color="secondary"
							size="small"
							onClick={() => dispatch(genKeyPairs())}
							sx={{ ml: 1.5 }}
						>
							<Icon path={mdiRefresh} size={1} />
						</IconButton>
					</Grid>
				</Grid>

				<Grid container justifyContent="space-between" sx={{ px: 1 }}>
					<Grid item>
						<ListItemText secondary="Max delay for reconnection (in ms)">
							Reconnection Max Delay
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							error={!validReconnectionMaxDelay()}
							variant="standard"
							style={{
								maxWidth: "85px"
							}}
							value={reconnectionMaxDelay}
							onChange={event => setReconnectionMaxDelay(event.target.value)}
							{...requiredProps}
						/>
					</Grid>
				</Grid>
				<Grid container justifyContent="space-between" sx={{ px: 1 }}>
					<Grid item>
						<ListItemText secondary="Interval for fetching device list (in ms)">
							Fetching Interval
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							error={!validFetchingInterval()}
							variant="standard"
							style={{
								maxWidth: "85px"
							}}
							value={fetchingInterval}
							onChange={event => setFetchingInterval(event.target.value)}
							{...requiredProps}
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
