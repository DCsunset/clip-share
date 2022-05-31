import { useState } from "react";
import Icon from '@mdi/react';
import {
	Box,
	Card,
  CardContent,
  Collapse,
  IconButton,
  List,
  ListItem,
  Typography
} from '@mui/material';
import {
	mdiChevronDown, mdiLaptop, mdiLinkVariant, mdiPlus
} from "@mdi/js";
import { DeviceType } from '../types/app';
import { Device } from "../types/server";

function capitalize(str: string) {
	return str[0].toUpperCase() + str.slice(1);
}

type Props = {
	type: DeviceType,
	devices: Device[]
};

function DeviceList(props: Props) {
	const [visible, setVisible] = useState(true);
	
	const icon = props.type === "new" ? mdiLaptop : mdiLinkVariant;

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
								transform: `rotate(${visible? "0" : "-180deg"})`,
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
								<span>{device.name}</span>
								<Box sx={{
									opacity: 0.75,
									ml: 1
								}}>
									({device.deviceId.substring(0, 17)})
								</Box>
								<span style={{ flexGrow: 1 }} />
								<IconButton size="small" title="Pair">
									<Icon path={mdiPlus} size={1} />
								</IconButton>
							</ListItem>
						))}
					</List>
				</Collapse>
			</CardContent>
		</Card>
	)
}

export default DeviceList;
