import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const PaymentFailedTest = () => {
	const handleRetry = async () => {
		router.replace("/payment-test");
	};
	return (
		<View className="flex-1 justify-center items-center">
			<Text>PAYMENT FAILED</Text>
			<Button title="Retry" onPress={handleRetry} />
		</View>
	);
};

export default PaymentFailedTest;
