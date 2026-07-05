import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({
      server: { entry: "server" },
      nitro: {
        preset: "node-server",
        publicAssets: [
          {
            baseURL: "/assets",
            dir: "dist/client/assets",
          },
          {
            baseURL: "/",
            dir: "dist/client",
          },
        ],
        requestBody: {
          maxSize: "50mb",
        },
      },
    }),
    viteReact(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
});
