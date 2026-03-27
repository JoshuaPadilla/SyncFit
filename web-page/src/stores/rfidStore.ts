import { api } from "@/lib/api";
import { create } from "zustand";

type StoreProps = {
	loading: boolean;
	registerRfid: (userId: string) => Promise<void>;
	reassignRfid: (userId: string) => Promise<void>;
	cancelRegistration: () => Promise<void>;
	cancelReassignment: () => Promise<void>;
	resetRfid: (userId: string) => Promise<void>;
};

export const useRfidStore = create<StoreProps>((set) => ({
	loading: false,
	registerRfid: async (userId) => {
		set({ loading: true });
		try {
			await api.post(`rfid/register-rfid/${userId}`);
		} catch (error) {
		} finally {
			set({ loading: false });
		}
	},
	reassignRfid: async (userId) => {
		set({ loading: true });

		try {
			await api.post(`rfid/reassign-rfid/${userId}`);
		} catch (error) {
		} finally {
			set({ loading: false });
		}
	},

	cancelRegistration: async () => {
		set({ loading: true });

		try {
			await api.post(`rfid/cancel-registration`);
		} catch (error) {
		} finally {
			set({ loading: false });
		}
	},

	cancelReassignment: async () => {
		set({ loading: true });

		try {
			await api.post(`rfid/cancel-reassignment`);
		} catch (error) {
		} finally {
			set({ loading: false });
		}
	},

	resetRfid: async (userId) => {
		try {
			await api.patch(`rfid/reset-rfid/${userId}`);
		} catch (error) {
			console.error("Failed to reset RFID", error);
			throw error;
		}
	},
}));
