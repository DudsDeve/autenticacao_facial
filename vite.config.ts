import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@styles', replacement: path.resolve(__dirname, './src/styles/') },
      { find: '@pages', replacement: path.resolve(__dirname, './src/pages/') },
      { find: '@routes', replacement: path.resolve(__dirname, './src/routes/') },
      { find: '@utils', replacement: path.resolve(__dirname, './src/utils/') },
      { find: '@assets', replacement: path.resolve(__dirname, './src/assets/') },
      { find: '@types', replacement: path.resolve(__dirname, './src/@types/') },
      { find: '@template', replacement: path.resolve(__dirname, './src/template/') },
      { find: '@layouts', replacement: path.resolve(__dirname, './src/layouts/') },
      { find: '@contexts', replacement: path.resolve(__dirname, './src/contexts/') },
      { find: '@hooks', replacement: path.resolve(__dirname, './src/hooks/') },
      { find: '@database', replacement: path.resolve(__dirname, './src/database/') },



      // Adicione mais aliases se quiser!
    ]
  },
});
