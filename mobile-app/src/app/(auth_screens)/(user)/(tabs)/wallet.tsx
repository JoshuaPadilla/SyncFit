import { useUserStore } from "@/_stores/userStore";
import { EmptyState } from "@/components/empty_state";
import { useAuth } from "@/context/authContext";
import { formatCurrency } from "@/helpers/currency_formatter";
import { Transaction } from "@/types/transaction";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { BanknoteX } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
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
	const { user } = useAuth();
	const { getUserTransactions } = useUserStore();

	const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
		[],
	);

	useEffect(() => {
		const fetchTransactions = async () => {
			const transactions = await getUserTransactions();
			setRecentTransactions(transactions);
		};

		fetchTransactions();
	}, []);

	const handleTopup = () => {
		router.push("/(auth_screens)/(user)/topup");
	};

	return (
		<SafeAreaView className="flex-1 px-5 pt-8">
			<Text className="text-text font-header-bold text-2xl mb-6">
				Wallet
			</Text>

			<LinearGradient
				colors={["rgba(0,240,197,0.15)", "rgba(0,240,197,0.02)"]}
				className="p-6 rounded-3xl border border-neon/20 mb-6 overflow-hidden "
			>
				<View className="flex-row  justify-between items-end">
					{/* Left Side: Label and Amount */}
					<View className="flex-1">
						<Text className="text-textDim font-body-semibold text-[10px] tracking-[2px] mb-2 uppercase">
							Current Balance
						</Text>

						<View className="flex-row items-baseline">
							<Text className="text-white font-header-bold text-4xl">
								{formatCurrency(user?.member?.balance)}
							</Text>
							<Text className="text-neon font-header-bold text-sm ml-1.5">
								PHP
							</Text>
						</View>
					</View>

					{/* Right Side: Action Button */}
					<TouchableOpacity
						className="bg-neon px-4 py-2 rounded-2xl shadow-lg shadow-neon/20"
						activeOpacity={0.8}
						onPress={handleTopup}
					>
						<Text className="text-black font-body-bold text-sm">
							Top Up
						</Text>
					</TouchableOpacity>
				</View>
			</LinearGradient>

			<Text className="text-text font-header-bold text-xl mb-4">
				Recent Transactions
			</Text>

			<FlatList
				data={recentTransactions}
				keyExtractor={(item) => item.id}
				renderItem={renderTransaction}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingBottom: 40,
					flexGrow: 1,
					justifyContent:
						recentTransactions.length === 0
							? "center"
							: "flex-start", // Centers only if empty
				}}
				ListEmptyComponent={() => (
					<EmptyState
						title="No Transactions"
						message="You haven't made any transactions yet."
						icon={<BanknoteX color="#FFFFFF" size={24} />}
					/>
				)}
			/>
		</SafeAreaView>
	);
};

const renderTransaction = ({ item }: { item: Transaction }) => {
	const isCredit = item.type === "CREDIT";

	return (
		<View className="flex-row justify-between items-center bg-white/5 p-4 rounded-2xl mb-3 border border-white/10">
			{/* Left Side: Info */}
			<View className="flex-1 pr-4">
				<Text
					className="text-white font-header-semibold text-base"
					numberOfLines={1}
				>
					{item.description}
				</Text>
				<Text className="text-textDim font-body-reg text-xs mt-1">
					{new Date(item.createdAt).toLocaleDateString("en-PH", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</Text>
			</View>

			{/* Right Side: Amount & Running Balance */}
			<View className="items-end">
				<Text
					className={`font-body-bold text-base ${
						isCredit ? "text-neon" : "text-red-400"
					}`}
				>
					{isCredit ? "+" : "-"} {formatCurrency(item.amount)}
				</Text>
				<Text className="text-textDim font-body-reg text-[10px] mt-0.5">
					Bal: {formatCurrency(item.runningBalance)}
				</Text>
			</View>
		</View>
	);
};

export default UserWallet;
