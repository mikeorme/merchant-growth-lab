// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mikeorme.github.io',
  base: '/merchant-growth-lab',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
