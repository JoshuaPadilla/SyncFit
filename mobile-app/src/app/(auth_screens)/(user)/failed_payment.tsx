import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { XCircle } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
	BounceIn,
	FadeInDown,
	FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentFailedScreen = () => {
	const handleRetry = () => {
		// Go back to the TopUp screen to try again
		router.back();
	};

	const handleCancel = () => {
		// Navigate back to the main dashboard
		const handleHome = () => {
			// Navigate back to your main tab or home screen
			router.replace("/(auth_screens)/(user)/(tabs)/user_home"); // adjust this route to match your home screen
		};
	};

	return (
		<View className="flex-1 bg-darkBgBot">
			<StatusBar style="light" />

			{/* Background Gradient (Slightly reddish hue at the top for error context) */}
			<LinearGradient
				colors={["#2a0d0d", "#020807"]}
				className="absolute w-full h-full"
			/>

			<SafeAreaView className="flex-1 px-5 justify-center items-center">
				{/* Animated Failed Icon */}
				<Animated.View
					entering={BounceIn.duration(800).delay(100)}
					className="w-32 h-32 bg-red-500/10 rounded-full items-center justify-center mb-8 border border-red-500/20"
				>
					<XCircle color="#ef4444" size={64} strokeWidth={1.5} />
				</Animated.View>

				{/* Text Content */}
				<Animated.View
					entering={FadeInDown.duration(600).delay(300).springify()}
					className="items-center mb-12"
				>
					<Text className="text-text font-header-bold text-3xl mb-3 text-center">
						Top Up Failed
					</Text>
					<Text className="text-textDim font-body-reg text-base text-center px-4">
						We couldn't process your transaction at this time.
						Please check your payment details and try again.
					</Text>
				</Animated.View>

				{/* Bottom Action Buttons */}
				<Animated.View
					entering={FadeInUp.duration(600).delay(500).springify()}
					className="w-full absolute bottom-10 px-5 gap-y-4"
				>
					<TouchableOpacity
						onPress={handleRetry}
						className="w-full bg-white/10 border border-white/20 py-4 rounded-2xl items-center justify-center"
					>
						<Text className="text-text font-body-bold text-lg">
							Try Again
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={handleCancel}
						className="w-full py-4 rounded-2xl items-center justify-center"
					>
						<Text className="text-textDim font-body-med text-base">
							Cancel
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</SafeAreaView>
		</View>
	);
};

export default PaymentFailedScreen;
