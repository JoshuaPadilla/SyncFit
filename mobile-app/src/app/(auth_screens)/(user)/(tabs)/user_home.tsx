import { useEntryLogStore } from "@/_stores/entryLogStore";
import { useUserStore } from "@/_stores/userStore";
import { useAuth } from "@/context/authContext";
import { EntryStatus } from "@/enums/entry_status.enum";
import { MembershipType } from "@/enums/membership_type.enum";
import { formatCurrency } from "@/helpers/currency_formatter";
import { dateFormatter } from "@/helpers/date_formatter";
import { getRemainingDays } from "@/helpers/getPlanRemainingDays";
import { formatTime } from "@/helpers/time_formatter";
import { EntryLog } from "@/types/entry_log";
import { UserDashboardInsights } from "@/types/user_dashboard_insights";
import { LinearGradient } from "expo-linear-gradient";
import {
	Activity,
	Bell,
	Calendar,
	Clock,
	CreditCard,
	Flame,
	Plus,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const renderLogIcon = (status: string, deducted: number | null) => {
	if (status === "DENIED") return <Activity color="#ef4444" size={20} />;
	if (deducted && deducted > 0)
		return <CreditCard color="#00F0C5" size={20} />;
	return <Calendar color="#889999" size={20} />;
};

const UserHome = () => {
	const { user } = useAuth();

	const { fetchLogs } = useEntryLogStore();
	const { getUserDashboardInsights } = useUserStore();
	const [insights, setInsights] = useState<UserDashboardInsights | null>(
		null,
	);
	const [recentEntries, setRecentEntries] = useState<EntryLog[]>([]);

	const isPrepaid =
		user?.member?.membershipPlan.type === MembershipType.PREPAID;

	useEffect(() => {
		if (!user) return;

		const init = async () => {
			const result = await getUserDashboardInsights();
			const logs = await fetchLogs({
				memberId: user?.member?.id,
				limit: 5,
			});
			if (logs) setRecentEntries(logs.data);
			if (result) setInsights(result);
		};
		init();
	}, [user]);

	const renderLogItem = useCallback(
		({ item: log }: { item: EntryLog }) => (
			<View className="bg-white/5 flex-row items-center p-4 rounded-2xl border border-white/5 mb-3">
				<View className="w-12 h-12 bg-white/5 rounded-full items-center justify-center mr-4">
					{renderLogIcon(log.status, log.deductedAmount)}
				</View>

				<View className="flex-1">
					<Text
						className={`font-header-semibold text-base ${
							log.status === EntryStatus.GRANTED
								? "text-text"
								: "text-red-400"
						}`}
					>
						{log.status === EntryStatus.GRANTED
							? "Entry Granted"
							: "Entry Denied"}
					</Text>
					<Text className="text-textDim font-body-reg text-xs mt-1">
						{log.status === EntryStatus.DENIED
							? `Reason: ${
									log.deniedReason?.replace("_", " ") ||
									"Unauthorized"
								}`
							: `${new Date(log.entryTime).toLocaleDateString()} at ${formatTime(log.entryTime)}`}
					</Text>
				</View>

				<View className="items-end">
					<Text
						className={`${
							!log.deductedAmount || log.deductedAmount <= 0
								? "text-textDim"
								: "text-neon"
						} font-body-semibold text-sm`}
					>
						{!log.deductedAmount || log.deductedAmount <= 0
							? log.status === EntryStatus.GRANTED
								? "Included"
								: "---"
							: `-${log.deductedAmount} PHP`}
					</Text>
					{log.status === EntryStatus.DENIED && (
						<Text className="text-[10px] text-white/30 mt-1">
							{formatTime(log.entryTime)}
						</Text>
					)}
				</View>
			</View>
		),
		[],
	);

	return (
		<SafeAreaView className="flex-1 px-5 pt-8">
			{/* Fixed header */}
			<View className="flex-row justify-between items-center mb-6">
				<View>
					<Text className="text-textDim font-body-med text-sm">
						Welcome back,
					</Text>
					<Text className="text-text font-header-bold text-2xl">
						Hello, {user?.firstName}
					</Text>
				</View>
				<TouchableOpacity className="bg-white/5 p-3 rounded-full">
					<Bell color="#FFFFFF" size={20} />
				</TouchableOpacity>
			</View>

			{isPrepaid ? (
				<LinearGradient
					colors={["rgba(0,240,197,0.15)", "rgba(0,240,197,0.02)"]}
					className="p-5 rounded-3xl border border-neon/20 mb-6 overflow-hidden"
				>
					<Text className="text-neon font-body-semibold text-xs tracking-widest mb-2">
						PREPAID BALANCE
					</Text>
					<View className="flex-row items-end mb-6">
						<Text className="text-text font-header-bold text-4xl">
							{formatCurrency(user?.member?.balance)}
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
								{user?.member?.status}
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
					colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.02)"]}
					className="p-5 rounded-3xl border border-white/10 mb-6 overflow-hidden"
				>
					<Text className="text-textDim font-body-semibold text-xs tracking-widest mb-2 uppercase">
						{user?.member?.membershipPlan.type} PLAN
					</Text>
					<View className="flex-row items-end mb-6">
						<Text className="text-text font-header-bold text-4xl">
							{getRemainingDays(user?.member?.expirationDate)}
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
								{dateFormatter(user?.member?.expirationDate)}
							</Text>
						</View>
						<TouchableOpacity className="bg-white flex-row items-center px-4 py-2.5 rounded-xl">
							<Activity color="#000000" size={18} />
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
					<Flame color="#00F0C5" size={24} className="mb-3" />
					<Text className="text-text font-header-bold text-2xl mb-1">
						{insights?.streak} days
					</Text>
					<Text className="text-textDim font-body-reg text-xs">
						Current Streak
					</Text>
				</View>
				<View className="flex-1 bg-white/5 p-5 rounded-2xl border border-white/5 items-start">
					<Clock color="#00F0C5" size={24} className="mb-3" />
					<Text className="text-text font-header-bold text-sm mb-1">
						{dateFormatter(insights?.lastVisit) ||
							"Not Visited yet"}
					</Text>
					<Text className="text-textDim font-body-reg text-xs">
						Last Visit
					</Text>
				</View>
			</View>

			{/* Entry history list */}
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

			{/* Scrollable list only */}
			<FlatList
				data={recentEntries}
				keyExtractor={(item) => item.id}
				renderItem={renderLogItem}
				style={{ flex: 1 }}
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
};

export default UserHome;
