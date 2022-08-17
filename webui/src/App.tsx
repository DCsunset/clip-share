import {
  Container,
  Grid
} from '@mui/material'
import { useEffect, useState } from 'react';
import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import DeviceList from './components/DeviceList';
import Layout from './components/Layout';
import { decrypt, generateChallenge } from './utils/crypto';
import { AuthRequest, ErrEvent, PairEvent, ShareEvent, UnpairEvent } from './types/server';
import DevicePairing from './components/DevicePairing';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { configState } from './states/config';
import {
  deviceDataState,
  incomingRequestListState,
  newDeviceListState,
  onlineDeviceListState,
  pairedDeviceListState,
  outgoingRequestListState,
  setDeviceClip
} from './states/device';
import { notificationState, SocketCtx, socketStatusState } from './states/app';
import { errorToString } from './utils/errors';
import { removeDevice } from "./utils/device.js";

function App() {
  const config = useRecoilValue(configState);
  const newDevices = useRecoilValue(newDeviceListState);
  const [pairedDevices, setPairedDevices] = useRecoilState(pairedDeviceListState);
  const [socketStatus, setSocketStatus] = useRecoilState(socketStatusState);
  const setNotification = useSetRecoilState(notificationState);
  const setOnlineDevices = useSetRecoilState(onlineDeviceListState);
  const setIncomingRequests = useSetRecoilState(incomingRequestListState);
  const setDeviceData = useSetRecoilState(deviceDataState);
  const setOutgoingRequests = useSetRecoilState(outgoingRequestListState);

  const [socket, setSocket] = useState<Socket | null>(null);

  const connectToServer = async () => {
    let s: Socket | null = null;
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

    s = config.serverUrl.length > 0
      ? io(config.serverUrl, socketOptions)
      : io(socketOptions);

    s.on("connect", () => {
      console.log("[socket] Connected to server");
      setSocketStatus("connected");
    });

    s.on("connect_error", () => {
      console.log("[socket] Failed to connect to server");
      s = null;
    });

    s.on("disconnect", reason => {
      console.log(`[socket] Disconnected from server: ${reason}`);
      if (s === socket) {
        // Active socket disconnected
        // There might be other ongoing sockets if it mounts multiple times
        setSocketStatus("disconnected");
        if (reason === "io client disconnect" || reason === "io server disconnect") {
          // For these reasons, the socket won't auto reconnect
          // Create a new socket to reconnect
          setTimeout(() => setSocket(null), config.reconnectionDelayMax);
        }
      }
    });

    s.on("error", (error: ErrEvent) => {
      setNotification({
        color: "error",
        message: `Socket Error: ${errorToString(error)}`
      });
    });

    s.on("list", data => {
      setOnlineDevices(data);
    });
    
    s.on("pair", (e: PairEvent) => {
      // Use updater form because incomingRequests is not a dependency
      setIncomingRequests(prev => {
        if (prev.findIndex(v => v.deviceId === e.deviceId) !== -1) {
          return prev;
        }
        return [ ...prev, e ];
      });
    });

    s.on("unpair", (e: UnpairEvent) => {
      setPairedDevices(prev => removeDevice(prev, e));
      setNotification({
        color: "info",
        message: `Device ${e.name} unpaired`
      });
			// remove the outgoing event as well (rejection)
			setOutgoingRequests(prev => removeDevice(prev, e));
    });

    s.on("share", async (e: ShareEvent) => {
      try {
        const { type, content } = e.data;
        switch (type) {
          case "clipboard":
            const clip = (await decrypt(content, config.localDevice.privateKey)).toString();
            setDeviceData(prev => setDeviceClip(prev, e.deviceId, clip));
            if (config.autoCopy) {
              await navigator.clipboard.writeText(clip);
            }
            break;
          default:
            setNotification({
              color: "error",
              message: `Share type ${type} not implemented`
            });
        }
      }
      catch (err: any) {
        setNotification({
          color: "error",
          message: err.message
        });
      }
    });

    return s;
  }

  // connect to server when socket is null
  useEffect(() => {
    /**
     * Note: when using StrictMode in development
     * This component will be mounted and unmounted twice quickly.
     * Therefore, there might be twe ongoing connection.
     * The server will disconnect the first one.
     */
    if (socket === null && socketStatus === "disconnected") {
      setSocketStatus("connecting");
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
