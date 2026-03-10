import { AuthProvider, useAuth } from "@/context/authContext";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
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

	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.85)).current;

	const [isInitialLoad, setIsInitialLoad] = useState(true);

	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded && !isLoading) {
			SplashScreen.hideAsync();
			setIsInitialLoad(false); // 2. Lock this to false once loaded
		}
	}, [loaded, isLoading]);

	useEffect(() => {
		// Fade + scale in, then gently pulse
		Animated.sequence([
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 600,
					useNativeDriver: true,
				}),
				Animated.spring(scaleAnim, {
					toValue: 1,
					friction: 6,
					tension: 80,
					useNativeDriver: true,
				}),
			]),
			Animated.loop(
				Animated.sequence([
					Animated.timing(scaleAnim, {
						toValue: 1.06,
						duration: 900,
						useNativeDriver: true,
					}),
					Animated.timing(scaleAnim, {
						toValue: 1,
						duration: 900,
						useNativeDriver: true,
					}),
				]),
			),
		]).start();
	}, []);

	if (isInitialLoad) {
		return (
			<View style={styles.loadingContainer}>
				<Animated.Image
					source={require("../../assets/images/app_logo.png")}
					style={[
						styles.logo,
						{
							opacity: fadeAnim,
							transform: [{ scale: scaleAnim }],
						},
					]}
					resizeMode="contain"
				/>
			</View>
		);
	}

	return <Slot />;
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		backgroundColor: "#020807",
		alignItems: "center",
		justifyContent: "center",
	},
	logo: {
		width: 180,
		height: 180,
	},
});
