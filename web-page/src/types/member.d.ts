import { MembershipStatus } from "@/enums/membership_status.enum";
import type { EntryLog } from "./entry_log";
import { MembershipPlan } from "./membership_plan";
import type { Payment } from "./payment";

export type Member = {
	id: string;
	user?: User;
	rfidUid?: string;
	membershipPlan: MembershipPlan;
	status: MembershipStatus;
	balance?: number | null; // decimal columns come back as numbers or strings
	expirationDate?: string | Date | null;
	entryLogs?: EntryLog[]; // Replace 'any' with your EntryLogDTO
	payments?: Payment[]; // Replace 'any' with your PaymentDTO
	createdAt: string | Date;
	updatedAt: string | Date;
};
