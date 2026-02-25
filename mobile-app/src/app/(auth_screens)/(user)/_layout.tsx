import { Stack } from "expo-router";
import React from "react";

const UserLayout = () => {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "fade_from_bottom",
			}}
		>
			<Stack.Screen
				name="(tabs)"
				options={{ headerShown: false, animation: "fade_from_bottom" }}
			/>
			<Stack.Screen
				name="topup"
				options={{ headerShown: false, animation: "fade_from_bottom" }}
			/>
			<Stack.Screen
				name="success_payment"
				options={{ headerShown: false, animation: "fade_from_bottom" }}
			/>
			<Stack.Screen
				name="failed_payment"
				options={{ headerShown: false, animation: "fade_from_bottom" }}
			/>
		</Stack>
	);
};

export default UserLayout;
