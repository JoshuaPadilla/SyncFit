import { ArrowRight } from "lucide-react-native";
import React from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface Props {
	onPress: () => void;
	title?: string;
	isDisabled?: boolean;
	isLoading?: boolean;
	icon?: React.ReactNode;
}

const COLORS = {
	neon: "#00F0C5",
	buttonText: "#000000",
	// Helper for the 20% opacity version of neon
	neonDisabled: "rgba(0, 240, 197, 0.2)",
};

const CustomButton = ({
	onPress,
	title = "BUTTON",
	isDisabled = false,
	isLoading = false,
	icon,
}: Props) => {
	const inactive = isDisabled || isLoading;

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={inactive}
			activeOpacity={0.8}
			// Combine base styles with conditional logic
			style={[
				styles.button,
				inactive ? styles.buttonDisabled : styles.buttonActive,
			]}
		>
			{isLoading ? (
				<ActivityIndicator color={COLORS.buttonText} />
			) : (
				<View style={styles.contentContainer}>
					<Text style={styles.text}>{title}</Text>
					{icon || <ArrowRight size={20} color={COLORS.buttonText} />}
				</View>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		height: 64, // h-16
		borderRadius: 16, // rounded-2xl
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 48, // mt-12
	},
	buttonActive: {
		backgroundColor: COLORS.neon,
		// iOS Shadow
		shadowColor: COLORS.neon,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		// Android Shadow
		elevation: 5,
	},
	buttonDisabled: {
		backgroundColor: COLORS.neonDisabled,
		elevation: 0,
		shadowOpacity: 0,
	},
	contentContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		fontSize: 18, // text-lg
		fontWeight: "900", // font-black
		marginRight: 8, // mr-2
		color: COLORS.buttonText,
		textTransform: "uppercase",
	},
});

export default CustomButton;
