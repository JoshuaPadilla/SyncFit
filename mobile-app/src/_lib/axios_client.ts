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
