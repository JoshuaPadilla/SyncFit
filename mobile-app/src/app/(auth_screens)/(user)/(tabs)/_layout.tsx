import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Clock, Home, LucideIcon, User, Wallet } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TabConfig = {
	name: string;
	label: string;
	Icon: LucideIcon;
};

const TABS: TabConfig[] = [
	{ name: "user_home", label: "Home", Icon: Home },
	{ name: "wallet", label: "Wallet", Icon: Wallet },
	{ name: "entry_history", label: "History", Icon: Clock },
	{ name: "profile", label: "Profile", Icon: User },
];

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
	return (
		<View style={styles.tabBarWrapper}>
			<View style={styles.tabBarContainer}>
				{state.routes.map((route: any, index: number) => {
					const isFocused = state.index === index;
					const { Icon, label } = TABS[index];

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});
						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					return (
						<TouchableOpacity
							key={route.key}
							onPress={onPress}
							style={[
								styles.tabItem,
								isFocused
									? styles.activeTabItem
									: styles.inactiveTabItem,
							]}
							activeOpacity={0.75}
						>
							<Icon
								color={isFocused ? "#020807" : "#7ab8b0"}
								size={20}
								strokeWidth={isFocused ? 2.5 : 2}
							/>
							{isFocused && (
								<Text style={styles.activeLabel}>{label}</Text>
							)}
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
};

const UserTabLayout = () => {
	return (
		<Tabs
			tabBar={(props) => <CustomTabBar {...props} />}
			screenOptions={{
				headerShown: false,
				sceneStyle: { backgroundColor: "transparent" },
			}}
		>
			<Tabs.Screen name="user_home" options={{ title: "Home" }} />
			<Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
			<Tabs.Screen name="entry_history" options={{ title: "History" }} />
			<Tabs.Screen name="profile" options={{ title: "Profile" }} />
		</Tabs>
	);
};

const styles = StyleSheet.create({
	tabBarWrapper: {
		position: "absolute",
		bottom: 28,
		left: 24,
		right: 24,
		alignItems: "center",
	},
	tabBarContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
		backgroundColor: "#112322",
		borderRadius: 50,
		paddingHorizontal: 6,
		paddingVertical: 6,
		gap: 6,
		alignSelf: "stretch",
		borderWidth: 1.5,
		borderColor: "#00F0C540",
		// Neon glow + depth shadow
		shadowColor: "#00F0C5",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.25,
		shadowRadius: 18,
		elevation: 16,
	},
	tabItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 11,
		borderRadius: 40,
		gap: 8,
	},
	inactiveTabItem: {
		// Minimal padding for icon-only tabs
		paddingHorizontal: 12,
	},
	activeTabItem: {
		// Flexible padding that expands with content
		paddingHorizontal: 18,
		backgroundColor: "#00F0C5",
	},
	activeLabel: {
		color: "#020807",
		fontSize: 14,
		fontWeight: "700",
		letterSpacing: 0.2,
	},
});

export default UserTabLayout;
