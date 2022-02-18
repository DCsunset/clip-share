import {
  Container,
  createTheme,
  CssBaseline,
  Grid,
  ThemeProvider
} from '@mui/material'
import { useEffect } from 'react';
import { io, Socket, SocketOptions } from "socket.io-client";
import { blue, green, grey } from '@mui/material/colors';
import DeviceList from './components/DeviceList';
import Layout from './components/Layout';
import './App.css';
import { useRootDispatch, useRootSelector } from './store/hooks';
import { generateChallenge } from './utils/crypto';
import { AuthRequest } from './types/types';
import { appActions } from './store/app';

const theme = createTheme({
  typography: {
    fontFamily: [
      "Open Sans",
      "sans-serif"
    ].join(",")
  },
  palette: {
    mode: "dark",
    primary: {
      main: blue[500],
      contrastText: "#fff"
    },
    secondary: {
      main: green[500],
      contrastText: "#fff"
    },
    neutral: {
      main: grey[900],
      dark: "#323232",
      contrastText: "#fff"
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          // With darker linear-gradient backgroundImage in dark mode
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.02))"
        }
      }
    }
  }
});

// function connectToServer(serverUrl: string, dispatch: ReturnType<typeof useRootDispatch>) {
// 	if (serverUrl.length === 0)
// 		return null;
//
// 	// create a new connection
// 	const ws = new WebSocket(serverUrl);
// 	// TODO: handle events
// 	ws.onerror = event => {
// 		dispatch(appActions.addNotification({
// 			color: "error",
// 			text: `Socket Error: ${event}`
// 		}));
// 	};
// 	
// 	ws.onmessage = event => {
// 		try {
// 			const msg = JSON.parse(event.data);
// 			// check type
// 			if (isBaseMessage(msg)) {
// 				const baseMessage = msg as BaseMessage;
// 				if (!baseMessage.success) {
// 					throw new Error(`Error response for ${baseMessage}: ${baseMessage.error}`);
// 				}
//
// 				switch (baseMessage.type) {
// 					case "list": {
// 						if (!isListResponse(baseMessage))
// 							throw new Error(`Invalid message for type ${baseMessage.type}`);
// 						const listResponse = baseMessage as ListResponse;
// 						dispatch(appActions.setOnlineDevices(listResponse.devices));
// 						break;
// 					}
// 					case "pair": {
// 						// TODO
// 						break;
// 					}
// 					case "share": {
// 						// TODO
// 						break;
// 					}
// 					default:
// 						throw new Error(`Invalid message type: ${baseMessage.type}`);
// 				}
// 			}
// 			else {
// 				throw new Error("Invalid message");
// 			}
// 		}
// 		catch (err) {
// 			dispatch(appActions.addNotification({
// 				color: "error",
// 				text: `Socket Error: ${(err as Error).message}`
// 			}));
// 		}
// 	};
// 		
// 	return socket;
// }


function App() {
  const dispatch = useRootDispatch();
  const serverUrl = useRootSelector(state => state.settings.serverUrl);
  const deviceInfo = useRootSelector(state => state.settings.deviceInfo);

  // reconnect to server on url change
  useEffect(() => {
    let socket: Socket | null = null;
    const connectToServer = async () => {
      const challenge = await generateChallenge(deviceInfo.privateKey);
      const socketOptions: SocketOptions = {
        auth: {
          challenge,
          name: deviceInfo.name,
          publicKey: deviceInfo.publicKey
        } as AuthRequest
      };

      socket = serverUrl.length > 0
        ? io(serverUrl, socketOptions)
        : io(socketOptions);
        
      socket.on("connect", () => {
        console.log("Connected to server");
        dispatch(appActions.setSocketStatus("connected"));
      });
      
      socket.on("connect_error", () => {
        dispatch(appActions.addNotification({
          color: "error",
          text: "Error: fail to connect to server"
        }));
      });
      
      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        dispatch(appActions.setSocketStatus("disconnected"));
        socket = null;
      });
    }
    
    connectToServer()
      .catch(err => {
        dispatch(appActions.addNotification({
          color: "error",
          text: `Error: ${err.message}`
        }));
      });
    
    return () => {
      if (socket !== null) {
        socket.disconnect();
      }
    };
  }, [serverUrl, deviceInfo, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Container sx={{ px: 1, py: 2 }} >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <DeviceList type="paired" />
            </Grid>
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <DeviceList type="new" />
            </Grid>
          </Grid>
        </Container>
      </Layout>
    </ThemeProvider>
  )
}

export default App;
