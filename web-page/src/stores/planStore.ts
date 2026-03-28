import type { MembershipType } from "@/enums/membership_type.enum";
import { api } from "@/lib/api";
import type { MembershipPlan } from "@/types/membership_plan";
import { create } from "zustand";

type CreatePlanDto = {
	type: MembershipType;
	price: number;
	title: string;
	iconName: string;
	desc: string;
	durationDays?: number;
};

type StoreProps = {
	fetchPlans: () => Promise<MembershipPlan[]>;
	fetchPlanById: (id: string) => Promise<MembershipPlan | null>;
	createPlan: (dto: CreatePlanDto) => Promise<MembershipPlan>;
	updatePlan: (
		id: string,
		dto: Partial<CreatePlanDto>,
	) => Promise<MembershipPlan>;
	deletePlan: (id: string) => Promise<void>;
};

export const usePlanStore = create<StoreProps>(() => ({
	fetchPlans: async () => {
		const res = await api.get("membership-plan");
		return res.data;
	},
	fetchPlanById: async (id) => {
		try {
			const res = await api.get(`membership-plan/${id}`);
			return res.data;
		} catch {
			return null;
		}
	},
	createPlan: async (dto) => {
		const res = await api.post("membership-plan", dto);
		return res.data;
	},
	updatePlan: async (id, dto) => {
		const res = await api.patch(`membership-plan/${id}`, dto);
		return res.data;
	},
	deletePlan: async (id) => {
		await api.delete(`membership-plan/${id}`);
	},
}));
