import { MembershipType } from "@/enums/membership_type.enum";

export type MembershipPlan = {
	id: string;
	name: string;
	desc: string;
	type: MembershipType;
	title: string;
	iconName: string;
	price: number;
	durationDays: number | null;
	createdAt: Date;
};
