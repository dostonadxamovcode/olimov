import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase warning threshold slightly — firebase is always large
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Function form catches ALL sub-packages (firebase/storage, firebase/firestore, etc.)
        // String form only catches what's explicitly listed.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('firebase'))  return 'vendor-firebase'
          if (id.includes('recharts'))  return 'vendor-recharts'
          // react, react-dom, react-router-dom, react/jsx-runtime, scheduler, etc.
          if (id.includes('react'))     return 'vendor-react'
        },
      },
    },
  },
})
