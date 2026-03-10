import axios from "axios";
import { supabase } from "./supabase";
console.log("API Base URL:", process.env.EXPO_PUBLIC_DEV_BASE_URL); // DEBUGGING: Check if the env variable is loaded
export const api = axios.create({
	baseURL: process.env.EXPO_PUBLIC_DEV_BASE_URL,
	timeout: 10000,
});

let currentAccessToken: string | null = null;

// 2. Let Supabase update the variable automatically whenever auth changes
supabase.auth.onAuthStateChange((_event, session) => {
	currentAccessToken = session?.access_token || null;
});

api.interceptors.request.use(
	async (config) => {
		if (currentAccessToken) {
			config.headers.Authorization = `Bearer ${currentAccessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response) {
			// The server responded with a status code outside the 2xx range
			console.error("❌ API ERROR:", {
				status: error.response.status,
				data: error.response.data, // THIS is what you need!
				path: error.config.url,
			});
		} else if (error.request) {
			// The request was made but no response was receivedrecommends
			console.error("🌐 NETWORK ERROR: No response received.");
		} else {
			// Something happened in setting up the request
			console.error("⚙️ AXIOS CONFIG ERROR:", error.message);
		}
		return Promise.reject(error);
	},
);
