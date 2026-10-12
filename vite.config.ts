import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages:
//  - User site (repo named <you>.github.io)  -> base '/'
//  - Project site (any other repo name)       -> base '/<repo-name>/'
// The deploy workflow sets BASE_PATH for you; locally it defaults to '/'.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
});
