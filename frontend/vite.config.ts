// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: { // 添加 build 配置
    outDir: 'build' // 將輸出目錄設置為 'build'
  }
});