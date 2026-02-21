import { useMembershipPlansStore } from "@/_stores/membershipPlanStore";
import { usePaymentStore } from "@/_stores/paymentStore";
import { useUserStore } from "@/_stores/userStore";
import CustomButton from "@/components/custom_button";
import { useAuth } from "@/context/authContext";
import { validateOnboardingStep } from "@/helpers/profile_completion_form_validation";
import { MembershipPlan } from "@/types/membership_plan";
// import { MembershipPlan } from "@/types/membership_plan"; // Ensure this type matches the new JSON or use the interface below
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import {
	Calendar,
	CheckCircle2,
	CreditCard,
	Crown,
	Footprints,
	LucideIcon,
	Phone,
	User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
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

// --- MAIN SCREEN ---
export default function MultiStepOnboarding() {
	const { stepParam } = useLocalSearchParams();
	const { fetchPlans } = useMembershipPlansStore();
	const { createUser } = useUserStore();
	const { createCheckoutSession } = usePaymentStore();
	const { refreshUser } = useAuth();

	// State for plans
	const [plans, setPlans] = useState<MembershipPlan[]>([]);
	const [loadingPlans, setLoadingPlans] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

	const [selectedPlan, setSelectedPlan] = useState("");

	// Unified Form State
	const [step, setStep] = useState(stepParam ? Number(stepParam) : 1); // 1: Profile, 2: Membership
	const [form, setForm] = useState({
		firstName: "Joshua",
		lastName: "Padilla",
		phoneNumber: "9354872804",
	});

	// Actions
	const handleNext = async () => {
		try {
			setIsLoading(true);

			// 1. Prepare the formatted phone number
			let finalPhone = form.phoneNumber.trim();
			if (!finalPhone.startsWith("+")) {
				const stripped = finalPhone.startsWith("0")
					? finalPhone.substring(1)
					: finalPhone;
				finalPhone = `+63${stripped}`;
			}

			// 2. Create the object that will actually be sent/validated
			const formToValidate = { ...form, phoneNumber: finalPhone };

			// 3. VALIDATE THE TEMP OBJECT, NOT 'form'
			const errors = validateOnboardingStep(formToValidate);

			if (errors.length > 0) {
				Alert.alert("Invalid Input", errors[0]);
				return;
			}

			// 4. Save the valid, formatted data to state
			setForm(formToValidate);
			await createUser(form);

			// 5. Proceed
			LayoutAnimation.configureNext(
				LayoutAnimation.Presets.easeInEaseOut,
			);
			setStep(2);
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFinish = async () => {
		try {
			setIsLoading(true);

			const url = await createCheckoutSession({
				membershipPlanId: selectedPlan,
			});

			await WebBrowser.openBrowserAsync(url);
		} catch (error) {
			Alert.alert("Error", "Could not complete registration.");
		} finally {
			setIsLoading(false);
		}
	};
	// await createUser(...)

	const updateForm = (key: keyof typeof form, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	// 3. Fetch Plans Effect
	// We keep this simple to avoid the "setPlans is not a function" error
	useEffect(() => {
		let isMounted = true;

		const loadData = async () => {
			try {
				const data = await fetchPlans();

				if (isMounted && data) {
					setPlans(data);
				}
			} catch (error) {
				console.error("Failed to fetch plans", error);
			} finally {
				if (isMounted) setLoadingPlans(false);
			}
		};

		loadData();

		return () => {
			isMounted = false;
		};
	}, []); // Empty dependency array ensures this runs once

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
											<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-3.5 flex-row items-center ">
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
										<View className="bg-white/5 border border-white/10 focus:border-neon/50 rounded-2xl px-4 py-3.5 flex-row items-center mb-10">
											<Phone
												size={20}
												color={
													form.phoneNumber
														? "#CCFF00"
														: "#6B7280"
												}
											/>

											{/* Permanent Visual Country Code */}
											<Text className="text-white/50 text-base font-medium ml-3">
												+63
											</Text>

											<TextInput
												placeholder="912 345 6789"
												keyboardType="phone-pad"
												maxLength={10} // 10 digits after +63
												value={form.phoneNumber.replace(
													"+63",
													"",
												)}
												onChangeText={(t) => {
													const cleanNumber =
														t.replace(/\D/g, "");
													updateForm(
														"phoneNumber",
														`+63${cleanNumber}`,
													);
												}}
												className="flex-1 ml-3 text-white text-base font-medium"
												// ...
											/>
										</View>
									</View>

									<CustomButton
										isDisabled={
											!form.firstName ||
											!form.lastName ||
											!form.phoneNumber
										}
										onPress={handleNext}
										isLoading={isLoading}
										title="Next Step"
										key={step}
									/>
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
										{loadingPlans ? (
											<View className="py-20">
												<ActivityIndicator
													size="large"
													color="#CCFF00"
												/>
												<Text className="text-gray-400 text-center mt-4">
													Loading plans...
												</Text>
											</View>
										) : (
											// 4. MAP DYNAMIC PLANS INSTEAD OF HARDCODED ARRAY
											plans.map((plan, index) => (
												<PlanCard
													key={plan.id}
													item={plan}
													index={index}
													isSelected={
														selectedPlan === plan.id
													}
													onPress={(id) =>
														setSelectedPlan(id)
													}
												/>
											))
										)}
									</View>

									{!loadingPlans && (
										<CustomButton
											isDisabled={!selectedPlan}
											onPress={handleFinish}
											isLoading={isLoading}
											title="Pay and Complete"
											key={step}
										/>
									)}
								</Animated.View>
							)}
						</ScrollView>
					</KeyboardAvoidingView>
				</SafeAreaView>
			</View>
		</TouchableWithoutFeedback>
	);
}

const PlanCard = React.memo(
	({
		item,
		isSelected,
		onPress,
		index,
	}: {
		item: MembershipPlan;
		isSelected: boolean;
		onPress: (id: string) => void;
		index: number;
	}) => {
		// Get the icon component based on the string name
		const Icon = getIcon(item.iconName);

		// MAPPING LOGIC:
		// API 'type' -> UI Title ("Annually")
		// API 'title' -> UI Price Display ("₱10,999/yr")
		const displayTitle = capitalize(item.type);
		const displayPrice = item.title;

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
						{displayTitle}
					</Text>
					<Text className="text-neon text-xl font-black mb-1">
						{displayPrice}
					</Text>
					<Text className="text-gray-400 text-xs font-medium">
						{item.desc}
					</Text>
				</TouchableOpacity>
			</Animated.View>
		);
	},
);

const iconMap: Record<string, LucideIcon> = {
	Crown: Crown,
	Calendar: Calendar,
	CreditCard: CreditCard,
	Footprints: Footprints,
};

const getIcon = (name: string) => {
	return iconMap[name] || Crown; // Default to Crown if icon name not found
};

const capitalize = (s: string) => {
	if (!s) return "";
	return s.charAt(0).toUpperCase() + s.slice(1);
};
