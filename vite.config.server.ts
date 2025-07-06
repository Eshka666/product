import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";

export default defineConfig({
  plugins: [qwikCity(), qwikVite()],
  build: {
    ssr: true,
    outDir: "dist/server",
    rollupOptions: {
      input: "src/entry.ssr.tsx",
    },
  },
});
