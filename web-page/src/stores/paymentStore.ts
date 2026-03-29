import { PaymentStatus } from "@/enums/payment_status.enum";
import { api } from "@/lib/api";
import type { Paginated } from "@/types/paginated_result";
import type { Payment } from "@/types/payment";
import type { PaymentSummary } from "@/types/payment_summary";
import type { PaymentQuery } from "@/types/query_types/payment_query";
import { create } from "zustand";

const EMPTY_SUMMARY: PaymentSummary = {
	totalPayments: 0,
	totalRevenue: 0,
	statusCounts: {
		[PaymentStatus.PENDING]: 0,
		[PaymentStatus.PAID]: 0,
		[PaymentStatus.FAILED]: 0,
	},
	paymentMethods: [],
};

const normalizePayment = (payment: Payment): Payment => ({
	...payment,
	amount: Number(payment.amount),
	member: payment.member
		? {
				...payment.member,
				balance:
					payment.member.balance == null
						? payment.member.balance
						: Number(payment.member.balance),
			}
		: payment.member,
});

type StoreProps = {
	fetchPayments: (
		query?: Partial<PaymentQuery>,
	) => Promise<Paginated<Payment>>;
	fetchPaymentSummary: (
		query?: Partial<PaymentQuery>,
	) => Promise<PaymentSummary>;
};

export const usePaymentStore = create<StoreProps>(() => ({
	fetchPayments: async (query = {}) => {
		try {
			const params: Record<string, unknown> = {};

			if (query.page !== undefined) params.page = query.page;
			if (query.limit !== undefined) params.limit = query.limit;
			if (query.search) params.search = query.search;
			if (query.status) params.status = query.status;
			if (query.paymentMethod) params.paymentMethod = query.paymentMethod;
			if (query.memberId) params.memberId = query.memberId;

			const res = await api.get("payment", { params });

			return {
				...res.data,
				data: (res.data.data ?? []).map(normalizePayment),
			};
		} catch (error) {
			console.error(error);
			return {
				data: [],
				total: 0,
				page: query.page ?? 1,
				limit: query.limit ?? 10,
				totalPages: 1,
			};
		}
	},
	fetchPaymentSummary: async (query = {}) => {
		try {
			const params: Record<string, unknown> = {};

			if (query.search) params.search = query.search;
			if (query.status) params.status = query.status;
			if (query.paymentMethod) params.paymentMethod = query.paymentMethod;
			if (query.memberId) params.memberId = query.memberId;

			const res = await api.get("payment/summary", { params });

			return {
				...EMPTY_SUMMARY,
				...res.data,
				totalPayments: Number(res.data.totalPayments ?? 0),
				totalRevenue: Number(res.data.totalRevenue ?? 0),
				paymentMethods: (res.data.paymentMethods ?? []).map(
					(entry: {
						paymentMethod: string;
						count: number | string;
					}) => ({
						paymentMethod: entry.paymentMethod,
						count: Number(entry.count),
					}),
				),
				statusCounts: {
					[PaymentStatus.PENDING]: Number(
						res.data.statusCounts?.[PaymentStatus.PENDING] ?? 0,
					),
					[PaymentStatus.PAID]: Number(
						res.data.statusCounts?.[PaymentStatus.PAID] ?? 0,
					),
					[PaymentStatus.FAILED]: Number(
						res.data.statusCounts?.[PaymentStatus.FAILED] ?? 0,
					),
				},
			};
		} catch (error) {
			console.error(error);
			return EMPTY_SUMMARY;
		}
	},
}));
