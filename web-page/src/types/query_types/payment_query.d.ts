import { PaymentStatus } from "@/enums/payment_status.enum";
import type { BaseQuery } from "./api_base_query";

export interface PaymentQuery extends BaseQuery {
	status?: PaymentStatus;
	paymentMethod?: string;
	memberId?: string;
}
