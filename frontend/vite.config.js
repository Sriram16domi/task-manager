import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Automatically proxy requests starting with /api to the Express server running on port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
