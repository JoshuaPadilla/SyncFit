import React from "react";
import { Text, View } from "react-native";

interface EmptyStateProps {
	title: string;
	message: string;
	icon?: React.ReactNode;
	className?: string; // Allows for custom tailwind class overrides
}

export const EmptyState = ({
	title,
	message,
	icon,
	className = "",
}: EmptyStateProps) => {
	return (
		<View className={`items-center justify-center p-8 mt-8 ${className}`}>
			{/* Optional Icon Container */}
			{icon && (
				<View className="mb-4 bg-white/5 p-4 rounded-full border border-white/10">
					{icon}
				</View>
			)}

			<Text className="text-white font-header-bold text-lg mb-2 text-center">
				{title}
			</Text>

			<Text className="text-textDim font-body-reg text-sm text-center leading-5">
				{message}
			</Text>
		</View>
	);
};
