import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/wallet-sdk',
      '@midnight-ntwrk/midnight-js-protocol',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-node-zk-config-provider',
      '@midnight-ntwrk/testkit-js',
    ],
  },
});
