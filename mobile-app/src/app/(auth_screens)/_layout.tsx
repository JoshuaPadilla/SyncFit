import { Stack } from "expo-router";
import React from "react";

const AuthScreensLayout = () => {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "fade_from_bottom",
			}}
		>
			<Stack.Screen
				name="(user)"
				options={{ headerShown: false, animation: "fade_from_bottom" }}
			/>
		</Stack>
	);
};

export default AuthScreensLayout;
