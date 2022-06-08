import { Alert, AppBar, IconButton, Snackbar, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import Logo from "../logo.svg";
import { mdiCog } from "@mdi/js";
import Icon from "@mdi/react";
import ConfigDialog from "./ConfigDialog";
import { useRecoilState, useRecoilValue } from "recoil";
import {
	notificationState,
	SocketStatus,
	socketStatusState,
	Notification
} from "../states/app";

function getStatusColor(status: SocketStatus) {
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
	const [notification, setNotification] = useRecoilState(notificationState);
	// current displayed notification (delayed destruction and update)
	const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
	const [snackbarOpen, setSnackbarOpen] = useState(false);

	const socketStatus = useRecoilValue(socketStatusState);
	const [settingsDialog, setSettingsDialog] = useState(false);
	
	// Update notification on change
	useEffect(() => {
		if (notification && !currentNotification) {
			setCurrentNotification(notification);
			setNotification(null);
			setSnackbarOpen(true);
		}
		else if (notification && currentNotification && snackbarOpen) {
			// Close an active snack when a new one is adde
			setSnackbarOpen(false);
		}
	}, [notification, currentNotification, snackbarOpen])

	const handleSnackbarClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbarOpen(false);
  };
	
	// Reset current notification only after the snackbar closes completely
	const handleSnackbarExited = () => {
		setCurrentNotification(null);
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

			<Snackbar
				anchorOrigin={{
					horizontal: "center",
					vertical: "bottom"
				}}
				open={snackbarOpen}
				onClose={handleSnackbarClose}
				TransitionProps={{
					onExited: handleSnackbarExited
				}}
				autoHideDuration={5000}
			>
				<Alert
					variant="filled"
					onClose={handleSnackbarClose}
					severity={currentNotification?.color}
				>
					{currentNotification?.message}
				</Alert>
			</Snackbar>

			<ConfigDialog open={settingsDialog} onClose={() => setSettingsDialog(false)} />

			<div style={{ height: "100%" }}>
				{props.children}
			</div>
		</Box>
	);
}

export default Layout;
