//https server config
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert')
    }
  }
});