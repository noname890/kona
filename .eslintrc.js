module.exports = {
	env: {
		es6: true,
		node: true,
		mocha: true
	},
	extends: [ 'standard' ],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	plugins: [ '@typescript-eslint' ],
	rules: {
		'no-tabs': 'off',
		indent: 'off',
		semi: 'off',
		'space-before-function-paren': 'off',
		'no-useless-constructor': 'off',
		'array-bracket-spacing': 'off'
	}
};
