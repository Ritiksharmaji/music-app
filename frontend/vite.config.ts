import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3000,
		// uploaded media urls are relative (/api/media/...), served by the backend
		proxy: {
			"/api": "http://localhost:5001",
		},
	},
});
