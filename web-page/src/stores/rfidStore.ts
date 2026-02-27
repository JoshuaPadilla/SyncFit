import { api } from "@/lib/api";
import { create } from "zustand";

type StoreProps = {
	registerRfid: (userId: string) => Promise<void>;
	cancelRegistration: () => Promise<void>;
};

export const useRfidStore = create<StoreProps>((set) => ({
	registerRfid: async (userId) => {
		try {
			await api.post(`rfid/register-rfid/${userId}`);
		} catch (error) {}
	},
	cancelRegistration: async () => {
		try {
			await api.post(`rfid/cancel-registration`);
		} catch (error) {}
	},
}));
