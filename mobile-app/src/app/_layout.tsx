import { AuthProvider, useAuth } from "@/context/authContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { View } from "lucide-react-native";
import { useEffect } from "react";
import "./global.css";

// Keep this here so it runs immediately
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	return (
		<AuthProvider>
			<RootLayoutNav />
		</AuthProvider>
	);
}

function RootLayoutNav() {
	const { isLoading, session } = useAuth();
	const [loaded, error] = useFonts({
		// Inter Weights
		"Inter-Light": require("../../assets/fonts/Inter_28pt-Light.ttf"),
		"Inter-Regular": require("../../assets/fonts/Inter_28pt-Regular.ttf"),
		"Inter-Medium": require("../../assets/fonts/Inter_28pt-Medium.ttf"),
		"Inter-SemiBold": require("../../assets/fonts/Inter_28pt-SemiBold.ttf"),
		"Inter-Bold": require("../../assets/fonts/Inter_28pt-Bold.ttf"),
		"Inter-ExtraBold": require("../../assets/fonts/Inter_28pt-ExtraBold.ttf"),
		// Montserrat Weights
		"Mont-Regular": require("../../assets/fonts/Montserrat-Regular.ttf"),
		"Mont-Medium": require("../../assets/fonts/Montserrat-Medium.ttf"),
		"Mont-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
		"Mont-Bold": require("../../assets/fonts/Montserrat-Bold.ttf"),
		"Mont-ExtraBold": require("../../assets/fonts/Montserrat-ExtraBold.ttf"),
	});

	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		// Hide splash screen only when BOTH fonts are loaded AND auth is checked
		if (loaded && !isLoading) {
			SplashScreen.hideAsync();
		}
	}, [loaded, error, isLoading]);

	// If assets aren't ready, keep showing the splash screen (render nothing)
	if (!loaded || isLoading)
		return (
			<View style={{ flex: 1, backgroundColor: "#020807" }}>
				{/* Optional: You can put an <Image /> here that 
                   matches your splash icon to make reloads seamless.
                */}
			</View>
		);

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "fade_from_bottom",
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="(auth_screens)" />
			<Stack.Screen name="(onboarding)" />
		</Stack>
	);
}
