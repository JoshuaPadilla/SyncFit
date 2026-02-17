import { OnboardingIcons } from "@/constants/onboarding_icons";

export const SLIDES = [
	{
		step: 1,
		title: "Verify Identity",
		description:
			"Securely verify your profile to activate your account instantly.",
		// "card-account-details-outline" looks like an ID card
		icon: OnboardingIcons.step_1,
		showBadge: true, // This enables the checkmark badge from our previous component
	},
	{
		step: 2,
		title: "Tap & Go",
		description: "Use your rfid card for seamless contactless access.",
		// "cellphone-nfc" represents the phone + waves interaction
		icon: OnboardingIcons.step_2,
		showBadge: false,
	},
	{
		step: 3,
		title: "Smart Wallet",
		description:
			"Top up your balance and track your digital expenses in real-time.",
		// "wallet-plus-outline" represents the wallet with the "add" (top up) concept
		icon: OnboardingIcons.step_3,
		showBadge: false,
	},
];
