import { Tabs } from "expo-router";
import { Clock, Home, User, Wallet } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TabItem = ({ Icon, label, focused }: any) => {
	return (
		<View style={styles.tabItemContainer}>
			{/* The active bubble behind the icon */}
			<View
				style={[
					styles.iconContainer,
					focused && styles.activeIconContainer,
				]}
			>
				<Icon
					// High contrast: dark icon inside the bright bubble when active
					color={focused ? "#020807" : "#889999"}
					size={22}
					strokeWidth={focused ? 2.5 : 2}
				/>
			</View>

			{/* Subtle label */}
			<Text
				style={[
					styles.tabLabel,
					{
						color: focused ? "#00F0C5" : "#889999",
						fontWeight: focused ? "700" : "500",
					},
				]}
			>
				{label}
			</Text>
		</View>
	);
};

const UserTabLayout = () => {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					backgroundColor: "#020807",
					borderTopWidth: 1, // Subtle line to separate from content
					borderTopColor: "#111817", // Very dark, subtle border color
					height: 80,
					paddingTop: 10,
					paddingBottom: 25,
				},
				tabBarItemStyle: {
					justifyContent: "center",
					alignItems: "center",
				},
			}}
		>
			<Tabs.Screen
				name="user_home"
				options={{
					title: "Home",
					tabBarIcon: ({ focused }) => (
						<TabItem Icon={Home} label="Home" focused={focused} />
					),
				}}
			/>

			<Tabs.Screen
				name="wallet"
				options={{
					title: "Wallet",
					tabBarIcon: ({ focused }) => (
						<TabItem
							Icon={Wallet}
							label="Wallet"
							focused={focused}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="entry_history"
				options={{
					title: "History",
					tabBarIcon: ({ focused }) => (
						<TabItem
							Icon={Clock}
							label="History"
							focused={focused}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ focused }) => (
						<TabItem
							Icon={User}
							label="Profile"
							focused={focused}
						/>
					),
				}}
			/>
		</Tabs>
	);
};

const styles = StyleSheet.create({
	tabItemContainer: {
		alignItems: "center",
		justifyContent: "center",
		width: 65,
		gap: 4,
	},
	iconContainer: {
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 20, // Keeps the inner bubble rounded, but the bar itself is square
		backgroundColor: "transparent",
	},
	activeIconContainer: {
		backgroundColor: "#00F0C5",
	},
	tabLabel: {
		fontSize: 10,
	},
});

export default UserTabLayout;
