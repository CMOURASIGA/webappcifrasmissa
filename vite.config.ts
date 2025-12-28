
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
    // Isso mapeia a variável google_api do Vercel para o código front-end
    'process.env.google_api': JSON.stringify(process.env.google_api || '')
  }
});
