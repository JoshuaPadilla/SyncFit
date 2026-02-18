import { DeniedReason } from "@/enums/denied_reason.enum";
import { EntryStatus } from "@/enums/entry_status.enum";
import { Member } from "./member";

export type EntryLog = {
	id: string;
	member: Member | null;
	rfidUid: string;
	status: EntryStatus;
	deniedReason: DeniedReason | null;
	deductedAmount: number | null;
	entryTime: Date;
	createdAt: Date;
};
