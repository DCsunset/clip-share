/**
 * Copyright (C) 2022 DCsunset
 * See full notice in README.md in this project
 */

import { useState, useContext } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { Icon } from '@mdi/react';
import { DateTime } from "luxon";
import {
	Box,
	Card,
	CardContent,
	Collapse,
	IconButton,
	List,
	ListItem,
	Typography,
} from '@mui/material';
import {
	mdiChevronDown,
	mdiLaptop,
	mdiLinkVariant,
	mdiPlus
} from "@mdi/js";
import PairedDevice from "./PairedDevice";
import { DeviceType } from '../types/app';
import { Device, PairEvent } from "../types/server";
import { SocketCtx, notificationState } from "../states/app.js";
import {
	outgoingRequestListState,
} from "../states/device.js";
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

	const icon = props.type === "new" ? mdiLaptop : mdiLinkVariant;

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
			expiryDate: DateTime.now().plus({
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
										<PairedDevice device={device as Required<Device>} />
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
