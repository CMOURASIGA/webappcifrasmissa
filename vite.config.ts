
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
    // Injeta as variáveis do Vercel para que fiquem disponíveis no process.env do navegador
    // Tenta capturar ambas as versões (maiúsculas e minúsculas) para evitar erros de deploy
    'process.env.GOOGLE_API': JSON.stringify(process.env.GOOGLE_API || process.env.google_api || ''),
    'process.env.DRIVE_FOLDER_ID': JSON.stringify(process.env.DRIVE_FOLDER_ID || process.env.drive_folder_id || '')
  }
});
