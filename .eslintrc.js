module.exports = {
	root: true,
	extends: ["eslint:recommended", "plugin:prettier/recommended"],
	plugins: ["prettier"],
	rules: {
		"prettier/prettier": "error",
	},
	globals: {
		RequestInit: true,
		RequestInfo: true,
	},
	settings: {
		"import/resolver": {
			extensions: [".ts", ".tsx"],
			moduleDirectory: ["src", "node_modules"],
		},
	},
}
