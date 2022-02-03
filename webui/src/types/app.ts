import { AlertColor } from "@mui/material";

export type NavigationItem = {
	title: string;
	description: string;
	link: string;
};

export type Notification = {
	id: string,
	color: AlertColor,
	text: string
};
