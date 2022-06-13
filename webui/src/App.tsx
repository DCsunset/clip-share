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
import { generateChallenge } from './utils/crypto';
import { AuthRequest, ErrEvent } from './types/server';
import DevicePairing from './components/DevicePairing';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { configState } from './states/config';
import {
  newDeviceListState,
  onlineDeviceListState,
  pairedDeviceListState
} from './states/device';
import { notificationState, socketStatusState } from './states/app';
import { errorToString } from './utils/errors';

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
  const config = useRecoilValue(configState);
  const newDevices = useRecoilValue(newDeviceListState);
  const pairedDevices = useRecoilValue(pairedDeviceListState);
  const setSocketStatus = useSetRecoilState(socketStatusState);
  const setNotification = useSetRecoilState(notificationState);
  const setOnlineDevices = useSetRecoilState(onlineDeviceListState);

  const [socket, setSocket] = useState<Socket | null>(null);
  
  const connectToServer = async () => {
    let socket: Socket | null = null;
    if (!config.localDevice) {
      console.error("Error: Empty local device");
      return null;
    }
    const challenge = await generateChallenge(config.localDevice.privateKey);
    const socketOptions: Partial<ManagerOptions & SocketOptions> = {
      reconnectionDelayMax: config.reconnectionDelayMax,
      transports: ["websocket"],
      auth: {
        challenge,
        name: config.localDevice.name,
        publicKey: config.localDevice.publicKey
      } as AuthRequest
    };

    socket = config.serverUrl.length > 0
      ? io(config.serverUrl, socketOptions)
      : io(socketOptions);
      
    socket.on("connect", () => {
      console.log("[socket] Connected to server");
      setSocketStatus("connected");
    });
    
    socket.on("connect_error", () => {
      console.log("[socket] Failed to connect to server");
      socket = null;
    });
    
    socket.on("disconnect", reason => {
      console.log(`[socket] Disconnected from server: ${reason}`);
      setSocketStatus("disconnected");
      if (reason === "io client disconnect" || reason === "io server disconnect") {
        // For these reasons, the socket won't auto reconnect
        // Create a new socket to reconnect
        setSocket(null);
      }
    });
    
    socket.on("error", (error: ErrEvent) => {
      setNotification({
        color: "error",
        message: `Socket Error: ${errorToString(error)}`
      });
    });
    
    socket.on("list", data => {
      setOnlineDevices(data);
    });

    return socket;
  }

  // connect to server when socket is null
  useEffect(() => {
    if (socket === null && config.localDevice) {
      console.log("[socket] Creating new socket...");
      connectToServer()
        .then(setSocket)
        .catch(err => {
          setSocket(null);
          setNotification({
            color: "error",
            message: `Error: ${err.message}`
          });
        });
    }
  }, [socket, config.localDevice]);

  // Disconnects when config changes
  useEffect(() => {
    if (socket !== null) {
      socket.disconnect();
    }
  }, [config])
    
  // Fetching device list
  useEffect(() => {
    if (socket === null) {
      return;
    }
    
    // fetch immediately
    socket.emit("list");
    const id = setInterval(() => {
      socket.emit("list");
    }, config.fetchingInterval);
    return () => clearInterval(id);
  }, [socket, config]);

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
