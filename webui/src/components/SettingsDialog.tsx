import { mdiCog } from "@mdi/js";
import Icon from "@mdi/react";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	ListItemText,
	TextField
} from "@mui/material";

interface Props {
	open: boolean;
	onClose: () => void;
};

function SettingsDialog(props: Props) {
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
						<ListItemText secondary="server address">
							Server
						</ListItemText>
					</Grid>
					<Grid item display="inline-flex" alignItems="center">
						<TextField
							variant="standard"
						/>
					</Grid>
				</Grid>
			</DialogContent>
			
			<DialogActions>
				<Button onClick={() => {
					props.onClose();
				}}>Cancel</Button>
				<Button>Reset</Button>
				<Button>Save</Button>
			</DialogActions>
		</Dialog>
	)
}

export default SettingsDialog;
