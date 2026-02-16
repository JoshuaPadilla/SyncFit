import {
	GoogleSignin,
	statusCodes,
} from "@react-native-google-signin/google-signin";
import React, { useEffect } from "react";
import { Button, View } from "react-native";
import { useAuthStore } from "../_lib/_stores/auth_store";

export default function RootLayout() {
	const { login } = useAuthStore();
	useEffect(() => {
		// Configure inside useEffect so it only runs once the component mounts
		GoogleSignin.configure({
			webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
			offlineAccess: true,
		});
	}, []);

	const handleGoogleSignin = async () => {
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();
			const idToken = userInfo.data?.idToken;

			console.log(JSON.stringify(userInfo, null, 2));

			const user = {
				email: userInfo.data?.user.email,
				password: "12345678",
				role: "user",
			};

			await login(user);
		} catch (error: any) {
			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
				console.log("User cancelled the login");
			} else {
				console.error("Sign-in error:", error.message);
			}
		}
	};

	return (
		<View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
			<Button onPress={handleGoogleSignin} title="Signin With Google" />
		</View>
	);
}
