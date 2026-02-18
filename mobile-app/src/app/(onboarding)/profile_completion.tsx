import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteProfileScreen() {
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		phoneNumber: "",
	});

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="flex-1 bg-[#020807]">
				<StatusBar style="light" />

				<LinearGradient
					colors={["#0d2120", "#020807"]}
					className="absolute w-full h-full"
				/>

				{/* DECORATIVE GLOW BLOBS */}
				<View className="absolute top-[-50] left-[-50] w-80 h-80 bg-neon/10 rounded-full blur-[80px]" />
				<View className="absolute bottom-[20%] right-[-20] w-64 h-64 bg-neon/5 rounded-full blur-[100px]" />

				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<SafeAreaView className="flex-1 pt-8">
						<ScrollView
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: "center",
							}}
							showsVerticalScrollIndicator={false}
							className="px-8"
						>
							{/* HEADER */}
							<Animated.View
								entering={FadeInDown.delay(200).springify()}
								className="mb-10"
							>
								<Text className="text-neon text-xs font-black tracking-[4px] uppercase mb-3">
									One last step
								</Text>
								<Text className="text-white text-4xl font-bold tracking-tight">
									Personal{"\n"}Details
								</Text>
								<View className="w-12 h-1 bg-neon mt-4 rounded-full" />
							</Animated.View>

							{/* FORM */}
							<View className="gap-y-4">
								{/* FIRST NAME */}
								<Animated.View
									entering={FadeInDown.delay(300).springify()}
								>
									<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
										First Name
									</Text>
									<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-3 flex-row items-center">
										<User
											size={20}
											color={
												form.firstName
													? "#CCFF00"
													: "#6B7280"
											}
										/>
										<TextInput
											placeholder="Jane"
											placeholderTextColor="#4B5563"
											value={form.firstName}
											onChangeText={(t) =>
												setForm({
													...form,
													firstName: t,
												})
											}
											className="flex-1 ml-3 text-white text-base"
										/>
									</View>
								</Animated.View>

								{/* LAST NAME */}
								<Animated.View
									entering={FadeInDown.delay(400).springify()}
								>
									<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
										Last Name
									</Text>
									<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-3 flex-row items-center">
										<User
											size={20}
											color={
												form.lastName
													? "#CCFF00"
													: "#6B7280"
											}
										/>
										<TextInput
											placeholder="Doe"
											placeholderTextColor="#4B5563"
											value={form.lastName}
											onChangeText={(t) =>
												setForm({
													...form,
													lastName: t,
												})
											}
											className="flex-1 ml-3 text-white text-base"
										/>
									</View>
								</Animated.View>

								{/* PHONE NUMBER */}
								<Animated.View
									entering={FadeInDown.delay(500).springify()}
								>
									<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
										Phone Number
									</Text>
									<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-3 flex-row items-center">
										<Phone
											size={20}
											color={
												form.phoneNumber
													? "#CCFF00"
													: "#6B7280"
											}
										/>
										<TextInput
											placeholder="+1 (555) 000-0000"
											placeholderTextColor="#4B5563"
											keyboardType="phone-pad"
											value={form.phoneNumber}
											onChangeText={(t) =>
												setForm({
													...form,
													phoneNumber: t,
												})
											}
											className="flex-1 ml-3 text-white text-base"
										/>
									</View>
								</Animated.View>
							</View>

							{/* NEXT BUTTON */}
							<Animated.View
								entering={FadeInDown.delay(700).springify()}
								className="mt-10 mb-10"
							>
								<TouchableOpacity
									activeOpacity={0.8}
									className="h-16 rounded-2xl flex-row items-center justify-center bg-neon shadow-2xl shadow-neon/20"
									onPress={() =>
										router.push(
											"/(onboarding)/membership_selection",
										)
									}
								>
									<Text className="text-lg font-black mr-2 text-black">
										CHOOSE PLAN
									</Text>
									<ArrowRight size={20} color="#000" />
								</TouchableOpacity>
							</Animated.View>
						</ScrollView>
					</SafeAreaView>
				</KeyboardAvoidingView>
			</View>
		</TouchableWithoutFeedback>
	);
}
