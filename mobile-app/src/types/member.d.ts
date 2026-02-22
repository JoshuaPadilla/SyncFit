import { MembershipStatus } from "@/enums/membership_status.enum";
import { MembershipType } from "@/enums/membership_type.enum";

export type Member = {
	id: string;
	user?: User;
	rfidUid?: string;
	membershipType: MembershipType;
	status: MembershipStatus;
	balance?: number | null; // decimal columns come back as numbers or strings
	expirationDate?: string | Date | null;
	entryLogs?: any[]; // Replace 'any' with your EntryLogDTO
	payments?: any[]; // Replace 'any' with your PaymentDTO
	createdAt: string | Date;
	updatedAt: string | Date;
};
