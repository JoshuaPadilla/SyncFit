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
// Import FontAwesome for the Google Icon
// Lucide Icons
import { useAuth } from "@/context/authContext";
import { Image } from "expo-image";
import { Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react-native";

export default function RegisterScreen() {
	const { signUp } = useAuth();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [form, setForm] = useState({
		email: "sample@email.com",
		password: "12345678",
		confirmPassword: "12345678",
	});

	const handleSignup = async () => {
		await signUp(form.email, form.confirmPassword);
	};

	// Placeholder for Google Auth Logic
	const handleGoogleSignup = () => {
		console.log("Google Signup Triggered");
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="flex-1 bg-[#020807]">
				<StatusBar style="light" />

				<LinearGradient
					colors={["#0d2120", "#020807"]}
					className="absolute w-full h-full"
				/>

				{/* DECORATIVE GLOW BLOBS */}
				<View className="absolute top-[-50] right-[-50] w-80 h-80 bg-neon/10 rounded-full blur-[80px]" />
				<View className="absolute bottom-[5%] left-[-50] w-64 h-64 bg-neon/5 rounded-full blur-[100px]" />

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
									Join the Future
								</Text>
								<Text className="text-white text-4xl font-bold tracking-tight">
									Create{"\n"}Account
								</Text>
								<View className="w-12 h-1 bg-neon mt-4 rounded-full" />
							</Animated.View>

							{/* FORM */}
							<View className="gap-y-4">
								{/* EMAIL INPUT */}
								<Animated.View
									entering={FadeInDown.delay(400).springify()}
								>
									<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
										Email Address
									</Text>
									<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-2 flex-row items-center">
										<Mail
											size={20}
											color={
												form.email
													? "#CCFF00"
													: "#6B7280"
											}
										/>
										<TextInput
											placeholder="name@example.com"
											placeholderTextColor="#4B5563"
											keyboardType="email-address"
											autoCapitalize="none"
											value={form.email}
											onChangeText={(t) =>
												setForm({ ...form, email: t })
											}
											className="flex-1 ml-3 text-white text-base"
										/>
									</View>
								</Animated.View>

								{/* PASSWORD INPUT */}
								<Animated.View
									entering={FadeInDown.delay(500).springify()}
								>
									<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
										Password
									</Text>
									<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-2 flex-row items-center">
										<Lock
											size={20}
											color={
												form.password
													? "#CCFF00"
													: "#6B7280"
											}
										/>
										<TextInput
											placeholder="••••••••"
											placeholderTextColor="#4B5563"
											secureTextEntry={!passwordVisible}
											value={form.password}
											onChangeText={(t) =>
												setForm({
													...form,
													password: t,
												})
											}
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

								{/* CONFIRM PASS */}
								<Animated.View
									entering={FadeInDown.delay(500).springify()}
								>
									<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
										Confirm Password
									</Text>
									<View className="bg-white/5 border border-white/10 bg-r focus:border-neon/50 rounded-2xl px-4 py-2 flex-row items-center">
										<Lock
											size={20}
											color={
												form.confirmPassword
													? form.confirmPassword ===
														form.password
														? "#CCFF00"
														: "#f87171"
													: "#6B7280"
											}
										/>
										<TextInput
											placeholder="••••••••"
											placeholderTextColor="#4B5563"
											secureTextEntry={!passwordVisible}
											value={form.confirmPassword}
											onChangeText={(t) =>
												setForm({
													...form,
													confirmPassword: t,
												})
											}
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

								{/* REGISTER BUTTON */}
								<Animated.View
									entering={FadeInDown.delay(700).springify()}
									className="mt-4"
								>
									<TouchableOpacity
										disabled={
											!form.password ||
											form.password !==
												form.confirmPassword
										}
										activeOpacity={0.8}
										className={`${
											!form.password ||
											form.password !==
												form.confirmPassword
												? "bg-neon/20"
												: "bg-neon"
										} h-16 rounded-2xl flex-row items-center justify-center  shadow-2xl shadow-neon/20`}
										onPress={() => handleSignup()}
									>
										<Text className="text-lg font-black mr-2 text-black">
											SIGN UP
										</Text>
										<UserPlus size={20} color="#000" />
									</TouchableOpacity>
								</Animated.View>

								{/* DIVIDER */}
								<Animated.View
									entering={FadeInDown.delay(750).springify()}
									className="flex-row items-center my-4"
								>
									<View className="flex-1 h-[0.5px] bg-white/10" />
									<Text className="mx-4 text-gray-500 text-[10px] font-black uppercase tracking-[2px]">
										Or connect with
									</Text>
									<View className="flex-1 h-[0.5px] bg-white/10" />
								</Animated.View>

								{/* GOOGLE SIGNUP BUTTON */}
								<Animated.View
									entering={FadeInDown.delay(800).springify()}
								>
									<TouchableOpacity
										onPress={handleGoogleSignup}
										activeOpacity={0.7}
										className="border border-white/10 bg-white/5 flex-row items-center justify-center h-16 rounded-2xl active:bg-white/10"
									>
										<View className="mr-3 bg-white rounded-full w-8 h-8 items-center justify-center">
											<Image
												source={{
													uri: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
												}}
												style={{
													width: 24,
													height: 24,
												}}
											/>
										</View>
										<Text className="text-white text-base font-bold">
											Sign up with Google
										</Text>
									</TouchableOpacity>
								</Animated.View>
							</View>

							{/* NAVIGATE TO LOGIN */}
							<Animated.View
								entering={FadeInDown.delay(900).springify()}
								className="flex-row justify-center mt-10 pb-10"
							>
								<Text className="text-gray-500 font-medium">
									Already a member?{" "}
								</Text>
								<TouchableOpacity
									onPress={() =>
										router.replace("/(onboarding)/login")
									}
								>
									<Text className="text-neon font-bold">
										Log In
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
