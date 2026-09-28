/** @type {import('@commitlint/types').UserConfig} */
const config = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			['feat', 'fix', 'chore', 'docs', 'refactor', 'test', 'style', 'perf', 'build', 'ci'],
		],
		'header-max-length': [2, 'always', 150],
	},
}

export default config
