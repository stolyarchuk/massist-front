import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dotenvExpand from "dotenv-expand";
import { config as dotenvConfig } from "dotenv";

// Load and expand environment variables
const env = dotenvConfig({ path: ".env" });
dotenvExpand.expand(env);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  define: {
    // Make env variables available in the client code
    "import.meta.env.API_KEY": JSON.stringify(process.env.API_KEY),
    "import.meta.env.API_BASE_URL": JSON.stringify(process.env.API_BASE_URL),
    "import.meta.env.INITIAL_GREETING": JSON.stringify(
      process.env.INITIAL_GREETING
    ),
  },
});
