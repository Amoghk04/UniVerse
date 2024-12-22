import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173, // Optional: specify a custom port if needed
    strictPort: true, // Ensures Vite doesn't change the port if it's already taken
  },
});

