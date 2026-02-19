import axios from "axios";
import { supabase } from "./supabase";
export const api = axios.create({
	baseURL: process.env.EXPO_PUBLIC_DEV_BASE_URL,
	timeout: 10000,
});

api.interceptors.request.use(
	async (config) => {
		// 1. Get the session from Supabase
		const {
			data: { session },
		} = await supabase.auth.getSession();

		// 2. If session exists, attach the JWT
		if (session?.access_token) {
			config.headers.Authorization = `Bearer ${session.access_token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
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
			// The request was made but no response was received
			console.error("🌐 NETWORK ERROR: No response received.");
		} else {
			// Something happened in setting up the request
			console.error("⚙️ AXIOS CONFIG ERROR:", error.message);
		}
		return Promise.reject(error);
	},
);
