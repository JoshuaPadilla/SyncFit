import { useUserStore } from "@/_stores/userStore";
import { useAuth } from "@/context/authContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
	ArrowLeft,
	ArrowRight,
	Calendar,
	CheckCircle2,
	CreditCard,
	Crown,
	Footprints,
	Phone,
	User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	LayoutAnimation,
	Platform,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import Animated, {
	FadeInDown,
	FadeInRight,
	FadeOutLeft,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// --- TYPES & CONSTANTS ---
enum MembershipType {
	ANNUALLY = "annually",
	MONTHLY = "monthly",
	PREPAID = "prepaid",
	WALKIN = "walkin",
}

const PLANS = [
	{
		id: MembershipType.ANNUALLY,
		title: "Annually",
		price: "$999/yr",
		icon: Crown,
		desc: "Best value for committed members.",
	},
	{
		id: MembershipType.MONTHLY,
		title: "Monthly",
		price: "$99/mo",
		icon: Calendar,
		desc: "Flexible billing, cancel anytime.",
	},
	{
		id: MembershipType.PREPAID,
		title: "Prepaid",
		price: "$500",
		icon: CreditCard,
		desc: "Pay once, use until credits run out.",
	},
	{
		id: MembershipType.WALKIN,
		title: "Walk-In",
		price: "$15/visit",
		icon: Footprints,
		desc: "No commitment, pay as you go.",
	},
];

// --- COMPONENTS ---

// 1. Plan Card Component (Memoized)
const PlanCard = React.memo(
	({
		item,
		isSelected,
		onPress,
		index,
	}: {
		item: (typeof PLANS)[0];
		isSelected: boolean;
		onPress: (id: string) => void;
		index: number;
	}) => {
		const Icon = item.icon;
		return (
			<Animated.View
				entering={FadeInDown.delay(100 + index * 100).springify()}
				className="mb-4"
			>
				<TouchableOpacity
					activeOpacity={0.9}
					onPress={() => onPress(item.id)}
					className={`p-5 rounded-3xl border ${
						isSelected
							? "bg-neon/10 border-neon"
							: "bg-white/5 border-white/10"
					}`}
				>
					<View className="flex-row items-center justify-between mb-2">
						<View
							className={`w-10 h-10 rounded-full items-center justify-center ${
								isSelected ? "bg-neon" : "bg-white/10"
							}`}
						>
							<Icon
								size={20}
								color={isSelected ? "#000000" : "#889999"}
							/>
						</View>
						{isSelected && (
							<CheckCircle2 size={24} color="#00F0C5" />
						)}
					</View>

					<Text
						className={`text-lg font-bold mb-1 ${
							isSelected ? "text-white" : "text-gray-300"
						}`}
					>
						{item.title}
					</Text>
					<Text className="text-neon text-xl font-black mb-1">
						{item.price}
					</Text>
					<Text className="text-gray-400 text-xs font-medium">
						{item.desc}
					</Text>
				</TouchableOpacity>
			</Animated.View>
		);
	},
);

// --- MAIN SCREEN ---
export default function MultiStepOnboarding() {
	const { createUser } = useUserStore();
	const { session } = useAuth();

	// Unified State
	const [step, setStep] = useState(1); // 1: Profile, 2: Membership
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		phoneNumber: "",
		selectedPlan: "",
	});

	// Actions
	const handleNext = () => {
		// Basic validation
		if (step === 1) {
			if (!form.firstName || !form.lastName || !form.phoneNumber) {
				// Add toast or alert here
				console.warn("Please fill all fields");
				return;
			}
			LayoutAnimation.configureNext(
				LayoutAnimation.Presets.easeInEaseOut,
			);
			setStep(2);
		}
	};

	const handleBack = () => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setStep(1);
	};

	const handleFinish = async () => {
		console.log("Submitting:", form);
		// await createUser(form.firstName, form.lastName, form.phoneNumber, form.selectedPlan);
		router.push("/(auth_screens)/(user)/user_home"); // Example navigation
	};

	const updateForm = (key: keyof typeof form, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="flex-1 bg-[#020807]">
				<StatusBar style="light" />

				<LinearGradient
					colors={["#0d2120", "#020807"]}
					className="absolute w-full h-full"
				/>

				{/* DECORATIVE BACKGROUND BLOBS */}
				<View className="absolute top-[-50] left-[-50] w-80 h-80 bg-neon/10 rounded-full blur-[80px]" />
				<View className="absolute bottom-[20%] right-[-20] w-64 h-64 bg-neon/5 rounded-full blur-[100px]" />

				<SafeAreaView className="flex-1 pt-4">
					<KeyboardAvoidingView
						style={{ flex: 1 }}
						behavior={Platform.OS === "ios" ? "padding" : "height"}
					>
						<ScrollView
							contentContainerStyle={{
								flexGrow: 1,
								paddingHorizontal: 32,
								paddingBottom: 40,
							}}
							showsVerticalScrollIndicator={false}
						>
							{/* HEADER / PROGRESS */}
							<View className="flex-row items-center justify-between mb-8 mt-4">
								{step === 2 && (
									<TouchableOpacity
										onPress={handleBack}
										className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
									>
										<ArrowLeft size={20} color="white" />
									</TouchableOpacity>
								)}

								<View className="flex-1">
									<View className="flex-row gap-2 mb-2">
										<View
											className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-neon" : "bg-gray-800"}`}
										/>
										<View
											className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-neon" : "bg-gray-800"}`}
										/>
									</View>
									<Text className="text-neon text-[10px] font-black tracking-[4px] uppercase">
										Step {step} of 2
									</Text>
								</View>
							</View>

							{/* ----- STEP 1: PERSONAL DETAILS ----- */}
							{step === 1 && (
								<Animated.View
									entering={FadeInRight}
									exiting={FadeOutLeft}
									className="flex-1 justify-center"
								>
									<View className="mb-10">
										<Text className="text-white text-4xl font-bold tracking-tight">
											Personal{"\n"}Details
										</Text>
										<View className="w-12 h-1 bg-neon mt-4 rounded-full" />
									</View>

									<View className="gap-y-5">
										{/* First Name */}
										<View>
											<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
												First Name
											</Text>
											<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-3.5 flex-row items-center">
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
														updateForm(
															"firstName",
															t,
														)
													}
													className="flex-1 ml-3 text-white text-base font-medium"
												/>
											</View>
										</View>

										{/* Last Name */}
										<View>
											<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
												Last Name
											</Text>
											<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-3.5 flex-row items-center">
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
														updateForm(
															"lastName",
															t,
														)
													}
													className="flex-1 ml-3 text-white text-base font-medium"
												/>
											</View>
										</View>

										{/* Phone */}
										<View>
											<Text className="text-gray-400 mb-2 ml-1 text-xs font-medium uppercase tracking-wider">
												Phone Number
											</Text>
											<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-3.5 flex-row items-center">
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
														updateForm(
															"phoneNumber",
															t,
														)
													}
													className="flex-1 ml-3 text-white text-base font-medium"
												/>
											</View>
										</View>
									</View>

									<TouchableOpacity
										activeOpacity={0.8}
										className="h-16 rounded-2xl flex-row items-center justify-center bg-neon shadow-lg shadow-neon/20 mt-12"
										onPress={handleNext}
									>
										<Text className="text-lg font-black mr-2 text-black">
											NEXT STEP
										</Text>
										<ArrowRight size={20} color="#000" />
									</TouchableOpacity>
								</Animated.View>
							)}

							{/* ----- STEP 2: MEMBERSHIP SELECTION ----- */}
							{step === 2 && (
								<Animated.View
									entering={FadeInRight}
									exiting={FadeOutLeft}
									className="flex-1"
								>
									<View className="mb-8">
										<Text className="text-white text-4xl font-bold tracking-tight">
											Choose Your{"\n"}Access
										</Text>
										<View className="w-12 h-1 bg-neon mt-4 rounded-full" />
									</View>

									<View>
										{PLANS.map((plan, index) => (
											<PlanCard
												key={plan.id}
												item={plan}
												index={index}
												isSelected={
													form.selectedPlan ===
													plan.id
												}
												onPress={(id) =>
													updateForm(
														"selectedPlan",
														id,
													)
												}
											/>
										))}
									</View>

									<TouchableOpacity
										disabled={!form.selectedPlan}
										activeOpacity={0.8}
										className={`h-16 rounded-2xl flex-row items-center justify-center shadow-lg mt-8 ${
											form.selectedPlan
												? "bg-neon shadow-neon/20"
												: "bg-gray-800"
										}`}
										onPress={handleFinish}
									>
										<Text
											className={`text-lg font-black ${form.selectedPlan ? "text-black" : "text-gray-500"}`}
										>
											COMPLETE SETUP
										</Text>
									</TouchableOpacity>
								</Animated.View>
							)}
						</ScrollView>
					</KeyboardAvoidingView>
				</SafeAreaView>
			</View>
		</TouchableWithoutFeedback>
	);
}
