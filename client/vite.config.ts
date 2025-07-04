import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    base: mode === "gh" ? "/TokenMeter/" : "/",
    server: {
        open: true,
    },
    plugins: [react()],
}));
