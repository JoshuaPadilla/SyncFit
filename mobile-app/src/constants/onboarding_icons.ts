import step_1 from "@/app_assets/icons/onboarding_icons/step_1.png";
import step_2 from "@/app_assets/icons/onboarding_icons/step_2.png";
import step_3 from "@/app_assets/icons/onboarding_icons/step_3.png";
import { ImageSourcePropType } from "react-native";

type IconsProps = {
	step_1: ImageSourcePropType;
	step_2: ImageSourcePropType;
	step_3: ImageSourcePropType;
};

export const OnboardingIcons: IconsProps = {
	step_1,
	step_2,
	step_3,
};
