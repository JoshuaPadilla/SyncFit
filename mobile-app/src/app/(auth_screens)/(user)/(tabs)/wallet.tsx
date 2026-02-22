import { FloatingBlob } from "@/components/floating_blob";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const transactions = [
	{
		id: "1",
		type: "Debit",
		amount: 50,
		date: "Feb 22, 2026",
		desc: "Gym Entry - Morning Session",
	},
	{
		id: "2",
		type: "Credit",
		amount: 500,
		date: "Feb 20, 2026",
		desc: "Cash Top-up at Counter",
	},
];

const UserWallet = () => {
	const renderTransaction = ({ item }: any) => (
		<View className="flex-row justify-between items-center bg-white/5 p-4 rounded-2xl mb-3 border border-white/5">
			<View className="flex-1 pr-4">
				<Text className="text-text font-header-semibold text-base">
					{item.desc}
				</Text>
				<Text className="text-textDim font-body-reg text-xs mt-1">
					{item.date}
				</Text>
			</View>
			<Text
				className={`font-body-bold text-base ${item.type === "Credit" ? "text-neon" : "text-white"}`}
			>
				{item.type === "Credit" ? "+" : "-"} {item.amount.toFixed(2)}{" "}
				PHP
			</Text>
		</View>
	);

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
						<Text className="text-text font-header-bold text-2xl mb-6">
							Wallet
						</Text>

						<LinearGradient
							colors={[
								"rgba(0,240,197,0.15)",
								"rgba(0,240,197,0.02)",
							]}
							className="p-6 rounded-3xl border border-neon/20 mb-6 overflow-hidden"
						>
							<Text className="text-textDim font-body-semibold text-xs tracking-widest mb-2">
								CURRENT BALANCE
							</Text>
							<View className="flex-row items-end mb-4">
								<Text className="text-text font-header-bold text-4xl">
									450.00
								</Text>
								<Text className="text-neon font-header-bold text-lg ml-2 mb-1">
									PHP
								</Text>
							</View>
							<View className="flex-row items-center border border-neon/30 bg-neon/10 px-3 py-1.5 rounded-full self-start">
								<View className="w-2 h-2 rounded-full bg-neon mr-2" />
								<Text className="text-neon font-body-bold text-xs tracking-wider">
									RFID: 8A:3F:DE:12
								</Text>
							</View>
						</LinearGradient>

						<View className="flex-row gap-4 mb-8">
							<TouchableOpacity className="flex-1 bg-neon py-4 rounded-xl items-center justify-center">
								<Text className="text-buttonText font-body-bold text-base">
									Top Up
								</Text>
							</TouchableOpacity>
							<TouchableOpacity className="flex-1 bg-white/10 border border-white/10 py-4 rounded-xl items-center justify-center">
								<Text className="text-text font-body-bold text-base">
									Membership
								</Text>
							</TouchableOpacity>
						</View>

						<Text className="text-text font-header-bold text-xl mb-4">
							Recent Transactions
						</Text>

						<FlatList
							data={transactions}
							keyExtractor={(item) => item.id}
							renderItem={renderTransaction}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{ paddingBottom: 40 }}
						/>
					</SafeAreaView>
				</KeyboardAvoidingView>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default UserWallet;
