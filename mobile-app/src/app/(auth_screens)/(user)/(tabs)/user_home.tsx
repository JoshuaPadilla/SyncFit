import { FloatingBlob } from "@/components/floating_blob";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
	Activity,
	Bell,
	Calendar,
	Clock,
	CreditCard,
	Flame,
	Plus,
} from "lucide-react-native";
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

const UserHome = () => {
	const currentMember = {
		id: "1",
		membershipType: "monthly",
		status: "ACTIVE",
		balance: 1250.0,
		expirationDate: new Date(new Date().setDate(new Date().getDate() + 15)),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const entryLogs = [
		{
			id: "1",
			member: currentMember,
			rfidUid: "ABC-123",
			status: "GRANTED",
			deniedReason: null,
			deductedAmount: 0,
			entryTime: new Date(),
			createdAt: new Date(),
		},
		{
			id: "2",
			member: currentMember,
			rfidUid: "ABC-123",
			status: "GRANTED",
			deniedReason: null,
			deductedAmount: 150,
			entryTime: new Date(new Date().getTime() - 86400000),
			createdAt: new Date(),
		},
	];

	const isPrepaid = true;

	const getRemainingDays = () => {
		if (!currentMember.expirationDate) return 0;
		const diff =
			new Date(currentMember.expirationDate).getTime() -
			new Date().getTime();
		return Math.ceil(diff / (1000 * 3600 * 24));
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const renderLogIcon = (status: string, deducted: number | null) => {
		if (status === "DENIED") return <Activity color="#ef4444" size={20} />;
		if (deducted && deducted > 0)
			return <CreditCard color="#00F0C5" size={20} />;
		return <Calendar color="#889999" size={20} />;
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="flex-1 bg-darkBgBot">
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
					className="absolute top-[-80] right-[-20] w-40 h-40 bg-neon/10 rounded-full blur-[80px]"
					duration={3500}
					offset={15}
				/>
				<FloatingBlob
					className="absolute bottom-[5%] left-[-50] w-64 h-64 bg-neon/5 rounded-full blur-[100px]"
					duration={6000}
					offset={40}
				/>

				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<SafeAreaView className="flex-1 px-5 pt-8">
						<ScrollView showsVerticalScrollIndicator={false}>
							<View className="flex-row justify-between items-center mb-6">
								<View>
									<Text className="text-textDim font-body-med text-sm">
										Welcome back,
									</Text>
									<Text className="text-text font-header-bold text-2xl">
										Hello, Joshu
									</Text>
								</View>
								<TouchableOpacity className="bg-white/5 p-3 rounded-full">
									<Bell color="#FFFFFF" size={20} />
								</TouchableOpacity>
							</View>

							{isPrepaid ? (
								<LinearGradient
									colors={[
										"rgba(0,240,197,0.15)",
										"rgba(0,240,197,0.02)",
									]}
									className="p-5 rounded-3xl border border-neon/20 mb-6 overflow-hidden"
								>
									<Text className="text-neon font-body-semibold text-xs tracking-widest mb-2">
										PREPAID BALANCE
									</Text>
									<View className="flex-row items-end mb-6">
										<Text className="text-text font-header-bold text-4xl">
											{currentMember.balance?.toFixed(
												2,
											) || "0.00"}
										</Text>
										<Text className="text-neon font-header-bold text-lg ml-2 mb-1">
											PHP
										</Text>
									</View>

									<View className="flex-row justify-between items-center">
										<View>
											<Text className="text-textDim font-body-reg text-xs">
												Status
											</Text>
											<Text className="text-text font-body-med text-xs mt-1">
												{currentMember.status}
											</Text>
										</View>
										<TouchableOpacity className="bg-neon flex-row items-center px-4 py-2.5 rounded-xl">
											<Plus color="#000000" size={18} />
											<Text className="text-buttonText font-body-bold ml-1">
												Add Funds
											</Text>
										</TouchableOpacity>
									</View>
								</LinearGradient>
							) : (
								<LinearGradient
									colors={[
										"rgba(255,255,255,0.1)",
										"rgba(255,255,255,0.02)",
									]}
									className="p-5 rounded-3xl border border-white/10 mb-6 overflow-hidden"
								>
									<Text className="text-textDim font-body-semibold text-xs tracking-widest mb-2 uppercase">
										{currentMember.membershipType} PLAN
									</Text>
									<View className="flex-row items-end mb-6">
										<Text className="text-text font-header-bold text-4xl">
											{getRemainingDays()}
										</Text>
										<Text className="text-textDim font-header-bold text-lg ml-2 mb-1">
											Days Left
										</Text>
									</View>

									<View className="flex-row justify-between items-center">
										<View>
											<Text className="text-textDim font-body-reg text-xs">
												Expires on
											</Text>
											<Text className="text-text font-body-med text-xs mt-1">
												{currentMember.expirationDate?.toLocaleDateString()}
											</Text>
										</View>
										<TouchableOpacity className="bg-white flex-row items-center px-4 py-2.5 rounded-xl">
											<Activity
												color="#000000"
												size={18}
											/>
											<Text className="text-buttonText font-body-bold ml-1">
												Renew Plan
											</Text>
										</TouchableOpacity>
									</View>
								</LinearGradient>
							)}

							<View className="flex-row justify-between items-end mb-4">
								<Text className="text-text font-header-bold text-xl">
									Activity Insights
								</Text>
							</View>

							<View className="flex-row gap-4 mb-8">
								<View className="flex-1 bg-white/5 p-5 rounded-2xl border border-white/5 items-start">
									<Flame
										color="#00F0C5"
										size={24}
										className="mb-3"
									/>
									<Text className="text-text font-header-bold text-2xl mb-1">
										4 Days
									</Text>
									<Text className="text-textDim font-body-reg text-xs">
										Current Streak
									</Text>
								</View>

								<View className="flex-1 bg-white/5 p-5 rounded-2xl border border-white/5 items-start">
									<Clock
										color="#00F0C5"
										size={24}
										className="mb-3"
									/>
									<Text className="text-text font-header-bold text-lg mb-1">
										Yesterday
									</Text>
									<Text className="text-textDim font-body-reg text-xs">
										Last Visit
									</Text>
								</View>
							</View>

							<View className="flex-row justify-between items-end mb-4">
								<Text className="text-text font-header-bold text-xl">
									Entry History
								</Text>
								<TouchableOpacity>
									<Text className="text-textDim font-body-med text-sm">
										See All
									</Text>
								</TouchableOpacity>
							</View>

							<View className="gap-y-3 pb-10">
								{entryLogs.map((log) => (
									<View
										key={log.id}
										className="bg-white/5 flex-row items-center p-4 rounded-2xl border border-white/5"
									>
										<View className="w-12 h-12 bg-white/5 rounded-full items-center justify-center mr-4">
											{renderLogIcon(
												log.status,
												log.deductedAmount,
											)}
										</View>
										<View className="flex-1">
											<Text className="text-text font-header-semibold text-base">
												{log.status === "GRANTED"
													? "Entry Granted"
													: "Entry Denied"}
											</Text>
											<Text className="text-textDim font-body-reg text-xs mt-1">
												{log.entryTime.toLocaleDateString()}{" "}
												at {formatTime(log.entryTime)}
											</Text>
										</View>
										<Text
											className={`${!log.deductedAmount ? "text-textDim" : "text-neon"} font-body-semibold text-sm`}
										>
											{!log.deductedAmount
												? "Standard"
												: `-${log.deductedAmount} PHP`}
										</Text>
									</View>
								))}
							</View>
						</ScrollView>
					</SafeAreaView>
				</KeyboardAvoidingView>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default UserHome;
