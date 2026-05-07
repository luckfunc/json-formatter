import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': new URL('./src/components', import.meta.url).pathname,
      '@constants': new URL('./src/constants', import.meta.url).pathname,
      '@styles': new URL('./src/styles', import.meta.url).pathname,
      '@utils': new URL('./src/utils', import.meta.url).pathname,
    },
  },
  define: {
    __BUILD_TIME__: JSON.stringify(
      new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    ),
    __BUILD_VERSION__: JSON.stringify(packageJson.version),
  },
});
