import { useState, useContext } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import Icon from '@mdi/react';
import { DateTime } from "luxon";
import {
	Box,
	Button,
	Card,
	CardContent,
	Collapse,
	IconButton,
	List,
	ListItem,
	Typography
} from '@mui/material';
import {
	mdiArrowRightBottom,
	mdiChevronDown, mdiContentCopy, mdiLaptop, mdiLinkVariant, mdiMinus, mdiPlus, mdiSend
} from "@mdi/js";
import { DeviceType } from '../types/app';
import { Device, PairEvent, ShareEvent, UnpairEvent } from "../types/server";
import { SocketCtx, notificationState } from "../states/app.js";
import { deviceDataState, outgoingRequestListState, pairedDeviceListState, removePairedDevice } from "../states/device.js";
import { configState } from "../states/config.js";

function capitalize(str: string) {
	return str[0].toUpperCase() + str.slice(1);
}

type Props = {
	type: DeviceType,
	devices: Device[]
};

function DeviceList(props: Props) {
	const [visible, setVisible] = useState(true);
	const socket = useContext(SocketCtx);
	const setNotification = useSetRecoilState(notificationState);
	const config = useRecoilValue(configState);
	const setOutgoingRequests = useSetRecoilState(outgoingRequestListState);
	const setPairedDevices = useSetRecoilState(pairedDeviceListState);
	const deviceData = useRecoilValue(deviceDataState);

	const icon = props.type === "new" ? mdiLaptop : mdiLinkVariant;

	const sendClip = (device: Device, content: string) => {
		if (socket === null) {
			setNotification({
				color: "error",
				message: "Connection not established"
			});
			return;
		}

		const shareEvent: ShareEvent = {
			deviceId: device.deviceId,
			data: {
				type: "clipboard",
				content
			}
		};

		socket.emit("share", shareEvent);
		setNotification({
			color: "info",
			message: `Content sent to device ${device.name}`
		});
	};

	const copyClip = (device: Device) => {
		const clip = deviceData[device.deviceId]?.clip;
		setNotification({
			color: "info",
			message: `Clip received: ${clip}`
		});
	};

	const startPairing = (device: Device) => {
		if (socket === null) {
			setNotification({
				color: "error",
				message: "Connection not established"
			});
			return;
		}

		const event: PairEvent = {
			...device,
			publicKey: config.localDevice!.publicKey,
			expiryDate: DateTime.local().plus({
				seconds: config.pairingTimeout
			}).toISO()
		};

		// Send pair request
		socket.emit("pair", event);

		setOutgoingRequests(prev => [...prev, event]);
		setNotification({
			color: "info",
			message: `Pair request sent to device ${event.name}`
		});
	};

	const unpair = (device: Device) => {
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
		setPairedDevices(prev => removePairedDevice(prev, device));

		setNotification({
			color: "info",
			message: `Device ${event.name} unpaired`
		});
	};

	const NewDevice = ({ device }: { device: Device }) => (
		<>
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
				title="Pair"
				onClick={() => startPairing(device)}
			>
				<Icon path={mdiPlus} size={1} />
			</IconButton>
		</>
	);

	const PairedDevice = ({ device }: { device: Device }) => (
		<Box sx={{ width: "100%" }}>
			<Box sx={{
				display: "flex",
				alignItems: "center"
			}}>
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
				>
					<Box sx={{
						display: "flex",
						alignItems: "center",
						mr: 0.5
					}}>
						<Icon path={mdiSend} size={0.7} />
					</Box>
					Text
				</Button>
				<Button
					sx={{ mr: 0.5 }}
					color="inherit"
					title="Send clipboard content"
					onClick={() => sendClip(device, "test")}
				>
					<Box sx={{
						display: "flex",
						alignItems: "center",
						mr: 0.5
					}}>
						<Icon path={mdiSend} size={0.7} />
					</Box>
					Paste
				</Button>
				<Button
					sx={{ mr: 0.5 }}
					color="inherit"
					title="Copy received clip"
					disabled={!deviceData[device.deviceId]?.clip}
					onClick={() => copyClip(device)}
				>
					<Box sx={{
						display: "flex",
						alignItems: "center",
						mr: 0.5
					}}>
						<Icon path={mdiContentCopy} size={0.7} />
					</Box>
					Copy
				</Button>
			</Box>
		</Box>
	);

	return (
		<Card>
			<CardContent sx={{
				"&:last-child": { pb: 2 }
			}}>
				<Box sx={{
					display: "flex"
				}}>
					<Box sx={{
						display: "flex",
						alignItems: "center",
						mr: 1.2,
						mt: 0.2
					}}>
						<Icon path={icon} size={1} />
					</Box>

					<Typography
						variant="h6"
						style={{
							fontWeight: 400
						}}
					>
						{capitalize(props.type)} Devices
					</Typography>

					<span style={{ flexGrow: 1 }} />

					<IconButton
						disableRipple
						sx={{ p: 0 }}
						onClick={() => setVisible(!visible)}
					>
						<Icon
							path={mdiChevronDown}
							style={{
								transform: `rotate(${visible ? "0" : "-180deg"})`,
								transition: "all 0.2s"
							}}
							size={1}
						/>
					</IconButton>
				</Box>
				<hr />

				<Collapse in={visible}>
					<List sx={{ py: 0 }}>
						{props.devices.map(device => (
							<ListItem
								key={device.deviceId}
								sx={{ px: 1 }}
							>
								{
									props.type === "new" ? (
										<NewDevice device={device} />
									) : (
										<PairedDevice device={device} />
									)
								}
							</ListItem>
						))}
					</List>
				</Collapse>
			</CardContent>
		</Card>
	);
}

export default DeviceList;
