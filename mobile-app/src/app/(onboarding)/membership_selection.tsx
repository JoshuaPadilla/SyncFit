import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
	Calendar,
	CheckCircle2,
	CreditCard,
	Crown,
	Footprints,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Define Types
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

// --- CONSTANTS ---
const COLORS = {
	NEON: "#00F0C5", // Updated: Bright Teal
	BG_TOP: "#0d2120", // Updated: Dark Green/Teal
	BG_BOT: "#020807", // Updated: Black
	BG_CARD: "rgba(255, 255, 255, 0.05)",
	BORDER_LIGHT: "rgba(255, 255, 255, 0.1)",
	TEXT_WHITE: "#FFFFFF",
	TEXT_DIM: "#889999", // Updated: Dim Text
	TEXT_BLACK: "#000000",
};

// --- PURE COMPONENT ---
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
				entering={FadeInDown.delay(300 + index * 100).springify()}
			>
				<TouchableOpacity
					activeOpacity={0.9}
					onPress={() => onPress(item.id)}
					style={[
						styles.card,
						{
							backgroundColor: isSelected
								? "rgba(0, 240, 197, 0.1)" // Updated: Neon with opacity
								: COLORS.BG_CARD,
							borderColor: isSelected
								? COLORS.NEON
								: COLORS.BORDER_LIGHT,
						},
					]}
				>
					<View style={styles.cardHeader}>
						<View
							style={[
								styles.iconContainer,
								{
									backgroundColor: isSelected
										? COLORS.NEON
										: COLORS.BORDER_LIGHT,
								},
							]}
						>
							<Icon
								size={20}
								color={
									isSelected
										? COLORS.TEXT_BLACK
										: COLORS.TEXT_DIM
								}
							/>
						</View>
						{isSelected && (
							<CheckCircle2 size={24} color={COLORS.NEON} />
						)}
					</View>

					<Text
						style={[
							styles.cardTitle,
							{
								color: isSelected
									? COLORS.TEXT_WHITE
									: "#D1D5DB",
							},
						]}
					>
						{item.title}
					</Text>

					<Text style={styles.cardPrice}>{item.price}</Text>
					<Text style={styles.cardDesc}>{item.desc}</Text>
				</TouchableOpacity>
			</Animated.View>
		);
	},
	(prev, next) =>
		prev.isSelected === next.isSelected && prev.item.id === next.item.id,
);

export default function MembershipScreen() {
	const [selected, setSelected] = useState("");

	const handleSelect = useCallback((id: string) => {
		setSelected(id);
	}, []);

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<LinearGradient
				// Updated Gradient Colors
				colors={[COLORS.BG_TOP, COLORS.BG_BOT]}
				style={StyleSheet.absoluteFill}
			/>

			{/* BLOB */}
			<View style={styles.blob} />

			<SafeAreaView style={styles.safeArea}>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					{/* HEADER */}
					<Animated.View
						entering={FadeInDown.delay(200).springify()}
						style={styles.headerContainer}
					>
						<Text style={styles.headerLabel}>MEMBERSHIP</Text>
						<Text style={styles.headerTitle}>
							Choose Your{"\n"}Access
						</Text>
						<View style={styles.headerLine} />
					</Animated.View>

					{/* CARDS */}
					{PLANS.map((plan, index) => (
						<PlanCard
							key={plan.id}
							item={plan}
							index={index}
							isSelected={selected === plan.id}
							onPress={handleSelect}
						/>
					))}
				</ScrollView>

				{/* FOOTER */}
				<Animated.View
					entering={FadeInDown.delay(800).springify()}
					style={styles.footer}
				>
					<TouchableOpacity
						disabled={!selected}
						activeOpacity={0.8}
						style={[
							styles.button,
							{
								backgroundColor: selected
									? COLORS.NEON
									: "#1F2937",
								shadowOpacity: selected ? 0.2 : 0,
							},
						]}
						onPress={() =>
							console.log("Complete Registration with:", selected)
						}
					>
						<Text
							style={[
								styles.buttonText,
								{
									color: selected
										? COLORS.TEXT_BLACK
										: COLORS.TEXT_DIM,
								},
							]}
						>
							FINISH SETUP
						</Text>
					</TouchableOpacity>
				</Animated.View>
			</SafeAreaView>
		</View>
	);
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.BG_BOT,
	},
	safeArea: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 32,
		paddingBottom: 40,
	},
	blob: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 400,
		height: 400,
		borderRadius: 200,
		backgroundColor: "rgba(0, 240, 197, 0.05)", // Updated: Neon RGBA
		opacity: 0.5,
	},
	// Header
	headerContainer: {
		marginTop: 32,
		marginBottom: 32,
	},
	headerLabel: {
		color: COLORS.NEON,
		fontSize: 12,
		fontWeight: "900",
		letterSpacing: 4,
		textTransform: "uppercase",
		marginBottom: 12,
	},
	headerTitle: {
		color: COLORS.TEXT_WHITE,
		fontSize: 36,
		fontWeight: "bold",
		lineHeight: 40,
		letterSpacing: -1,
	},
	headerLine: {
		width: 48,
		height: 4,
		backgroundColor: COLORS.NEON,
		marginTop: 16,
		borderRadius: 2,
	},
	// Card
	card: {
		padding: 20,
		borderRadius: 24,
		borderWidth: 1,
		marginBottom: 16,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 4,
	},
	cardPrice: {
		color: COLORS.NEON,
		fontSize: 20,
		fontWeight: "900",
		marginBottom: 4,
	},
	cardDesc: {
		color: COLORS.TEXT_DIM,
		fontSize: 12,
		fontWeight: "500",
		lineHeight: 16,
	},
	// Footer
	footer: {
		padding: 32,
		paddingTop: 0,
	},
	button: {
		height: 64,
		borderRadius: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: COLORS.NEON,
		shadowOffset: { width: 0, height: 10 },
		shadowRadius: 20,
		elevation: 5,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: "900",
	},
});
