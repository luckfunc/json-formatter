import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_TIME__: JSON.stringify(
      new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    ),
    __BUILD_VERSION__: JSON.stringify(packageJson.version),
  },
});
