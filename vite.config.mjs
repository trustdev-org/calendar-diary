import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isDev = mode === 'development';
    
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
        strictPort: true,
      },
      plugins: [
        react(),
        electron([
          {
            entry: 'electron/main.ts',
            onstart(options) {
              if (isDev) {
                options.startup();
              }
            },
            vite: {
              build: {
                outDir: 'dist-electron',
                lib: {
                  entry: 'electron/main.ts',
                  formats: ['cjs'],
                  fileName: () => 'main.cjs'
                },
                rollupOptions: {
                  external: ['electron', 'electron-updater', 'path', 'fs/promises']
                }
              },
              define: {
                'process.env.NODE_ENV': JSON.stringify(mode)
              }
            }
          },
          {
            entry: 'electron/preload.ts',
            onstart(options) {
              options.reload();
            },
            vite: {
              build: {
                outDir: 'dist-electron',
                lib: {
                  entry: 'electron/preload.ts',
                  formats: ['cjs'],
                  fileName: () => 'preload.cjs'
                },
                rollupOptions: {
                  external: ['electron']
                }
              }
            }
          }
        ]),
        renderer()
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      base: './',
      build: {
        outDir: 'dist',
        emptyOutDir: true
      }
    };
});
