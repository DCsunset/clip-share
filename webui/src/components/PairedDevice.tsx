import { useState, useContext, useRef } from "react";
import {
	Box,
	Button,
	Dialog,
	Card,
	CardContent,
	CardActions,
	Typography,
	TextField,
	IconButton,
	Tooltip
} from '@mui/material';
import {
	mdiArrowRightBottom,
	mdiContentCopy,
	mdiMinus,
	mdiSend
} from "@mdi/js";
import Icon from '@mdi/react';
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
	pairedDeviceListState,
	onlineDeviceListState,
	deviceDataState
} from "../states/device.js";
import { SocketCtx, notificationState } from "../states/app.js";
import { Device, ShareEvent, UnpairEvent } from "../types/server";
import { encrypt } from "../utils/crypto.js";
import { hasDevice, removeDevice } from "../utils/device.js";

const useBoolState = () => {
	const [value, set] = useState(false);
	return {
		value,
		set
	};
};

const PairedDevice = ({ device }: { device: Required<Device> }) => {
	const socket = useContext(SocketCtx);
	const setNotification = useSetRecoilState(notificationState);
	const onlineDevices = useRecoilValue(onlineDeviceListState);
	const deviceData = useRecoilValue(deviceDataState);
	const setPairedDevices = useSetRecoilState(pairedDeviceListState);
	// useRef can keep state and won't trigger re-rendering
	const tooltipTimeouts = useRef<{
		[name: string]: number | null
	}>({
		paste: null,
		copy: null,
		text: null,
		textDialog: null
	});
	const [textDialog, setTextDialog] = useState({
		open: false,
		text: "",
		device: null as (Device | null)
	});
	
	const online = hasDevice(onlineDevices, device);
	const tooltips = {
		paste: useBoolState(),
		copy: useBoolState(),
		text: useBoolState(),
		textDialog: useBoolState(),
	};

	const showTooltip = (name: keyof typeof tooltips) => {
		tooltips[name].set(true);
		const timeout = tooltipTimeouts.current[name];
		if (timeout) {
			clearTimeout(timeout);
			tooltipTimeouts.current[name] = null;
		}
		tooltipTimeouts.current[name] = setTimeout(() => {
			tooltips[name].set(false);
		}, 2000);
	};

	const getClipboard = async () => {
		// In firefox v101 and below, enable asyncClipboard in about:config
		return await navigator.clipboard.readText();
	};

	const sendClip = async (device: Device, content?: string) => {
		// If not specified, get from clipboard
		content = content ?? await getClipboard();
		if (socket === null) {
			setNotification({
				color: "error",
				message: "Connection not established"
			});
			return;
		}

		try {
			const msg = await encrypt(content, device.publicKey!);
			const shareEvent: ShareEvent = {
				deviceId: device.deviceId,
				data: {
					type: "clip",
					content: msg
				}
			};

			socket.emit("share", shareEvent);
		}
		catch (err: any) {
			setNotification({
				color: "error",
				message: err.message
			});
		}
	};

	const copyClip = async (device: Device) => {
		const clip = deviceData[device.deviceId]?.clip;
		if (clip) {
			await navigator.clipboard.writeText(clip);
			showTooltip("copy");
		}
	};

	const unpair = (device: Required<Device>) => {
		if (socket === null) {
			setNotification({
				color: "error",
				message: "Connection not established"
			});
			return;
		}

		const event: UnpairEvent = {
			deviceId: device.deviceId,
			name: device.name
		};
		socket.emit("unpair", event);
		setPairedDevices(prev => removeDevice(prev, device));

		setNotification({
			color: "info",
			message: `Device ${event.name} unpaired`
		});
	};

	return (
		<Box sx={{ width: "100%" }}>
			<Dialog
				open={textDialog.open}
				onClose={() => setTextDialog({
					open: false,
					text: "",
					device: null
				})}
			>
				<Card sx={{ width: "400px" }}>
					<CardContent>
						<Typography gutterBottom variant="h6">
							Send Text
						</Typography>
						<TextField
							variant="outlined"
							fullWidth
							value={textDialog.text}
							onChange={e => setTextDialog({
								...textDialog,
								text: e.target.value
							})}
							multiline
						/>
					</CardContent>
					<CardActions sx={{
						justifyContent: "flex-end"
					}}>
						<Button onClick={() => {
							sendClip(textDialog.device!, textDialog.text);
							setTextDialog({
								...textDialog,
								open: false,
								text: ""
							});
							showTooltip("text");
						}}>Submit</Button>
					</CardActions>
				</Card>
			</Dialog>
			<Box sx={{
				display: "flex",
				alignItems: "center"
			}}>
				<Tooltip arrow title={online ? "online" : "offline"}>
					<Box sx={{
						backgroundColor: online ? "success.main" : "gray",
						width: "10px",
						height: "10px",
						borderRadius: "50%",
						mr: 1.5
					}} />
				</Tooltip>
				<span>{device.name}</span>
				<Box sx={{
					opacity: 0.75,
					ml: 1
				}}>
					({device.deviceId})
				</Box>
				<span style={{ flexGrow: 1 }} />
				<IconButton
					size="small"
					title="Unpair"
					onClick={() => unpair(device)}
				>
					<Icon path={mdiMinus} size={1} />
				</IconButton>
			</Box>

			<Box sx={{
				display: "flex",
				alignItems: "center",
				opacity: 0.95,
			}}>
				<Box sx={{
					opacity: 0.5,
					mr: 1.2
				}}>
					<Icon path={mdiArrowRightBottom} size={1} />
				</Box>
				<Button
					sx={{ mr: 0.5 }}
					color="inherit"
					title="Send Text"
					onClick={() => setTextDialog({
						open: true,
						text: "",
						device
					})}
				>
					<Tooltip
						sx={{ pb: 0 }}
						disableFocusListener
						disableHoverListener
						disableTouchListener
						disableInteractive
						placement="top"
						arrow
						open={tooltips.text.value}
						// onClose={() => tooltips.text.set(false)}
						title="Sent"
					>
						<Box sx={{ display: "flex" }}>
							<Box sx={{
								display: "flex",
								alignItems: "center",
								mr: 0.5
							}}>
								<Icon path={mdiSend} size={0.7} />
							</Box>
							Text
						</Box>
					</Tooltip>
				</Button>
				<Button
					sx={{ mr: 0.5 }}
					color="inherit"
					title="Send clipboard content"
					onClick={() => {
						sendClip(device);
						showTooltip("paste");
					}}
				>
					<Tooltip
						sx={{ pb: 0 }}
						disableFocusListener
						disableHoverListener
						disableTouchListener
						placement="top"
						arrow
						open={tooltips.paste.value}
						onClose={() => tooltips.paste.set(false)}
						title="Pasted"
					>
						<Box sx={{ display: "flex" }}>
							<Box sx={{
								display: "flex",
								alignItems: "center",
								mr: 0.5
							}}>
								<Icon path={mdiSend} size={0.7} />
							</Box>
							Paste
						</Box>
					</Tooltip>
				</Button>
				<Button
					sx={{ mr: 0.5 }}
					color="inherit"
					title="Copy received clip"
					disabled={!deviceData[device.deviceId]?.clip}
					onClick={() => copyClip(device)}
				>
					<Tooltip
						sx={{ pb: 0 }}
						disableFocusListener
						disableHoverListener
						disableTouchListener
						placement="top"
						arrow
						open={tooltips.copy.value}
						onClose={() => tooltips.copy.set(false)}
						title="Copied"
					>
						<Box sx={{ display: "flex" }}>
							<Box sx={{
								display: "flex",
								alignItems: "center",
								mr: 0.5
							}}>
								<Icon path={mdiContentCopy} size={0.7} />
							</Box>
							Copy
						</Box>
					</Tooltip>
				</Button>
			</Box>
		</Box>
	);
};

export default PairedDevice;
