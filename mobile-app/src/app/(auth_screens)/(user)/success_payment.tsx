import { useAuth } from "@/context/authContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle2 } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
	BounceIn,
	FadeInDown,
	FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentSuccessScreen = () => {
	const { refreshUser } = useAuth();
	const handleHome = async () => {
		await refreshUser(); // Refresh user data to get updated balance and membership status
		// Navigate back to your main tab or home screen
		router.replace("/(auth_screens)/(user)/(tabs)/user_home"); // adjust this route to match your home screen
	};

	return (
		<View className="flex-1 bg-darkBgBot">
			<StatusBar style="light" />

			{/* Background Gradient */}
			<LinearGradient
				colors={["#0d2120", "#020807"]}
				className="absolute w-full h-full"
			/>

			<SafeAreaView className="flex-1 px-5 justify-center items-center">
				{/* Animated Success Icon */}
				<Animated.View
					entering={BounceIn.duration(800).delay(100)}
					className="w-32 h-32 bg-neon/10 rounded-full items-center justify-center mb-8 border border-neon/20"
				>
					<CheckCircle2 color="#00F0C5" size={64} strokeWidth={1.5} />
				</Animated.View>

				{/* Text Content */}
				<Animated.View
					entering={FadeInDown.duration(600).delay(300).springify()}
					className="items-center mb-12"
				>
					<Text className="text-text font-header-bold text-3xl mb-3 text-center">
						Top Up Successful!
					</Text>
					<Text className="text-textDim font-body-reg text-base text-center px-4">
						Your transaction was completed successfully. The funds
						have been added to your prepaid balance.
					</Text>
				</Animated.View>

				{/* Bottom Action Button */}
				<Animated.View
					entering={FadeInUp.duration(600).delay(500).springify()}
					className="w-full absolute bottom-10 px-5"
				>
					<TouchableOpacity
						onPress={handleHome}
						className="w-full bg-neon py-4 rounded-2xl items-center justify-center shadow-lg shadow-neon/20"
					>
						<Text className="text-buttonText font-body-bold text-lg">
							Back to Dashboard
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</SafeAreaView>
		</View>
	);
};

export default PaymentSuccessScreen;
