import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
  ],
  server: {
    host: true,         // Permite que Docker conecte la red interna con tu PC (0.0.0.0)
    port: 5173,         // Obliga a Vite a usar el puerto 5173
    strictPort: true,   // Si el 5173 está ocupado, Vite dará error en lugar de saltar al 5174
    watch: {
      usePolling: true, // Ayuda a que Docker detecte los cambios de archivos más rápido en Windows
    }
  }
})