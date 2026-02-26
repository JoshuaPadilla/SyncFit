import { EntryStatus } from "@/enums/entry_status.enum";
import { BaseQuery } from "./api_base_query";

export interface EntryLogByUserQuery extends BaseQuery {
	memberId: string;
	status: EntryStatus;
	startDate: Date;
	endDate: Date;
}
