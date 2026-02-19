import { api } from "@/_lib/axios_client";
import { MembershipPlan } from "@/types/membership_plan";
import { create } from "zustand";

type StoreProps = {
	isLoading: boolean;
	fetchPlans: () => Promise<MembershipPlan[]>;
};

export const useMembershipPlansStore = create<StoreProps>((set) => ({
	isLoading: false,
	fetchPlans: async () => {
		try {
			set({ isLoading: true });
			const res = await api.get("membership-plan");

			return res.data;
		} catch (error) {
			console.log(error);
		} finally {
			set({ isLoading: false });
		}
	},
}));
