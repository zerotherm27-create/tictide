import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "stamp-service-worker",
      closeBundle() {
        const path = "dist/public-sw.js";
        try {
          const sw = readFileSync(path, "utf8");
          writeFileSync(path, `// build: ${Date.now()}\n${sw}`);
        } catch {
          // dev mode — no dist/ yet
        }
      },
    },
  ],
});
