import { api } from "@/_lib/axios_client";
import { create } from "zustand";

type StoreProps = {
	login: (data: any) => Promise<any>;
};

export const useAuthStore = create<StoreProps>((set) => ({
	login: async (data) => {
		const res = await api.post("user", data);

		console.log(res.data);
	},
}));
