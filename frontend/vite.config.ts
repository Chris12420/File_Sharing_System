import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace with your GitHub repository name
const repositoryName = 'File_Sharing_System'; // <-- **Enter your repository name here**

// https://vitejs.dev/config/
export default defineConfig(({
  command
}) => ({
  plugins: [react()],
  // --- Add base configuration ---
  base: command === 'build' ?
    `/${repositoryName}/` // Use repository name as base path for production build
    :
    '/', // Use root path for development
  // --- End base configuration ---
  server: {
    port: 3000, // You can specify the port for the dev server
    open: true, // Automatically open the app in the browser
  },
})); 