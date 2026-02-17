import { Link } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
	return (
		<SafeAreaView className="flex-1 bg-darkBgBot items-center justify-center">
			<Text className="text-white text-2xl font-bold">
				Register Screen
			</Text>
			<Text className="text-gray-400 mt-2">Transition Successful!</Text>

			<Link href="/" className="mt-10 text-neon">
				Go Back Home
			</Link>
		</SafeAreaView>
	);
}
