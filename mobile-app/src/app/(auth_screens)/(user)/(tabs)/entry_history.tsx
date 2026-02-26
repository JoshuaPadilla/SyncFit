import { useEntryLogStore } from "@/_stores/entryLogStore";
import { EmptyState } from "@/components/empty_state";
import { FloatingBlob } from "@/components/floating_blob";
import { useAuth } from "@/context/authContext";
import { EntryStatus } from "@/enums/entry_status.enum";
import { formatCurrency } from "@/helpers/currency_formatter";
import { EntryLog } from "@/types/entry_log";
import { EntryLogByUserQuery } from "@/types/query_types/entry_log_by_member_query";
import DateTimePicker, {
	DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ClockAlert } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterState = {
	page: number;
	limit: number;
	status: EntryStatus | "ALL";
	startDate: Date | null;
	endDate: Date | null;
};

const EntryHistory = () => {
	// --- STATE ---
	const { user } = useAuth();
	const { fetchLogs } = useEntryLogStore();

	const [logs, setLogs] = useState<EntryLog[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [totalEntries, setTotalEntries] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [lastEntryDate, setLastEntryDate] = useState<Date | null>(null);
	const [showDateModal, setShowDateModal] = useState(false);

	// Date Picker States
	const [pickingDate, setPickingDate] = useState<"start" | "end" | null>(
		null,
	);
	const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
	const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

	const [filters, setFilters] = useState<FilterState>({
		page: 1,
		limit: 10,
		status: "ALL",
		startDate: null,
		endDate: null,
	});

	// --- HELPERS ---
	const buildQuery = (f: FilterState): Partial<EntryLogByUserQuery> => ({
		memberId: user?.member?.id || "",
		page: f.page,
		limit: f.limit,
		status: f.status === "ALL" ? undefined : (f.status as EntryStatus),
		startDate: f.startDate ?? undefined,
		endDate: f.endDate ?? undefined,
	});

	const loadLogs = useCallback(
		async (f: FilterState, append = false) => {
			append ? setIsFetchingMore(true) : setIsLoading(true);
			try {
				const result = await fetchLogs(buildQuery(f));
				if (!result) return;

				setLogs((prev) =>
					append ? [...prev, ...result.data] : result.data,
				);
				setTotalEntries(result.total);
				setTotalPages(result.totalPages);

				if (!append) {
					setLastEntryDate(
						result.data.length > 0
							? new Date(result.data[0].entryTime)
							: null,
					);
				}
			} catch (error) {
				console.error("Failed to fetch logs", error);
			} finally {
				setIsLoading(false);
				setIsFetchingMore(false);
			}
		},
		[fetchLogs],
	);

	useEffect(() => {
		const resetFilters = { ...filters, page: 1 };
		setFilters(resetFilters);
		loadLogs(resetFilters);
	}, [filters.status, filters.startDate, filters.endDate]);

	const handleLoadMore = () => {
		if (isFetchingMore || filters.page >= totalPages) return;
		const nextFilters = { ...filters, page: filters.page + 1 };
		setFilters(nextFilters);
		loadLogs(nextFilters, true);
	};

	const openDateModal = () => {
		setTempStartDate(filters.startDate);
		setTempEndDate(filters.endDate);
		setShowDateModal(true);
	};

	const handleDateChange = (
		event: DateTimePickerEvent,
		selectedDate?: Date,
	) => {
		// On Android, the picker is a dialog, so we hide it immediately after selection.
		if (Platform.OS === "android") {
			setPickingDate(null);
		}

		if (event.type === "dismissed" || !selectedDate) {
			setPickingDate(null);
			return;
		}

		if (pickingDate === "start") {
			setTempStartDate(selectedDate);
		} else if (pickingDate === "end") {
			setTempEndDate(selectedDate);
		}
	};

	const applyDateFilter = () => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			startDate: tempStartDate,
			endDate: tempEndDate,
		}));
		setShowDateModal(false);
		setPickingDate(null);
	};

	const clearDateFilter = () => {
		setTempStartDate(null);
		setTempEndDate(null);
		setPickingDate(null);
		setFilters((prev) => ({
			...prev,
			page: 1,
			startDate: null,
			endDate: null,
		}));
		setShowDateModal(false);
	};

	// --- RENDER HELPERS ---
	const hasDateFilter = filters.startDate != null || filters.endDate != null;
	const dateLabel = hasDateFilter
		? `${filters.startDate?.toLocaleDateString("en-PH", { month: "short", day: "numeric" }) ?? "?"} – ${filters.endDate?.toLocaleDateString("en-PH", { month: "short", day: "numeric" }) ?? "?"}`
		: "Dates";

	const renderFilterPill = (label: string, value: EntryStatus | "ALL") => {
		const isActive = filters.status === value;
		return (
			<TouchableOpacity
				onPress={() =>
					setFilters((prev) => ({ ...prev, status: value, page: 1 }))
				}
				className={`px-5 py-2 rounded-full border ${
					isActive
						? "bg-neon/20 border-neon"
						: "bg-white/5 border-white/10"
				} mr-3`}
			>
				<Text
					className={`font-body-semibold text-sm ${
						isActive ? "text-neon" : "text-textDim"
					}`}
				>
					{label}
				</Text>
			</TouchableOpacity>
		);
	};

	const renderLogItem = ({ item }: { item: EntryLog }) => {
		const isGranted = item.status === EntryStatus.GRANTED;

		return (
			<View className="flex-row justify-between items-center bg-white/5 p-4 rounded-2xl mb-3 border border-white/10 mx-5">
				<View className="flex-1 pr-4">
					<View className="flex-row items-center mb-1">
						<View
							className={`w-2 h-2 rounded-full mr-2 ${
								isGranted ? "bg-neon" : "bg-red-500"
							}`}
						/>
						<Text className="text-white font-header-semibold text-base">
							{isGranted ? "Entry Granted" : "Entry Denied"}
						</Text>
					</View>
					<Text className="text-textDim font-body-reg text-xs">
						{new Date(item.entryTime).toLocaleString("en-PH", {
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
				</View>

				<View className="items-end">
					{isGranted ? (
						<Text className="font-body-bold text-base text-neon">
							-{formatCurrency(item.deductedAmount || 0)}
						</Text>
					) : (
						<Text className="font-body-bold text-xs text-red-400 max-w-[100px] text-right">
							{item.deniedReason?.replace(/_/g, " ")}
						</Text>
					)}
					<Text className="text-textDim font-body-reg text-[10px] mt-0.5">
						RFID: {item.rfidUid.slice(-4)}
					</Text>
				</View>
			</View>
		);
	};

	return (
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
				<SafeAreaView className="flex-1 pt-8">
					<Text className="font-header-bold text-2xl mb-6 px-5 text-white">
						History
					</Text>

					<View className="flex-row gap-4 px-5 mb-6">
						<View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
							<Text className="text-textDim font-body-semibold text-[10px] tracking-[1px] mb-2 uppercase">
								Total Entries
							</Text>
							<Text className="text-white font-header-bold text-3xl">
								{totalEntries}
							</Text>
						</View>

						<View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
							<Text className="text-textDim font-body-semibold text-[10px] tracking-[1px] mb-2 uppercase">
								Last Entry
							</Text>
							{lastEntryDate ? (
								<>
									<Text className="text-white font-header-bold text-lg leading-tight">
										{new Date(
											lastEntryDate,
										).toLocaleDateString("en-PH", {
											month: "short",
											day: "numeric",
										})}
									</Text>
									<Text className="text-neon font-body-reg text-xs">
										{new Date(
											lastEntryDate,
										).toLocaleTimeString("en-PH", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</Text>
								</>
							) : (
								<Text className="text-textDim font-body-reg text-sm">
									No data
								</Text>
							)}
						</View>
					</View>

					<View className="mb-4">
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{
								paddingHorizontal: 20,
							}}
						>
							{renderFilterPill("All", "ALL")}
							{renderFilterPill("Granted", EntryStatus.GRANTED)}
							{renderFilterPill("Denied", EntryStatus.DENIED)}

							<TouchableOpacity
								className={`px-5 py-2 rounded-full border flex-row items-center ${
									hasDateFilter
										? "bg-neon/20 border-neon"
										: "bg-white/5 border-white/10"
								}`}
								onPress={openDateModal}
							>
								<Text
									className={`font-body-semibold text-sm ${
										hasDateFilter
											? "text-neon"
											: "text-textDim"
									}`}
								>
									{dateLabel}
								</Text>
								{hasDateFilter && (
									<TouchableOpacity
										onPress={clearDateFilter}
										className="ml-2"
										hitSlop={{
											top: 8,
											bottom: 8,
											left: 8,
											right: 8,
										}}
									>
										<Text className="text-neon font-body-bold text-xs">
											✕
										</Text>
									</TouchableOpacity>
								)}
							</TouchableOpacity>
						</ScrollView>
					</View>

					{isLoading ? (
						<View className="flex-1 justify-center items-center">
							<ActivityIndicator size="large" color="#00F0C5" />
						</View>
					) : (
						<FlatList
							data={logs}
							keyExtractor={(item) => item.id}
							renderItem={renderLogItem}
							showsVerticalScrollIndicator={false}
							onEndReached={handleLoadMore}
							onEndReachedThreshold={0.3}
							contentContainerStyle={{
								paddingBottom: 40,
								flexGrow: 1,
								justifyContent:
									logs.length === 0 ? "center" : "flex-start",
							}}
							ListFooterComponent={
								isFetchingMore ? (
									<ActivityIndicator
										size="small"
										color="#00F0C5"
										className="mt-2"
									/>
								) : null
							}
							ListEmptyComponent={
								<View className="px-5">
									<EmptyState
										title="No Entries Found"
										message={
											filters.status === "ALL" &&
											!hasDateFilter
												? "You don't have any entry logs recorded yet."
												: "No logs match the selected filters."
										}
										icon={<ClockAlert color={"#00F0C5"} />}
									/>
								</View>
							}
						/>
					)}

					{/* Date Range Modal */}
					<Modal
						visible={showDateModal}
						transparent
						animationType="fade"
						onRequestClose={() => {
							setShowDateModal(false);
							setPickingDate(null);
						}}
					>
						<TouchableWithoutFeedback
							onPress={() => {
								setShowDateModal(false);
								setPickingDate(null);
							}}
						>
							<View className="flex-1 bg-black/60 justify-end">
								<TouchableWithoutFeedback
									onPress={Keyboard.dismiss}
								>
									<View className="bg-[#0d1f1d] rounded-t-3xl p-6 border-t border-white/10">
										<View className="flex-row justify-between items-center mb-6">
											<Text className="text-white font-header-bold text-lg">
												Filter by Date
											</Text>
											{/* If iOS, show a done button to manually dismiss the picker if needed */}
											{Platform.OS === "ios" &&
												pickingDate && (
													<TouchableOpacity
														onPress={() =>
															setPickingDate(null)
														}
													>
														<Text className="text-neon font-body-bold">
															Done
														</Text>
													</TouchableOpacity>
												)}
										</View>

										<Text className="text-textDim font-body-semibold text-xs mb-2 uppercase tracking-widest">
											Start Date
										</Text>
										<TouchableOpacity
											onPress={() =>
												setPickingDate("start")
											}
											className={`bg-white/5 border rounded-xl px-4 py-3 mb-4 ${pickingDate === "start" ? "border-neon" : "border-white/10"}`}
										>
											<Text
												className={`font-body-reg ${tempStartDate ? "text-white" : "text-[#4a6361]"}`}
											>
												{tempStartDate
													? tempStartDate.toLocaleDateString(
															"en-PH",
														)
													: "Select Start Date"}
											</Text>
										</TouchableOpacity>

										<Text className="text-textDim font-body-semibold text-xs mb-2 uppercase tracking-widest">
											End Date
										</Text>
										<TouchableOpacity
											onPress={() =>
												setPickingDate("end")
											}
											className={`bg-white/5 border rounded-xl px-4 py-3 mb-6 ${pickingDate === "end" ? "border-neon" : "border-white/10"}`}
										>
											<Text
												className={`font-body-reg ${tempEndDate ? "text-white" : "text-[#4a6361]"}`}
											>
												{tempEndDate
													? tempEndDate.toLocaleDateString(
															"en-PH",
														)
													: "Select End Date"}
											</Text>
										</TouchableOpacity>

										{/* Conditionally Render DateTimePicker */}
										{pickingDate && (
											<DateTimePicker
												value={
													(pickingDate === "start"
														? tempStartDate
														: tempEndDate) ||
													new Date()
												}
												mode="date"
												display="default"
												onChange={handleDateChange}
												maximumDate={new Date()} // Prevents selecting future dates
											/>
										)}

										<View className="flex-row gap-3 mt-2">
											<TouchableOpacity
												onPress={clearDateFilter}
												className="flex-1 py-3 rounded-xl border border-white/20 items-center"
											>
												<Text className="text-textDim font-body-semibold text-sm">
													Clear
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={applyDateFilter}
												className="flex-1 py-3 rounded-xl bg-neon items-center"
											>
												<Text className="text-[#020807] font-body-bold text-sm">
													Apply
												</Text>
											</TouchableOpacity>
										</View>
									</View>
								</TouchableWithoutFeedback>
							</View>
						</TouchableWithoutFeedback>
					</Modal>
				</SafeAreaView>
			</KeyboardAvoidingView>
		</View>
	);
};

export default EntryHistory;
