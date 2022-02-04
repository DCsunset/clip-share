import { Alert, AppBar, duration, Snackbar, Toolbar, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { appActions } from "../store/app";
import { useRootDispatch, useRootSelector } from "../store/hooks";
import { Notification } from "../types/app";
import Logo from "../logo.svg";
import { blue } from "@mui/material/colors";

type Props = {
	children?: any
};

function Layout(props: Props) {
	const notifications = useRootSelector(state => state.app.notifications);
	const dispatch = useRootDispatch();

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
			<AppBar position="sticky" style={{ backgroundColor: blue[700] }}>
				<Toolbar style={{ minHeight: "52px" }}>
					<Box sx={{
						display: "flex",
						mr: 1.2
					}}>
						<img width="32px" src={Logo} alt="Portal" />
					</Box>
					<Typography variant="h6" noWrap>
						Clip Share
					</Typography>

					<span style={{ flexGrow: 1 }} />
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

			<div style={{ height: "100%" }}>
				{props.children}
			</div>
		</Box>
	);
}

export default Layout;
