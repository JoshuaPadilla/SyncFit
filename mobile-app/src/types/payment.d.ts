import { PaymentStatus } from "@/enums/payment_status.enum";
import { Member } from "./member";

export type Payment = {
	id: string;
	member: Member;
	paymongoReference: string;
	amount: number;
	paymentMethod: string;
	status: PaymentStatus;
	rawWebhookData: any | null;
	createdAt: Date;
};
