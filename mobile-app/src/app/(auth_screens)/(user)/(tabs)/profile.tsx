import CustomButton from "@/components/custom_button";
import { FloatingBlob } from "@/components/floating_blob";
import { useAuth } from "@/context/authContext";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mockUserData = {
	id: "efc47e21-4be3-4684-833f-0adb8d293d29",
	email: "mcsantos@email.com",
	firstName: "Maria Clara",
	lastName: "Santos",
	phoneNumber: "9354872804",
	role: "user",
	member: {
		id: "5afa5e78-c172-418c-8daa-59b7036329e0",
		rfidUid: null,
		membershipPlan: {
			id: "8bb32d22-3d32-40c5-b9f6-1fddd530c22e",
			desc: "Pay once, use until credits run out.",
			title: "₱500",
			iconName: "CreditCard",
			type: "prepaid",
			price: "500.00",
			durationDays: null,
			createdAt: "2026-02-18T17:08:16.876Z",
		},
		status: "active",
		balance: "350.00",
		dateActivated: "2026-02-25T13:24:54.532Z",
		lastRenewalDate: null,
		expirationDate: null,
		createdAt: "2026-02-25T05:24:59.587Z",
		updatedAt: "2026-02-26T03:48:23.620Z",
	},
	createdAt: "2026-02-25T05:24:40.941Z",
	updatedAt: "2026-02-25T05:24:40.941Z",
};

const SettingItem = ({ icon, title, isDestructive = false }: any) => (
	<TouchableOpacity className="flex-row items-center justify-between p-4 bg-[#111A18] rounded-2xl mb-3">
		<View className="flex-row items-center gap-4">
			<View
				className={`p-2 rounded-full ${isDestructive ? "bg-red-500/10" : "bg-[#1A2624]"}`}
			>
				{icon}
			</View>
			<Text
				className={`font-body-semibold text-base ${isDestructive ? "text-red-500" : "text-white"}`}
			>
				{title}
			</Text>
		</View>
		{!isDestructive && (
			<Feather name="chevron-right" size={20} color="#6B7280" />
		)}
	</TouchableOpacity>
);

