import {
  Box,
  Container,
  createTheme,
  CssBaseline,
  Grid,
  ThemeProvider
} from '@mui/material'
import { blue, green, grey } from '@mui/material/colors';

import './App.css'
import DeviceList from './components/DeviceList';
import Layout from './components/Layout';

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
