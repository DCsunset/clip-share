import Icon from '@mdi/react';
import {
	Box,
	Card,
  CardContent,
  IconButton,
  Typography
} from '@mui/material';
import {
	mdiChevronDown, mdiLaptop, mdiLinkVariant
} from "@mdi/js";
import { useRootDispatch, useRootSelector } from '../store/hooks';
import { DeviceType } from '../types/app';
import { appActions } from '../store/app';

function capitalize(str: string) {
	return str[0].toUpperCase() + str.slice(1);
}

type Props = {
	type: DeviceType
};

function DeviceList(props: Props) {
	const showDevices = useRootSelector(state => state.app.showDevices[props.type]);
	const dispatch = useRootDispatch();
	
	const icon = props.type === "new" ? mdiLaptop : mdiLinkVariant;

	return (
		<Card>
			<CardContent>
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
						onClick={() => dispatch(appActions.setShowDevices({
							type: props.type,
							value: !showDevices
						}))}
					>
						<Icon
							path={mdiChevronDown}
							style={{
								transform: `rotate(${showDevices ? "0" : "-180deg"})`,
								transition: "all 0.2s"
							}}
							size={1}
						/>
					</IconButton>
				</Box>
				<hr />
			</CardContent>
		</Card>
	)
}

export default DeviceList;
