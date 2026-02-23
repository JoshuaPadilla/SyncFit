import { api } from "@/_lib/axios_client";
import { CreateUserDto } from "@/dtos/createUser";
import { User } from "@/types/user";
import { UserDashboardInsights } from "@/types/user_dashboard_insights";
import { create } from "zustand";

type StoreProps = {
	createUser: (data: CreateUserDto) => Promise<User>;
	fetchLoggedUser: () => Promise<User | null>;
	getUserDashboardInsights: () => Promise<UserDashboardInsights>;
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
			// jsonFormatter(res.data);

			return res.data;
		} catch (error: any) {
			console.log(error);
		}
	},
	getUserDashboardInsights: async () => {
		const res = await api.get("user/user-dashboard-insights");

		return res.data;
	},
}));
