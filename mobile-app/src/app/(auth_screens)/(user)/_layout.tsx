import { useAuth } from "@/context/authContext";
import React from "react";
import { Button, View } from "react-native";

const UserLayout = () => {
	const { signOut } = useAuth();

	return (
		<View className="flex-1 justify-center items-center p-4 bg-darkBgTop">
			<Button title="Signout" onPress={signOut} />
		</View>
	);
};

export default UserLayout;