const UserProfile = () => {
	const { signOut } = useAuth();
	const { firstName, lastName, member, id } = mockUserData;
	const isPrepaid = member.membershipPlan.type === "prepaid";

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="flex-1 bg-[#020807]">
				<StatusBar style="light" />

				<LinearGradient
					colors={["#0d2120", "#020807"]}
					className="absolute w-full h-full"
				/>

				<FloatingBlob
					className="absolute top-[200] right-[-70] w-80 h-80 bg-neon/10 rounded-full blur-[80px]"
					duration={5000}
					offset={30}
				/>
				<FloatingBlob
					className="absolute top-[-80] right-[-20] size-40 bg-neon/10 rounded-full blur-[80px]"
					duration={3500}
					offset={15}
				/>

				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<SafeAreaView className="flex-1">
						{/* Header */}
						<View className="flex-row justify-between items-center px-6 pt-4 pb-2">
							<TouchableOpacity>
								<Feather
									name="arrow-left"
									size={24}
									color="white"
								/>
							</TouchableOpacity>
							<Text className="text-white font-header-bold text-lg">
								Profile
							</Text>
							<TouchableOpacity>
								<Feather
									name="settings"
									size={24}
									color="white"
								/>
							</TouchableOpacity>
						</View>

						<ScrollView
							contentContainerStyle={{
								paddingHorizontal: 20,
								paddingBottom: 100,
							}}
							showsVerticalScrollIndicator={false}
						>
							{/* Profile Info Avatar */}
							<View className="items-center mt-6 mb-8">
								<View className="relative">
									<View className="w-24 h-24 bg-neon/20 rounded-full justify-center items-center border-2 border-neon shadow-[0_0_15px_rgba(32,229,181,0.5)]">
										<Text className="text-neon font-header-bold text-3xl">
											{firstName.charAt(0)}
											{lastName.charAt(0)}
										</Text>
									</View>
									<View className="absolute bottom-0 right-0 bg-neon rounded-full p-1 border-2 border-[#020807]">
										<Feather
											name="check"
											size={12}
											color="#020807"
										/>
									</View>
								</View>

								<Text className="text-white font-header-bold text-2xl mt-4">
									{firstName} {lastName}
								</Text>

								<View className="flex-row items-center gap-2 mt-2">
									<View className="bg-neon/20 px-2 py-1 rounded border border-neon/30">
										<Text className="text-neon font-body-semibold text-xs uppercase">
											{member.status}
										</Text>
									</View>
									<Text className="text-gray-400 font-body-reg text-xs">
										ID: #{id.split("-")[0].toUpperCase()}
									</Text>
								</View>
							</View>

							{/* Stats Row */}
							<View className="flex-row gap-4 mb-6">
								<View className="flex-1 bg-[#111A18] p-5 rounded-2xl items-center border border-white/5">
									<MaterialCommunityIcons
										name="dumbbell"
										size={28}
										color="#20E5B5"
										className="mb-2"
									/>
									<Text className="text-white font-header-bold text-2xl mt-2">
										142
									</Text>
									<Text className="text-gray-400 font-body-semibold text-[10px] tracking-widest uppercase mt-1">
										Total Visits
									</Text>
								</View>
								<View className="flex-1 bg-[#111A18] p-5 rounded-2xl items-center border border-white/5">
									<MaterialCommunityIcons
										name="wallet-outline"
										size={28}
										color="#20E5B5"
										className="mb-2"
									/>
									<Text className="text-white font-header-bold text-2xl mt-2">
										₱{member.balance}
									</Text>
									<Text className="text-gray-400 font-body-semibold text-[10px] tracking-widest uppercase mt-1">
										Balance
									</Text>
								</View>
							</View>

							{/* Current Plan Card */}
							<View className="bg-[#111A18] p-5 rounded-2xl border border-neon/30 mb-8 relative overflow-hidden">
								<View className="absolute top-0 right-0 p-4 opacity-10">
									<MaterialCommunityIcons
										name="diamond-stone"
										size={80}
										color="#20E5B5"
									/>
								</View>

								<Text className="text-neon font-body-semibold text-[10px] tracking-widest uppercase mb-2">
									Current Plan
								</Text>
								<Text className="text-white font-header-bold text-xl mb-4 capitalize">
									{member.membershipPlan.type} Pass
								</Text>

								<View className="mb-4">
									<View className="flex-row justify-between mb-2">
										<Text className="text-gray-400 font-body-reg text-xs">
											{isPrepaid
												? "Credits Remaining"
												: "Days Used"}
										</Text>
										<Text className="text-white font-body-semibold text-xs">
											{isPrepaid
												? `₱${member.balance} / ₱${member.membershipPlan.price}`
												: "3 days left"}
										</Text>
									</View>
									<View className="h-1.5 bg-[#1A2624] rounded-full overflow-hidden">
										<View
											className="h-full bg-neon rounded-full"
											style={{
												width: isPrepaid
													? `${(parseFloat(member.balance) / parseFloat(member.membershipPlan.price)) * 100}%`
													: "70%",
											}}
										/>
									</View>
								</View>

								<View className="flex-row justify-between items-center pt-2">
									<View>
										<Text className="text-gray-400 font-body-reg text-[10px] uppercase tracking-widest">
											Valid Until
										</Text>
										<Text className="text-white font-body-semibold text-sm">
											{isPrepaid
												? "No Expiration"
												: "Oct 24, 2026"}
										</Text>
									</View>
									<TouchableOpacity className="bg-neon px-4 py-2 rounded-lg">
										<Text className="text-[#020807] font-body-bold text-xs">
											Top Up
										</Text>
									</TouchableOpacity>
								</View>
							</View>

							{/* Account Settings Menu */}
							<Text className="text-gray-400 font-body-semibold text-[11px] tracking-widest uppercase mb-4 ml-2">
								Account Settings
							</Text>

							<SettingItem
								icon={
									<Feather
										name="user"
										size={18}
										color="#20E5B5"
									/>
								}
								title="Personal Information"
							/>
							<SettingItem
								icon={
									<Feather
										name="bell"
										size={18}
										color="#20E5B5"
									/>
								}
								title="Notifications"
							/>
							<SettingItem
								icon={
									<Feather
										name="shield"
										size={18}
										color="#20E5B5"
									/>
								}
								title="Privacy & Security"
							/>

							<View className="mt-2 mb-6">
								<SettingItem
									icon={
										<Feather
											name="credit-card"
											size={18}
											color="#EF4444"
										/>
									}
									title={
										member.rfidUid
											? "Unlink RFID Card"
											: "No RFID Linked"
									}
									isDestructive={true}
								/>
							</View>

							<CustomButton onPress={signOut} title="Sign Out" />
						</ScrollView>
					</SafeAreaView>
				</KeyboardAvoidingView>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default UserProfile;
