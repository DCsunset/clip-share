import {
  Container,
  Grid
} from '@mui/material'
import { useEffect, useState } from 'react';
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import DeviceList from './components/DeviceList';
import Layout from './components/Layout';
import { generateChallenge } from './utils/crypto';
import { AuthRequest, ErrEvent, PairEvent } from './types/server';
import DevicePairing from './components/DevicePairing';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { configState } from './states/config';
import {
  incomingRequestListState,
  newDeviceListState,
  onlineDeviceListState,
  pairedDeviceListState
} from './states/device';
import { notificationState, SocketCtx, socketStatusState } from './states/app';
import { errorToString } from './utils/errors';

function App() {
  const config = useRecoilValue(configState);
  const newDevices = useRecoilValue(newDeviceListState);
  const pairedDevices = useRecoilValue(pairedDeviceListState);
  const setSocketStatus = useSetRecoilState(socketStatusState);
  const setNotification = useSetRecoilState(notificationState);
  const setOnlineDevices = useSetRecoilState(onlineDeviceListState);
  const setIncomingRequests = useSetRecoilState(incomingRequestListState);

  const [socket, setSocket] = useState<Socket | null>(null);

  const connectToServer = async () => {
    let socket: Socket | null = null;
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
    
    socket.on("pair", (e: PairEvent) => {
      console.log("Pair event", e);
      // Use updater form because incomingRequests is not a dependency
      setIncomingRequests(prev => {
        if (prev.findIndex(v => v.deviceId === e.deviceId) !== -1) {
          return prev;
        }
        return [ ...prev, e ];
      });
    });

    return socket;
  }

  // connect to server when socket is null
  useEffect(() => {
    if (socket === null) {
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
  }, [socket]);

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
    <SocketCtx.Provider value={socket}>
      <Layout>
        <DevicePairing />
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
    </SocketCtx.Provider>
  );
}

export default App;
