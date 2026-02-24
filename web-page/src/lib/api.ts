import axios from "axios";
import { supabase } from "./supabase";

console.log("API base URL:", import.meta.env.VITE_DEV_BASE_URL);
export const api = axios.create({
	baseURL: import.meta.env.VITE_DEV_BASE_URL,
	timeout: 10000,
});

api.interceptors.request.use(async (config) => {
	const { data } = await supabase.auth.getSession();
	const token = data.session?.access_token;

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

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
