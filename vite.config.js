import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

function copyClassicScriptsPlugin() {
  const classicFiles = [
    'i18n.js',
    'init-products.js',
    'app.js',
    'checkout.js',
    'admin-script.js',
    'firebase-config.js',
    'firebase-auth.js'
  ];

  return {
    name: 'copy-classic-scripts',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist');
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }
      for (const file of classicFiles) {
        const src = resolve(__dirname, file);
        const dest = resolve(outDir, file);
        if (existsSync(src)) {
          copyFileSync(src, dest);
        }
      }
    }
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        products: resolve(__dirname, 'products.html'),
        product: resolve(__dirname, 'product.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        login: resolve(__dirname, 'login.html'),
        orderSuccess: resolve(__dirname, 'order-success.html'),
        profile: resolve(__dirname, 'profile.html'),
        wishlist: resolve(__dirname, 'wishlist.html'),
        about: resolve(__dirname, 'about.html'),
        admin: resolve(__dirname, 'admin-dashboard.html')
      }
    }
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    copyClassicScriptsPlugin()
  ],
  server: {
    port: 3000
  }
});
