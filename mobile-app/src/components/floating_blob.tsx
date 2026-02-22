import { useEffect } from "react";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";

export const FloatingBlob = ({
	className,
	duration = 4000,
	offset = 20,
}: any) => {
	const translationX = useSharedValue(0);
	const translationY = useSharedValue(0);

	useEffect(() => {
		// Create a looping, random-ish movement
		translationX.value = withRepeat(
			withSequence(
				withTiming(offset, { duration: duration }),
				withTiming(-offset, { duration: duration }),
			),
			-1, // Infinite
			true, // Reverse
		);
		translationY.value = withRepeat(
			withSequence(
				withTiming(-offset, { duration: duration + 500 }),
				withTiming(offset, { duration: duration + 500 }),
			),
			-1,
			true,
		);
	}, []);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: translationX.value },
			{ translateY: translationY.value },
		],
	}));

	return <Animated.View className={className} style={animatedStyle} />;
};
