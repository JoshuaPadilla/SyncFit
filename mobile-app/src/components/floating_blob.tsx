import { useEffect } from "react";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";

export const FloatingBlob = ({
	className,
	duration = 4000,
	offset = 20,
	delay = 0,
	scaleRange = 0.12,
	opacityRange = 0.25,
}: any) => {
	const translationX = useSharedValue(0);
	const translationY = useSharedValue(0);
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);

	useEffect(() => {
		const easing = Easing.inOut(Easing.sin);

		// Drift X and Y on intentionally different periods for a Lissajous-like path
		translationX.value = withDelay(
			delay,
			withRepeat(
				withSequence(
					withTiming(offset, { duration: duration, easing }),
					withTiming(-offset * 0.7, {
						duration: duration * 0.9,
						easing,
					}),
					withTiming(offset * 0.4, {
						duration: duration * 0.8,
						easing,
					}),
					withTiming(-offset, { duration: duration, easing }),
				),
				-1,
				true,
			),
		);

		translationY.value = withDelay(
			delay,
			withRepeat(
				withSequence(
					withTiming(-offset * 0.8, {
						duration: duration * 1.1,
						easing,
					}),
					withTiming(offset * 0.5, {
						duration: duration * 0.85,
						easing,
					}),
					withTiming(-offset * 0.3, {
						duration: duration * 1.2,
						easing,
					}),
					withTiming(offset, { duration: duration, easing }),
				),
				-1,
				true,
			),
		);

		// Subtle breathing — scale pulses gently
		scale.value = withDelay(
			delay,
			withRepeat(
				withSequence(
					withTiming(1 + scaleRange, {
						duration: duration * 1.3,
						easing,
					}),
					withTiming(1 - scaleRange * 0.5, {
						duration: duration * 1.1,
						easing,
					}),
				),
				-1,
				true,
			),
		);

		// Soft opacity glow pulse, slightly out of phase with scale
		opacity.value = withDelay(
			delay + duration * 0.4,
			withRepeat(
				withSequence(
					withTiming(1, { duration: duration * 1.0, easing }),
					withTiming(1 - opacityRange, {
						duration: duration * 1.2,
						easing,
					}),
				),
				-1,
				true,
			),
		);
	}, []);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [
			{ translateX: translationX.value },
			{ translateY: translationY.value },
			{ scale: scale.value },
		],
	}));

	return <Animated.View className={className} style={animatedStyle} />;
};
