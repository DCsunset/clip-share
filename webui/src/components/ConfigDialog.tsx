import { mdiCog, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import {
	Box,
	Button,
	Checkbox,
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
import { useRecoilState, useSetRecoilState } from "recoil";
import { notificationState } from "../states/app";
import { configState, initDevice } from "../states/config";

interface Props {
	open: boolean;
	onClose: () => void;
};

function SettingsDialog(props: Props) {
	const [config, setConfig] = useRecoilState(configState);
	const setNotification = useSetRecoilState(notificationState);
	const [serverUrl, setServerUrl] = useState(config.serverUrl);
	const [deviceName, setDeviceName] = useState(config.localDevice?.name ?? "Unnamed");
	const [reconnectionDelayMax, setReconnectionDelayMax] = useState(config.reconnectionDelayMax.toString());
	const [pairingTimeout, setPairingTimeout] = useState(config.pairingTimeout.toString());
	const [autoCopy, setAutoCopy] = useState(config.autoCopy);

	const validNumber = (s: string) => {
		const num = parseInt(s);
		return num > 0 && num.toString() === s;
	};

	const validName = () => deviceName.length > 0;
	const validReconnectionDelayMax = () => validNumber(reconnectionDelayMax);
	const validPairingTimeout = () => validNumber(pairingTimeout);
	const validSettings = () => validName()
		&& validReconnectionDelayMax()
		&& validPairingTimeout();

	useEffect(() => {
		// Init device if empty
		if (!config.localDevice) {
			const initializeDevice = async () => {
				const localDevice = await initDevice();
				setConfig({
					...config,
					localDevice
				});
			};

			initializeDevice();
		}
	}, [config]);

	const regenerateKeyPairs = () => {
		initDevice().then(device => {
			setConfig({
				...config,
				localDevice: {
					...device,
					name: config.localDevice?.name ?? device.name
				}
			});
		});
	};
	
	const save = () => {
		if (!validSettings())
			return;

		let updated = false;
		if (config.serverUrl !== serverUrl) {
			updated = true;
			setConfig({
				...config,
				serverUrl
			});
		}
		if (config.localDevice && config.localDevice.name !== deviceName) {
			updated = true;
			setConfig({
				...config,
				localDevice: {
					...config.localDevice,
					name: deviceName
				}
			});
		}
		const reconnectionDelayMaxNum = parseInt(reconnectionDelayMax);
		if (config.reconnectionDelayMax !== reconnectionDelayMaxNum) {
			updated = true;
			setConfig({
				...config,
				reconnectionDelayMax: reconnectionDelayMaxNum
			});
		}
		const pairingTimeoutNum = parseInt(pairingTimeout);
		if (config.pairingTimeout !== pairingTimeoutNum) {
			updated = true;
			setConfig({
				...config,
				pairingTimeout: pairingTimeoutNum
			});
		}
		
		if (updated) {
			setNotification({
				color: "success",
				message: "Settings updated successfully"
			});
		}
		props.onClose();
	};
	
	const reset = () => {
		setServerUrl(config.serverUrl);
		setDeviceName(config.localDevice?.name ?? "");
		setReconnectionDelayMax(config.reconnectionDelayMax.toString());
		setPairingTimeout(config.pairingTimeout.toString());
		setAutoCopy(config.autoCopy);
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
						<span>{config.localDevice?.deviceId}</span>
						<IconButton
							title="Re-generate"
							color="secondary"
							size="small"
							onClick={regenerateKeyPairs}
							sx={{ ml: 1.5 }}
						>
							<Icon path={mdiRefresh} size={1} />
						</IconButton>
					</Grid>
				</Grid>

				<Grid container justifyContent="space-between" sx={{ px: 1 }}>
					<Grid item>
						<ListItemText secondary="Max delay for reconnection (in ms)">
							Reconnection Delay Max
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							error={!validReconnectionDelayMax()}
							variant="standard"
							style={{
								maxWidth: "85px"
							}}
							value={reconnectionDelayMax}
							onChange={event => setReconnectionDelayMax(event.target.value)}
							{...requiredProps}
						/>
					</Grid>
				</Grid>

				<Grid container justifyContent="space-between" sx={{ px: 1 }}>
					<Grid item>
						<ListItemText secondary="Timeout for outgoing pair request (in s)">
							Pairing Timeout
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							error={!validPairingTimeout()}
							variant="standard"
							style={{
								maxWidth: "85px"
							}}
							value={pairingTimeout}
							onChange={event => setPairingTimeout(event.target.value)}
							{...requiredProps}
						/>
					</Grid>
				</Grid>

				{/* Comment out because Permissions APIs don't fully work for clipboard */}
				{/* <Grid container justifyContent="space-between" sx={{ px: 1 }}>
					<Grid item>
						<ListItemText secondary="Auto copy received clips into clipboard">
							Auto Copy
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<Checkbox
							checked={autoCopy}
							onChange={e => setAutoCopy(e.target.checked)}
						/>
					</Grid>
				</Grid> */}
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
