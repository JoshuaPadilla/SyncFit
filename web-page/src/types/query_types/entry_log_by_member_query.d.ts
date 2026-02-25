import type { EntryLogQuery } from "./entry_log_query";

export interface EntryLogByUserQuery extends EntryLogQuery {
	memberId: string;
}
