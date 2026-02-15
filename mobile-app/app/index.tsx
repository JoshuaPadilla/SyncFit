import { Camera, Heart, Settings } from "lucide-react-native";
import { Text, View } from "react-native";
export default function RootLayout() {
	return (
		<View className="bg-yellow-100 p-4">
			<View>
				{/* Basic usage */}
				<Camera />

				{/* Customized usage */}
				<Heart />

				<Settings />
			</View>
			<Text>
				Edit app/index.tsx to edit this screen. hakdog hamburger
			</Text>
		</View>
	);
}
