import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Isso é CRUCIAL: Pega a variável do sistema do Vercel e a torna visível para o código React
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
