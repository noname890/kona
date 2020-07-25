module.exports = {
	env: {
		es6: true,
		node: true
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
		'no-useless-constructor': 'off',
		indent: 'off',
		semi: 'off',
		'space-before-function-paren': 'off',
		'no-unused-expressions': 'off',
		'no-unused-vars': 'off',
		eqeqeq: 'off',
		'no-prototype-builtins': 'off',
		quotes: 'off',
		'array-bracket-spacing': 'off'
	}
};
