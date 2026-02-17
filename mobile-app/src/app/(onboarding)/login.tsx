import { LinearGradient } from "expo-linear-gradient";

import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
// Using Lucide Icons as requested
import { Image } from "expo-image";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react-native";

export default function LoginScreen() {
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="flex-1 bg-[#020807]">
				<StatusBar style="light" />

				{/* BACKGROUND GRADIENT */}
				<LinearGradient
					colors={["#0d2120", "#020807"]}
					className="absolute w-full h-full"
				/>

				{/* DECORATIVE GLOW BLOBS - Adjusted for softer falloff */}
				<View className="absolute top-[-50] left-[-50] w-80 h-80 bg-neon/10 rounded-full blur-[80px]" />
				<View className="absolute bottom-[10%] right-[-50] w-64 h-64 bg-neon/5 rounded-full blur-[100px]" />

				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<SafeAreaView className="flex-1">
						{/* BACK BUTTON */}

						<ScrollView
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: "center",
							}}
							showsVerticalScrollIndicator={false}
							className="px-8"
						>
							{/* HEADER TEXT */}
							<Animated.View
								entering={FadeInDown.delay(200).springify()}
								className="mb-10"
							>
								<Text className="text-neon text-xs font-black tracking-[4px] uppercase mb-3">
									Secure Access
								</Text>
								<Text className="text-white text-4xl font-bold tracking-tight">
									Welcome{"\n"}Back
								</Text>
								<View className="w-12 h-1 bg-neon mt-4 rounded-full" />
							</Animated.View>

							{/* FORM CONTAINER */}
							<View className="gap-y-4">
								{/* EMAIL INPUT */}
								<Animated.View
									entering={FadeInDown.delay(300).springify()}
								>
									<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
										Email Address
									</Text>
									<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-2 flex-row items-center">
										<Mail
											size={20}
											color={
												email ? "#CCFF00" : "#6B7280"
											}
										/>
										<TextInput
											placeholder="name@example.com"
											placeholderTextColor="#4B5563"
											keyboardType="email-address"
											autoCapitalize="none"
											value={email}
											onChangeText={setEmail}
											className="flex-1 ml-3 text-white text-base"
										/>
									</View>
								</Animated.View>

								{/* PASSWORD INPUT */}
								<Animated.View
									entering={FadeInDown.delay(400).springify()}
								>
									<View className="flex-row justify-between items-end mb-2 ml-1">
										<Text className="text-gray-400 text-xs font-medium uppercase tracking-wider">
											Password
										</Text>
										<TouchableOpacity>
											<Text className="text-neon/80 text-xs font-medium">
												Forgot?
											</Text>
										</TouchableOpacity>
									</View>
									<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-2 flex-row items-center">
										<Lock
											size={20}
											color={
												password ? "#CCFF00" : "#6B7280"
											}
										/>
										<TextInput
											placeholder="••••••••"
											placeholderTextColor="#4B5563"
											secureTextEntry={!passwordVisible}
											value={password}
											onChangeText={setPassword}
											className="flex-1 ml-3 text-white text-base"
										/>
										<TouchableOpacity
											onPress={() =>
												setPasswordVisible(
													!passwordVisible,
												)
											}
										>
											{passwordVisible ? (
												<EyeOff
													size={20}
													color="#6B7280"
												/>
											) : (
												<Eye
													size={20}
													color="#6B7280"
												/>
											)}
										</TouchableOpacity>
									</View>
								</Animated.View>

								{/* MAIN BUTTON */}
								<Animated.View
									entering={FadeInDown.delay(500).springify()}
									className="mt-4"
								>
									<TouchableOpacity
										activeOpacity={0.8}
										className="bg-neon h-16 rounded-2xl flex-row items-center justify-center shadow-2xl shadow-neon/20"
										onPress={() => {}}
									>
										<Text className="text-black text-lg font-black mr-2">
											SIGN IN
										</Text>
										<ArrowRight size={20} color="#000" />
									</TouchableOpacity>
								</Animated.View>
							</View>

							{/* DIVIDER */}
							<Animated.View
								entering={FadeInDown.delay(600).springify()}
								className="flex-row items-center my-10"
							>
								<View className="flex-1 h-[0.5px] bg-white/10" />
								<Text className="mx-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
									Social Login
								</Text>
								<View className="flex-1 h-[0.5px] bg-white/10" />
							</Animated.View>

							{/* GOOGLE BUTTON - Styled as a secondary outline for better hierarchy */}
							<Animated.View
								entering={FadeInDown.delay(700).springify()}
							>
								<TouchableOpacity className="border border-white/10 bg-white/5 flex-row items-center justify-center py-4 rounded-2xl active:bg-white/10">
									<View className="bg-white rounded-full p-1 mr-3">
										{/* You can use a specific Google SVG here, but Lucide doesn't have brands. 
                                            Using a placeholder or your previous Material icon for Google is fine. */}
										<Image
											source={{
												uri: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
											}}
											style={{ width: 24, height: 24 }}
										/>
									</View>
									<Text className="text-white text-base font-bold">
										Continue with Google
									</Text>
								</TouchableOpacity>
							</Animated.View>

							{/* NAVIGATE TO REGISTER */}
							<Animated.View
								entering={FadeInDown.delay(800).springify()}
								className="flex-row justify-center mt-10 pb-10"
							>
								<Text className="text-gray-500 font-medium">
									New here?{" "}
								</Text>
								<TouchableOpacity
									onPress={() =>
										router.replace("/(onboarding)/register")
									}
								>
									<Text className="text-neon font-bold">
										Create Account
									</Text>
								</TouchableOpacity>
							</Animated.View>
						</ScrollView>
					</SafeAreaView>
				</KeyboardAvoidingView>
			</View>
		</TouchableWithoutFeedback>
	);
}
