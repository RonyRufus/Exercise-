import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Keep whatever plugin you are already using here

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Exercise-/', 
})
