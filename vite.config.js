import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// รูปตัวอย่างลิงก์ (og:image) ต้องเป็น URL เต็ม: ใช้ VITE_SITE_URL หรือ RENDER_EXTERNAL_URL ที่ Render ตั้งให้ตอน build
const siteUrl = () => (process.env.VITE_SITE_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
const ogImage = () => ({
  name: 'og-image',
  transformIndexHtml(html) {
    const u = siteUrl();
    const tags = u
      ? `<meta property="og:url" content="${u}/">
  <meta property="og:image" content="${u}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:image" content="${u}/og-image.png">`
      : '';
    return html.replace('<!--og-extra-->', tags);
  }
});

export default defineConfig({
  plugins: [react(), ogImage()],
  server: { port: 5173, open: false },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false
  }
});
