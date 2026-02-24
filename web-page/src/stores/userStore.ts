import { api } from "@/lib/api";
import type { UserQuery } from "@/types/query_types/member_query";
import type { User } from "@/types/user";
import { create } from "zustand";

export type PaginatedUsers = {
	data: User[];
	total: number;
	page: number;
	limit: number;
};

type StoreProps = {
	fetchLoggedUser: () => Promise<User | null>;
	fetchUsers: (query?: Partial<UserQuery>) => Promise<PaginatedUsers>;
};

export const useUserStore = create<StoreProps>(() => ({
	fetchLoggedUser: async () => {
		try {
			const res = await api.get("user/logged-user");
			return res.data;
		} catch (error: any) {
			console.log(error);
			return null;
		}
	},
	fetchUsers: async (query = {}) => {
		try {
			const params: Record<string, any> = {};
			if (query.page !== undefined) params.page = query.page;
			if (query.limit !== undefined) params.limit = query.limit;
			if (query.search) params.search = query.search;
			if (query.status) params.status = query.status;
			if (query.membershipType)
				params.membershipType = query.membershipType;
			if (query.isExpired !== undefined)
				params.isExpired = query.isExpired;
			if (query.minBalance !== undefined)
				params.minBalance = query.minBalance;
			if (query.maxBalance !== undefined)
				params.maxBalance = query.maxBalance;

			const res = await api.get("user", { params });
			return res.data;
		} catch (error: any) {
			console.log(error);
			return { data: [], total: 0, page: 1, limit: 5 };
		}
	},
}));
