import {
  Container,
  createTheme,
  CssBaseline,
  Grid,
  ThemeProvider
} from '@mui/material'
import { useEffect, useState } from 'react';
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { blue, green, grey } from '@mui/material/colors';
import DeviceList from './components/DeviceList';
import Layout from './components/Layout';
import './App.css';
import { useRootDispatch, useRootSelector } from './store/hooks';
import { generateChallenge } from './utils/crypto';
import { AuthRequest } from './types/types';
import { appActions } from './store/app';
import { selectNewDevices } from './store/selectors';
import DevicePairing from './components/DevicePairing';

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

function App() {
  const dispatch = useRootDispatch();
  const serverUrl = useRootSelector(state => state.settings.serverUrl);
  const fetchingInterval = useRootSelector(state => state.settings.fetchingInterval);
  const reconnectionDelayMax = useRootSelector(state => state.settings.reconnectionDelayMax);
  const deviceInfo = useRootSelector(state => state.settings.deviceInfo);
  const newDevices = useRootSelector(selectNewDevices);
  const pairedDevices = useRootSelector(state => state.settings.pairedDevices);
  const [socket, setSocket] = useState<Socket | null>(null);

  // reconnect to server on url change
  useEffect(() => {
    console.log("[socket] Connecting");
    const connectToServer = async () => {
      let socket: Socket | null = null;
      const challenge = await generateChallenge(deviceInfo.privateKey);
      const socketOptions: Partial<ManagerOptions & SocketOptions> = {
        reconnectionDelayMax,
        transports: ["websocket"],
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
        console.log("[socket] Connected to server");
        dispatch(appActions.setSocketStatus("connected"));
      });
      
      socket.on("connect_error", () => {
        console.log("[socket] Fail to connect to server");
        socket = null;
      });
      
      socket.on("disconnect", reason => {
        console.log(`[socket] Disconnected from server: ${reason}`);
        dispatch(appActions.setSocketStatus("disconnected"));
        socket = null;
      });
      
      socket.on("error", error => {
        dispatch(appActions.addNotification({
          color: "error",
          text: `Socket Error: ${error}`
        }));
      });
      
      socket.on("list", data => {
        dispatch(appActions.setOnlineDevices(data));
      });
      
      socket.on("pair", data => {
        dispatch(appActions.addIncomingRequest(data));
      });

      return socket;
    }
    
    connectToServer()
      .then(setSocket)
      .catch(err => {
        setSocket(null);
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
  }, [serverUrl, deviceInfo, reconnectionDelayMax]);
  
  // Fetching device list
  useEffect(() => {
    if (socket === null)
      return;
    
    const id = setInterval(() => {
      socket.emit("list");
    }, fetchingInterval);
    return () => clearInterval(id);
  }, [socket, fetchingInterval]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DevicePairing socket={socket} />
      <Layout>
        <Container sx={{ px: 1, py: 2 }} >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <DeviceList type="paired" devices={pairedDevices} />
            </Grid>
            <Grid item xs={12} md={6} sx={{ p: 1 }}>
              <DeviceList type="new" devices={newDevices} />
            </Grid>
          </Grid>
        </Container>
      </Layout>
    </ThemeProvider>
  )
}

export default App;
