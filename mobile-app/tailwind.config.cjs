/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/app/**/*.{js,jsx,ts,tsx}",
		"./ src/components/**/*.{js,jsx,ts,tsx}",
	],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			fontFamily: {
				// Usage: className="font-inter-light"
				"body-light": ["Inter-Light"],
				"body-reg": ["Inter-Regular"],
				"body-med": ["Inter-Medium"],
				"body-semibold": ["Inter-SemiBold"],
				"body-bold": ["Inter-Bold"],
				"body-extrabold": ["Inter-ExtraBold"],

				// Usage: className="font-mont-reg"
				"header-reg": ["Mont-Regular"],
				"header-med": ["Mont-Medium"],
				"header-semibold": ["Mont-SemiBold"],
				"header-bold": ["Mont-Bold"],
				"header-extrabold": ["Mont-ExtraBold"],
			},
			colors: {
				neon: "#00F0C5", // The bright teal
				darkBgTop: "#0d2120", // Dark green/teal background
				darkBgBot: "#020807", // Black background
				text: "#FFFFFF",
				textDim: "#889999",
				buttonText: "#000000",
			},
		},
	},
	plugins: [],
};
