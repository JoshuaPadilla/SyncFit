import { api } from "@/_lib/axios_client";
import { create } from "zustand";

type StoreProps = {
	paymentStoreLoading: boolean;
	createCheckoutSession: (data: {
		membershipPlanId: string;
	}) => Promise<string>;
};

export const usePaymentStore = create<StoreProps>((set) => ({
	paymentStoreLoading: false,
	createCheckoutSession: async (data) => {
		try {
			set({ paymentStoreLoading: true });

			const res = await api.post("payment/plan-checkout", data);

			return res.data.url;
		} catch {
		} finally {
			set({ paymentStoreLoading: false });
		}
	},
}));
