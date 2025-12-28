
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  },
  define: {
    // Garante que o front-end enxergue as variáveis independente do caso usado no Vercel
    'process.env.google_api': JSON.stringify(process.env.GOOGLE_API || process.env.google_api || ''),
    'process.env.DRIVE_FOLDER_ID': JSON.stringify(process.env.DRIVE_FOLDER_ID || process.env.drive_folder_id || '')
  }
});
