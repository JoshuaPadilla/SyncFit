import { supabase } from "@/_lib/supabase";
import { useUserStore } from "@/_stores/userStore";
import { User } from "@/types/user";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";

type AuthData = {
	session: Session | null;
	user: User | null;
	isLoading: boolean;
	isLoggedIn: boolean;
	signIn: (email: string, pass: string) => Promise<any>;
	signUp: (email: string, pass: string) => Promise<any>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthData | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
	const router = useRouter();
	const { fetchLoggedUser } = useUserStore();

	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const signIn = async (email: string, pass: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password: pass,
		});
		if (error) throw error;
		return data;
	};

	const signUp = async (email: string, pass: string) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password: pass,
		});
		if (error) throw error;
		return data;
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) console.error("Error signing out:", error.message);

		router.replace("/(onboarding)/login");
	};

	useEffect(() => {
		const fetchSession = async () => {
			const { data } = await supabase.auth.getSession();
			setSession(data.session);
		};

		fetchSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, []);

	useEffect(() => {
		const fetchUser = async () => {
			if (!session) {
				setUser(null);
				return;
			}

			// router.replace("/(auth_screens)/(user)/user_home");
		};

		fetchUser();
		setIsLoading(false);
	}, [session]);

	return (
		<AuthContext.Provider
			value={{
				session,
				user,
				isLoading,
				isLoggedIn: !!session,
				// Expose them here:
				signIn,
				signUp,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}

	return context;
}
