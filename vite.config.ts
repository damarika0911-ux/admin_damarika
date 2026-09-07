import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
          'vendor-motion': ['framer-motion'],
          'vendor-ui': ['lucide-react', '@headlessui/react'],
        },
      },
    },
  },
  define: {
    __DEBUG__: false
  },
  plugins: [react(), tailwindcss()],
});
