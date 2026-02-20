import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const PaymentSuccessTest = () => {
	const handleHome = async () => {
		router.replace("/payment-test");
	};
	return (
		<View className="flex-1 justify-center items-center">
			<Text>PAYMENT SUCCESS</Text>
			<Button title="Again" onPress={handleHome} />
		</View>
	);
};

export default PaymentSuccessTest;
