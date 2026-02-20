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
				name="user_home"
				options={{ headerShown: false, animation: "fade_from_bottom" }}
			/>
		</Stack>
	);
};

export default UserLayout;
