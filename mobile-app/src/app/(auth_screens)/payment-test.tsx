import * as WebBrowser from "expo-web-browser";
import { Button, View } from "react-native";

const PaymentTest = () => {
	const handlePay = async () => {
		try {
			const res = await fetch(
				`${process.env.EXPO_PUBLIC_DEV_BASE_URL}payment/checkout`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json", // Crucial for POST requests
						Accept: "application/json",
					},
					body: JSON.stringify({ amount: 100 }),
				},
			);

			const data = await res.json();

			await WebBrowser.openBrowserAsync(data.url);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<View className="flex-1 items-center justify-center">
			<Button title="Test Payment" onPress={handlePay} />
		</View>
	);
};

export default PaymentTest;
