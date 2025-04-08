import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { Plugin } from "vite";

// Get backend URL from environment or use localhost when running individually
const backendUrl =
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://backend:8000"
    : "http://localhost:8000");

function injectCSP(): Plugin {
  return {
    name: "inject-csp",
    transformIndexHtml(html) {
      const isProd = process.env.NODE_ENV === "production";
      const cspTag = `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`;
      return html.replace("<!-- CSP_PLACEHOLDER -->", isProd ? cspTag : "");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), injectCSP()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0", // Allow access from outside the container
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
