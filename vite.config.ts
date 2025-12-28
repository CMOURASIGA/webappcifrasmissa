
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
    // Isso mapeia as variáveis do Vercel para o código front-end
    'process.env.google_api': JSON.stringify(process.env.google_api || ''),
    'process.env.DRIVE_FOLDER_ID': JSON.stringify(process.env.DRIVE_FOLDER_ID || '')
  }
});
