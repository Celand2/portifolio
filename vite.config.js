import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const rootDir = import.meta.dirname;

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, "index.html"),
        apropos: resolve(rootDir, "apropos.html"),
        specialites: resolve(rootDir, "specialites.html"),
        projets: resolve(rootDir, "projets.html"),
        processus: resolve(rootDir, "processus.html"),
        contact: resolve(rootDir, "contact.html"),
      },
    },
  },
});
