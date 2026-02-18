import { api } from "@/_lib/axios_client";
import { CreateUserDto } from "@/dtos/createUser";
import { User } from "@/types/user";
import { create } from "zustand";

type StoreProps = {
	createUser: (token: string, data: CreateUserDto) => Promise<User>;
	fetchLoggedUser: (token: string) => Promise<User>;
};

export const useUserStore = create<StoreProps>((set) => ({
	createUser: async (token, data) => {
		const res = await api.post("user", data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return res.data;
	},
	fetchLoggedUser: async (token) => {
		const res = await api.get("user/logged-user", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return res.data;
	},
}));
