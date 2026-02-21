import { api } from "@/_lib/axios_client";
import { CreateUserDto } from "@/dtos/createUser";
import { User } from "@/types/user";
import { create } from "zustand";

type StoreProps = {
	createUser: (data: CreateUserDto) => Promise<User>;
	fetchLoggedUser: () => Promise<User | null>;
};

export const useUserStore = create<StoreProps>((set) => ({
	createUser: async (data) => {
		try {
			const res = await api.post("user", data);

			return res.data;
		} catch (error) {
			console.log(error);
		}
	},
	fetchLoggedUser: async () => {
		try {
			const res = await api.get("user/logged-user");

			return res.data;
		} catch (error: any) {
			console.log(error);
		}
	},
}));
