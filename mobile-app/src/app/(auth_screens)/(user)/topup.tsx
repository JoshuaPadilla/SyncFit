import { usePaymentStore } from "@/_stores/paymentStore";
import CustomButton from "@/components/custom_button";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { ChevronLeft, Wallet } from "lucide-react-native";
import React, { useState } from "react";
import {
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// If using expo-router, import { router } from "expo-router";

const presetAmounts = [
	"100",
	"200",
	"300",
	"500",
	"1000",
	"2000",
	"3000",
	"4000",
	"5000",
];

const TopUpScreen = () => {
	const { createTopupCheckoutSession } = usePaymentStore();

	const [amount, setAmount] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	// Handle input to ensure only numbers are entered
	const handleAmountChange = (value: string) => {
		// Remove any non-numeric characters
		const cleanValue = value.replace(/[^0-9]/g, "");
		setAmount(cleanValue);
	};

	const handleTopUp = async () => {
		if (!amount || parseInt(amount) <= 0) return;

		try {
			setIsLoading(true);

			const url = await createTopupCheckoutSession({
				amount: parseInt(amount),
			});

			await WebBrowser.openBrowserAsync(url);
		} catch (error) {
			Alert.alert("Error", "Could not complete top-up.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="flex-1 bg-darkBgBot">
				<StatusBar style="light" />

				{/* Background Gradient */}
				<LinearGradient
					colors={["#0d2120", "#020807"]}
					className="absolute w-full h-full"
				/>

				<SafeAreaView className="flex-1 px-5 pt-4">
					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						className="flex-1"
					>
						{/* Header */}
						<Animated.View
							entering={FadeInDown.duration(400).delay(100)}
							className="flex-row items-center justify-between mb-10"
						>
							<TouchableOpacity
								className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
								onPress={() => router.back()} // Uncomment if using expo-router
							>
								<ChevronLeft color="#FFFFFF" size={24} />
							</TouchableOpacity>
							<Text className="text-text font-header-bold text-lg">
								Top Up Balance
							</Text>
							<View className="w-10 h-10" />
							{/* Spacer for alignment */}
						</Animated.View>

						{/* Input Area */}
						{/* Input Area */}
						<Animated.View
							entering={FadeInDown.duration(500).delay(100)}
							className="items-center justify-center mt-12 mb-14 px-6"
						>
							{/* Wallet Icon */}
							<View className="bg-neon/10 p-5 rounded-full mb-8 border border-neon/20">
								<Wallet color="#00F0C5" size={28} />
							</View>

							<Text className="text-textDim font-body-reg text-[11px] mb-3 uppercase tracking-[3px]">
								Enter Amount
							</Text>

							{/* Input Row */}
							<View className="flex-row items-center justify-center">
								<Text className="text-neon font-header-bold text-2xl mr-2">
									PHP
								</Text>

								<TextInput
									className="text-text font-header-bold text-5xl"
									style={{
										lineHeight: 60,
										includeFontPadding: false,
										marginLeft: 4,
										minWidth: 60,
									}}
									keyboardType="number-pad"
									value={amount}
									onChangeText={handleAmountChange}
									placeholder="0"
									placeholderTextColor="rgba(255,255,255,0.15)"
									cursorColor="#00F0C5"
									maxLength={6}
									textAlign="center"
								/>
							</View>
						</Animated.View>

						{/* Quick Preset Amounts */}
						<Animated.View
							entering={FadeInDown.duration(500).delay(300)}
							className="flex-row flex-wrap justify-between mb-8"
						>
							{presetAmounts.map((preset) => (
								<TouchableOpacity
									key={preset}
									onPress={() => setAmount(preset)}
									// w-[31%] ensures 3 items fit with room for spacing
									className={`w-[31%] py-4 rounded-2xl border items-center justify-center mb-3 ${
										amount === preset
											? "bg-neon/20 border-neon"
											: "bg-white/5 border-white/10"
									}`}
								>
									<Text
										className={`font-body-semibold text-sm ${
											amount === preset
												? "text-neon"
												: "text-white"
										}`}
									>
										₱{preset}
									</Text>
								</TouchableOpacity>
							))}
						</Animated.View>

						<View className="flex-1" />

						{/* Bottom Action Button */}
						<Animated.View
							entering={FadeInUp.duration(500).delay(400)}
							className="mb-6"
						>
							<CustomButton
								onPress={handleTopUp}
								isDisabled={!amount || parseInt(amount) <= 0}
								isLoading={isLoading}
								title="Continue"
							/>
						</Animated.View>
					</KeyboardAvoidingView>
				</SafeAreaView>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default TopUpScreen;
