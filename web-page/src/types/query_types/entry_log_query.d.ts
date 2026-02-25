import type { EntryStatus } from "@/enums/entry_status.enum";
import type { BaseQuery } from "./api_base_query";

export interface EntryLogQuery extends BaseQuery {
	status: EntryStatus;
	startDate: Date;
	endDate: Date;
}
