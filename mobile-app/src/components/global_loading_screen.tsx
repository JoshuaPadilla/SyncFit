import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const GlobalLoadingScreen = () => {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.85)).current;
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
};

export default GlobalLoadingScreen;

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		backgroundColor: "#0d2120",
		alignItems: "center",
		justifyContent: "center",
	},
	logo: {
		width: 180,
		height: 180,
	},
});
