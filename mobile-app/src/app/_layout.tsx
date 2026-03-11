import GlobalLoadingScreen from "@/components/global_loading_screen";
import { AuthProvider, useAuth } from "@/context/authContext";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
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
	const { isLoading } = useAuth();
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
		if (loaded && !isLoading) {
			SplashScreen.hideAsync();
		}
	}, [loaded, isLoading]);

	return (
		<View style={{ flex: 1 }}>
			{/* 1. THE ROUTER: 
              Always render <Slot /> so Expo Router can build the navigation tree safely.
            */}
			<Slot />

			{/* 2. THE VISUAL GUARD: 
              Overlay the loading screen whenever auth is fetching data.
            */}
			{isLoading && (
				<View style={styles.loadingOverlay}>
					<GlobalLoadingScreen />
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	loadingOverlay: {
		...StyleSheet.absoluteFillObject, // Stretches over the entire screen
		zIndex: 999, // Keeps it on top of all other screens
		elevation: 999, // Required for Android z-index
	},
});
