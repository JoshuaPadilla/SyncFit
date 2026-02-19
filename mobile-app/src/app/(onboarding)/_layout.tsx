import { Stack } from "expo-router";
import React from "react";

const OnboardingLayout = () => {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "fade_from_bottom",
			}}
		>
			<Stack.Screen
				name="login"
				options={{ headerShown: false, animation: "fade_from_bottom" }}
			/>
			<Stack.Screen
				name="register"
				options={{ headerShown: false, animation: "fade_from_bottom" }}
			/>
			<Stack.Screen
				name="profile_completion"
				options={{ headerShown: false, animation: "fade_from_bottom" }}
			/>
		</Stack>
	);
};

export default OnboardingLayout;
