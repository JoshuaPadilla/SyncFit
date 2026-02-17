import { SLIDES } from "@/static_data/onboarding_slides_data";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
	FlatList,
	Image,
	StatusBar,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
	ViewToken,
} from "react-native";
// 1. IMPORT REANIMATED
import Animated, {
	Extrapolation,
	interpolate,
	interpolateColor,
	runOnJS,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// 2. SUB-COMPONENT: Single Slide
const OnboardingItem = ({ item, index, scrollX, width }: any) => {
	// 3. USE ANIMATED STYLE
	// This hook runs on the UI thread and returns a style object
	const rStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * width,
			index * width,
			(index + 1) * width,
		];

		const scale = interpolate(
			scrollX.value,
			inputRange,
			[0.5, 1, 0.5],
			Extrapolation.CLAMP,
		);

		const opacity = interpolate(
			scrollX.value,
			inputRange,
			[0.5, 1, 0.5],
			Extrapolation.CLAMP,
		);

		const translateY = interpolate(
			scrollX.value,
			inputRange,
			[20, 0, 20],
			Extrapolation.CLAMP,
		);

		return {
			opacity,
			transform: [{ scale }, { translateY }],
		};
	});

	return (
		<View
			style={{ width }}
			className="flex-1 justify-center items-center px-6"
		>
			<Animated.View
				className="relative items-center justify-center mb-10 w-64 h-64"
				style={rStyle} // Pass the animated style here
			>
				{/* Glow Effect */}
				<View className="absolute w-48 h-48 bg-neon rounded-full opacity-20 blur-xl scale-125" />

				<Image
					source={item.icon}
					className="w-full h-full"
					resizeMode="contain"
				/>
			</Animated.View>

			<Animated.View className="items-center" style={rStyle}>
				<Text className="text-white text-3xl font-bold text-center mb-3">
					{item.title}
				</Text>
				<Text className="text-gray-400 text-base text-center px-4 leading-6">
					{item.description}
				</Text>
			</Animated.View>
		</View>
	);
};

// 4. SUB-COMPONENT: Pagination Dot
const PaginationDot = ({ index, scrollX, width }: any) => {
	const rDotStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * width,
			index * width,
			(index + 1) * width,
		];

		const dotWidth = interpolate(
			scrollX.value,
			inputRange,
			[8, 32, 8],
			Extrapolation.CLAMP,
		);

		const backgroundColor = interpolateColor(
			scrollX.value,
			inputRange,
			["#374151", "#00F0C5", "#374151"], // Gray-700 -> Neon -> Gray-700
		);

		return {
			width: dotWidth,
			backgroundColor,
		};
	});

	return (
		<Animated.View className="h-2 rounded-full mx-1" style={rDotStyle} />
	);
};

// 5. MAIN COMPONENT
export default function OnboardingScreen() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const slidesRef = useRef<FlatList>(null);
	const { width } = useWindowDimensions();

	const screenOpacity = useSharedValue(1);

	// 2. Animated style for the root view
	const animatedScreenStyle = useAnimatedStyle(() => ({
		opacity: screenOpacity.value,
	}));

	// REANIMATED: Replace useRef(new Animated.Value(0)) with useSharedValue
	const scrollX = useSharedValue(0);

	// REANIMATED: Scroll Handler
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
		},
	});

	const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

	const onViewableItemsChanged = useRef(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (
				viewableItems &&
				viewableItems.length > 0 &&
				viewableItems[0].index !== null
			) {
				setCurrentIndex(viewableItems[0].index);
			}
		},
	).current;

	const handleNext = () => {
		if (currentIndex < SLIDES.length - 1) {
			slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
		} else {
			screenOpacity.value = withTiming(
				0,
				{ duration: 300 },
				(finished) => {
					if (finished) {
						// Navigate after animation completes
						runOnJS(router.replace)("/(onboarding)/register");
					}
				},
			);
		}
	};

	return (
		<Animated.View
			style={[
				{ flex: 1, backgroundColor: "#020807" },
				animatedScreenStyle,
			]}
		>
			<StatusBar barStyle="light-content" />
			<LinearGradient
				colors={["#0d2120", "#020807"]}
				className="absolute w-full h-full"
			/>

			<SafeAreaView className="flex-1">
				<View className="flex-[3]">
					<Animated.FlatList
						data={SLIDES}
						renderItem={({ item, index }) => (
							<OnboardingItem
								item={item}
								index={index}
								scrollX={scrollX}
								width={width}
							/>
						)}
						horizontal
						showsHorizontalScrollIndicator={false}
						pagingEnabled
						bounces={false}
						keyExtractor={(item) => item.step.toString()}
						onScroll={scrollHandler}
						scrollEventThrottle={16}
						onViewableItemsChanged={onViewableItemsChanged}
						viewabilityConfig={viewConfig}
						ref={slidesRef}
					/>
				</View>

				<View className="flex-1 justify-between items-center px-6 pb-6 w-full">
					<View className="flex-row justify-center items-center mt-4 h-4">
						{SLIDES.map((_, index) => (
							<PaginationDot
								key={index}
								index={index}
								scrollX={scrollX}
								width={width}
							/>
						))}
					</View>

					<View className="w-full">
						<TouchableOpacity
							onPress={handleNext}
							className="bg-neon flex-row items-center justify-center py-4 rounded-2xl mb-6 active:opacity-90"
							style={{
								shadowColor: "#00F0C5",
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 0.5,
								shadowRadius: 10,
								elevation: 5,
							}}
						>
							<Text className="text-black text-lg font-bold mr-2">
								{currentIndex === SLIDES.length - 1
									? "Get Started"
									: "Next"}
							</Text>
							<MaterialCommunityIcons
								name="arrow-right"
								size={20}
								color="black"
							/>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() =>
								router.replace("/(onboarding)/register")
							}
						>
							<Text className="text-gray-500 text-center text-sm font-medium">
								Skip
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		</Animated.View>
	);
}
