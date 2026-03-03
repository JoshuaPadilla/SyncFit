import { Stack } from "expo-router";
import React from "react";

import { FloatingBlob } from "@/components/floating_blob";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
	Keyboard,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
} from "react-native";

const UserLayout = () => {
	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={styles.container}>
				<StatusBar style="light" />

				{/* Static Background Elements */}
				<LinearGradient
					colors={["#0d2120", "#020807"]}
					style={StyleSheet.absoluteFill}
				/>

				<FloatingBlob
					className="absolute top-[200] right-[-70] w-80 h-80 bg-neon/10 rounded-full blur-[80px]"
					duration={5000}
					offset={30}
					delay={0}
					scaleRange={0.15}
					opacityRange={0.3}
				/>
				<FloatingBlob
					className="absolute top-[-80] right-[-20] w-40 h-40 bg-neon/10 rounded-full blur-[80px]"
					duration={3500}
					offset={15}
					delay={800}
					scaleRange={0.2}
					opacityRange={0.35}
				/>
				<FloatingBlob
					className="absolute bottom-[5%] left-[-50] w-64 h-64 bg-neon/5 rounded-full blur-[100px]"
					duration={6000}
					offset={40}
					delay={1600}
					scaleRange={0.1}
					opacityRange={0.2}
				/>

				{/* The Navigator */}
				<Stack
					screenOptions={{
						headerShown: false,
						animation: "fade_from_bottom",
						// This is the line that prevents the white background
						contentStyle: { backgroundColor: "transparent" },
					}}
				>
					<Stack.Screen name="(tabs)" />
					<Stack.Screen name="topup" />
					<Stack.Screen name="success_payment" />
					<Stack.Screen name="failed_payment" />
				</Stack>
			</View>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#020807",
	},
});
export default UserLayout;
