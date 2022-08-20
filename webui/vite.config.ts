/**
 * Copyright (C) 2022 DCsunset
 * See full notice in README.md in this project
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      '/socket.io': {
        target: "ws://localhost:3000",
        changeOrigin: true,
        ws: true
      }
    }
  },
  plugins: [react()]
})
