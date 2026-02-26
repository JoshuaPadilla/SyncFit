import { api } from "@/_lib/axios_client";
import { EntryLog } from "@/types/entry_log";
import { Paginated } from "@/types/paginated_result.d";
import { EntryLogByUserQuery } from "@/types/query_types/entry_log_by_member_query";
import { create } from "zustand";

type StoreProps = {
	fetchLogs: (
		query?: Partial<EntryLogByUserQuery>,
	) => Promise<Paginated<EntryLog>>;
};

export const useEntryLogStore = create<StoreProps>((set) => ({
	fetchLogs: async (query) => {
		try {
			console.log(query);
			const params: Record<string, any> = {};
			if (query.search) params.search = query.search;
			if (query.memberId) params.memberId = query.memberId;
			if (query.page !== undefined) params.page = query.page;
			if (query.limit !== undefined) params.limit = query.limit;
			if (query.status) params.status = query.status;
			if (query.startDate)
				params.startDate = query.startDate.toISOString();
			if (query.endDate) params.endDate = query.endDate.toISOString();

			const res = await api.get("entry-log/by-member", { params });

			return res.data;
		} catch (error) {}
	},
}));
