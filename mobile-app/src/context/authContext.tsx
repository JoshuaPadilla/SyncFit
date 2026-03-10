import { supabase } from "@/_lib/supabase";
import { useUserStore } from "@/_stores/userStore";
import { User } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
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
	isFirstTime: boolean;
	signIn: (email: string, pass: string) => Promise<any>;
	signUp: (email: string, pass: string) => Promise<any>;
	signOut: () => Promise<void>;
	refreshUser: () => Promise<void>;
	completeOnboarding: () => void; // 👈 We expose this to OnboardingScreen
};

const AuthContext = createContext<AuthData | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
	const router = useRouter();
	const segments = useSegments(); // Tracks our current URL path
	const rootNavigationState = useRootNavigationState(); // Tracks if router is alive

	const { fetchLoggedUser } = useUserStore();
	const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const completeOnboarding = () => setIsFirstTime(false);

	const refreshUser = async () => {
		console.log("Refreshing User...");
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
		setIsFirstTime(false);
		if (error) throw error;
		setSession(data.session);
	};

	const signUp = async (email: string, pass: string) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password: pass,
		});
		if (error) throw error;
		setIsFirstTime(false);
		setSession(data.session);
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) console.error("Error signing out:", error.message);
	};

	// 1. INITIALIZATION: Check Session AND Profile before unblocking UI
	useEffect(() => {
		const initAuth = async () => {
			console.log("Initializing Auth...");
			const hasOpened = await AsyncStorage.getItem("hasOpened");

			if (hasOpened) {
				setIsFirstTime(false);
			}

			try {
				const {
					data: { session: currentSession },
				} = await supabase.auth.getSession();
				setSession(currentSession);

				if (currentSession) {
					await refreshUser();
				}
			} finally {
				console.log(
					"Auth Initialization Complete: Setting isLoading to false",
				); // 👈 Add this
				setIsLoading(false);
			}
		};
		initAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			if (_event === "INITIAL_SESSION") return;

			setSession(session);
			if (session) {
				setIsLoading(true);
				await refreshUser();
				setIsLoading(false);
			} else {
				setUser(null);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	// 2. ROUTING: Redirect whenever loading finishes or user state changes
	useEffect(() => {
		// 🚨 CRITICAL FIX: Do absolutely nothing until Expo Router is mounted
		if (!rootNavigationState?.key) return;
		if (isLoading) return;

		// Find out what route group the user is currently looking at
		const inAuthGroup = segments[0] === "(auth_screens)";
		const onProfileCompletion = segments[0] === "profile_completion";
		const onRoot = segments[0] === undefined;

		console.log("Auth Routing Check:", {
			session,
			user,
			segments,
		});
		if (session && !user) {
			// Logged in, no DB user -> Complete Profile
			if (!onProfileCompletion) router.replace("/profile_completion");
		} else if (session && user && !user.member) {
			// Logged in, not a member -> Profile Step 2
			if (!onProfileCompletion) {
				router.replace({
					pathname: "/profile_completion",
					params: { stepParam: 2 },
				});
			}
		} else if (session && user && user.member) {
			// Fully logged in -> Go to Home
			if (!inAuthGroup)
				router.replace("/(auth_screens)/(user)/(tabs)/user_home");
		} else if (!session) {
			// Not logged in -> Kick out of protected areas
			if (inAuthGroup || onProfileCompletion) {
				router.replace("/(onboarding)/login");
			} else if (!isFirstTime && onRoot) {
				// If they open the app on the '/' screen, but already did onboarding, send to login
				router.replace("/(onboarding)/login");
			}
		}
	}, [
		isLoading,
		isFirstTime,
		session,
		user,
		rootNavigationState?.key,
		segments,
	]);

	return (
		<AuthContext.Provider
			value={{
				session,
				user,
				isLoading,
				isLoggedIn: !!session,
				isFirstTime,
				signIn,
				signUp,
				signOut,
				refreshUser,
				completeOnboarding, // 👈 Export it here
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
}
