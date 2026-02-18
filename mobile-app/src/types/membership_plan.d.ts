import { MembershipType } from "@/enums/membership_type.enum";

export type MembershipPlan = {
	id: string;
	name: string;
	type: MembershipType;
	price: number;
	sessionPrice: number | null;
	durationDays: number | null;
	createdAt: Date;
};
