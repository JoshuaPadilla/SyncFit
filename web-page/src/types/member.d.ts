import { MembershipStatus } from "@/enums/membership_status.enum";
import { MembershipPlan } from "./membership_plan";

export type Member = {
	id: string;
	user?: User;
	rfidUid?: string;
	membershipPlan: MembershipPlan;
	status: MembershipStatus;
	balance?: number | null; // decimal columns come back as numbers or strings
	expirationDate?: string | Date | null;
	entryLogs?: any[]; // Replace 'any' with your EntryLogDTO
	payments?: any[]; // Replace 'any' with your PaymentDTO
	createdAt: string | Date;
	updatedAt: string | Date;
};
