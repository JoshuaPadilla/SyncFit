import { useAuth } from "@/context/authContext";
import { router } from "expo-router";
import React from "react";
import { Button, View } from "react-native";

const user_home = () => {
	const { signOut } = useAuth();

	return (
		<View className="flex-1 justify-center items-center p-4 bg-darkBgTop">
			<Button
				title="Signout"
				onPress={() => {
					router.push("/(auth_screens)/payment-test");
				}}
			/>
		</View>
	);
};

export default user_home;
