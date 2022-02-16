import { Alert, AppBar, duration, IconButton, Snackbar, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useContext, useState } from "react";
import { appActions, AppState } from "../store/app";
import { useRootDispatch, useRootSelector } from "../store/hooks";
import { Notification } from "../types/app";
import Logo from "../logo.svg";
import { mdiCog } from "@mdi/js";
import Icon from "@mdi/react";
import SettingsDialog from "./SettingsDialog";

function getStatusColor(status: AppState["socketStatus"]) {
	const colorMap = {
		connected: "success.main",
		connecting: "info.main",
		disconnected: "error.main",
		unavailable: "grey",
	} as {
		[status in typeof status]: string
	};
	
	return colorMap[status];
}

interface Props {
	children?: any
};

function Layout(props: Props) {
	const notifications = useRootSelector(state => state.app.notifications);
	const socketStatus = useRootSelector(state => state.app.socketStatus);
	const dispatch = useRootDispatch();
	const [settingsDialog, setSettingsDialog] = useState(false);

	// Notifications to be removed
	const [invalidNotifications, setInvalidNotifications] = useState([] as string[]);
	const handleSnackbarClose = (reason: string, notification: Notification) => {
		if (reason === "clickaway") {
			return;
		}
		setInvalidNotifications(invalidNotifications.concat([notification.id]));

		// Wait until transition finishes
		setTimeout(() => {
			setInvalidNotifications(invalidNotifications.filter(e => e !== notification.id));
			dispatch(appActions.removeNotification(notification.id));
		}, duration.leavingScreen);
	};

	return (
		<Box sx={{
			height: "100vh",
			display: "flex",
			flexDirection: "column"
		}}>
			<AppBar position="sticky">
				<Toolbar style={{ minHeight: "56px" }}>
					<Box sx={{
						display: "flex",
						mr: 1.2
					}}>
						<img width="32px" src={Logo} />
					</Box>
					<Typography variant="h5" noWrap>
						Clip Share
					</Typography>

					<span style={{ flexGrow: 1 }} />

					<Box title={socketStatus} sx={{
						backgroundColor: getStatusColor(socketStatus),
						width: "12px",
						height: "12px",
						borderRadius: "50%",
						mr: 1.5
					}} />
					<IconButton
						color="inherit"
						title="Settings"
						onClick={() => setSettingsDialog(true)}
					>
						<Icon path={mdiCog} size={1} />
					</IconButton>
				</Toolbar>
			</AppBar>

			{notifications.map(notification => (
				<Snackbar
					anchorOrigin={{
						horizontal: "center",
						vertical: "bottom"
					}}
					key={notification.id}
					open={!invalidNotifications.includes(notification.id)}
					autoHideDuration={5000}
					onClose={(_, reason) => handleSnackbarClose(reason, notification)}
				>
					<Alert
						elevation={6}
						variant="filled"
						onClose={() => handleSnackbarClose("", notification)}
						severity={notification.color}
					>
						{notification.text}
					</Alert>
				</Snackbar>
			))}
			
			<SettingsDialog open={settingsDialog} onClose={() => setSettingsDialog(false)} />

			<div style={{ height: "100%" }}>
				{props.children}
			</div>
		</Box>
	);
}

export default Layout;
