import { FloatingBlob } from "@/components/floating_blob";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserProfile = () => {
	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View className="flex-1 bg-[#020807]">
				<StatusBar style="light" />

				<LinearGradient
					colors={["#0d2120", "#020807"]}
					className="absolute w-full h-full"
				/>

				{/* ANIMATED DECORATIVE GLOW BLOBS */}
				<FloatingBlob
					className="absolute top-[200] right-[-70] w-80 h-80 bg-neon/10 rounded-full blur-[80px]"
					duration={5000}
					offset={30}
				/>
				<FloatingBlob
					className="absolute top-[-80] right-[-20] size-40 bg-neon/10 rounded-full blur-[80px]"
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
					<SafeAreaView className="flex-1 pt-8"></SafeAreaView>
				</KeyboardAvoidingView>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default UserProfile;
