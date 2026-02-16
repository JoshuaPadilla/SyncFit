// eslint.config.js
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const importPlugin = require("eslint-plugin-import");

module.exports = defineConfig([
	...expoConfig, // Spread the existing Expo config
	{
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
		plugins: {
			import: importPlugin,
		},
		settings: {
			"import/resolver": {
				typescript: {
					project: "./tsconfig.json",
				},
			},
		},
		rules: {
			// This ensures ESLint uses the resolver we just set up
			"import/no-unresolved": "error",
		},
	},
	{
		ignores: ["dist/*", ".expo/*", "node_modules/*"],
	},
]);
