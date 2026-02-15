import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "./global.css";

export default function RootLayout() {
	const [loaded, error] = useFonts({
		// Inter Weights
		"Inter-Light": require("../assets/fonts/Inter_28pt-Light.ttf"),
		"Inter-Regular": require("../assets/fonts/Inter_28pt-Regular.ttf"),
		"Inter-Medium": require("../assets/fonts/Inter_28pt-Medium.ttf"),
		"Inter-SemiBold": require("../assets/fonts/Inter_28pt-SemiBold.ttf"),
		"Inter-Bold": require("../assets/fonts/Inter_28pt-Bold.ttf"),
		"Inter-ExtraBold": require("../assets/fonts/Inter_28pt-ExtraBold.ttf"),
		// Montserrat Weights
		"Mont-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
		"Mont-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
		"Mont-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
		"Mont-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
		"Mont-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
	});

	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync();
		}
	}, [loaded, error]);

	if (!loaded && !error) return null;

	return <Stack screenOptions={{ headerShown: false }}></Stack>;
}
