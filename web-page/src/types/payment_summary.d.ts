import { PaymentStatus } from "@/enums/payment_status.enum";

export type PaymentSummary = {
	totalPayments: number;
	totalRevenue: number;
	statusCounts: Record<PaymentStatus, number>;
	paymentMethods: Array<{
		paymentMethod: string;
		count: number;
	}>;
};
