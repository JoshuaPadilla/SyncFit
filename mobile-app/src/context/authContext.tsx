import { supabase } from "@/_lib/supabase";
import { useUserStore } from "@/_stores/userStore";
import { jsonFormatter } from "@/helpers/json_formater";
import { User } from "@/types/user";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { getItemAsync } from "expo-secure-store";
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
	refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthData | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
	const router = useRouter();
	const { fetchLoggedUser } = useUserStore();
	const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	jsonFormatter(user);
	const refreshUser = async () => {
		try {
			const loggedUser = await fetchLoggedUser();
			setUser(loggedUser);
		} catch (error) {
			setUser(null);
			console.error("Refresh User Error:", error);
		}
	};

	const signIn = async (email: string, pass: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password: pass,
		});
		if (error) throw error;

		setSession(data.session);
	};

	const signUp = async (email: string, pass: string) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password: pass,
		});
		if (error) throw error;
		setSession(data.session);
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) console.error("Error signing out:", error.message);

		router.replace("/(onboarding)/login");
	};

	// 1. INITIALIZATION: Check Session AND Profile before unblocking UI
	useEffect(() => {
		const initAuth = async () => {
			const hasOpened = await getItemAsync("hasOpened");

			if (hasOpened) setIsFirstTime(false);
			setIsFirstTime(hasOpened === null);
			try {
				const {
					data: { session: currentSession },
				} = await supabase.auth.getSession();
				setSession(currentSession);

				if (currentSession) {
					console.log("fetching logged user");
					await refreshUser(); // Use the new function
				}
			} finally {
				setIsLoading(false);
			}
		};
		initAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
			if (session) await refreshUser();
			else setUser(null);
		});

		return () => subscription.unsubscribe();
	}, []);

	// 2. ROUTING: Redirect whenever loading finishes or user state changes
	useEffect(() => {
		if (isLoading) return;

		// Note: You can add logic here to check 'segments' if you want to avoid
		// redirecting users who are already on the correct screen.

		if (isFirstTime) {
			router.replace("/");
		}

		if (!session) {
			// No session -> Login
			router.replace("/(onboarding)/login");
		} else if (!user) {
			// Session but no user data -> Complete Profile
			router.replace("/profile_completion");
		} else {
			// All good -> Home
			router.replace("/(auth_screens)/(user)/user_home");
		}
	}, [isLoading, session, user]);

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
				refreshUser,
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
