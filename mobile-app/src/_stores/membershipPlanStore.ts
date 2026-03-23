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

			const payload = res.data;

			console.log("Membership Plans Payload:", payload);

			if (Array.isArray(payload)) {
				return payload;
			}

			if (Array.isArray(payload?.data)) {
				return payload.data;
			}

			return [];
		} catch (error) {
			console.log(error);
			return [];
		} finally {
			set({ isLoading: false });
		}
	},
}));
