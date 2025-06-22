import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['848d-155-69-182-13.ngrok-free.app']
  }
})
