import { devtools } from "@tanstack/devtools-vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import path from "path";

const config = defineConfig({
	plugins: [
		devtools(),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		viteReact(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: [
				"web_logo.png",
				"home_logo.png",
				"icons/icon-192.png",
				"icons/icon-512.png",
				"icons/icon-maskable-512.png",
			],
			manifest: {
				name: "SyncFit",
				short_name: "SyncFit",
				description:
					"SyncFit smart gym dashboard for members, entry logs, and operations.",
				theme_color: "#020807",
				background_color: "#020807",
				display: "standalone",
				start_url: "/",
				scope: "/",
				icons: [
					{
						src: "/icons/icon-192.png",
						type: "image/png",
						sizes: "192x192",
					},
					{
						src: "/icons/icon-512.png",
						type: "image/png",
						sizes: "512x512",
					},
					{
						src: "/icons/icon-maskable-512.png",
						type: "image/png",
						sizes: "512x512",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
				skipWaiting: true,
				navigateFallback: "/index.html",
				runtimeCaching: [
					{
						urlPattern:
							/^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});

export default config;
