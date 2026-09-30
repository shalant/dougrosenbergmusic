// Flat config (ESLint 10). No ESLint/Prettier existed at all before this -
// style consistency depended entirely on manual discipline. Kept
// intentionally light: astro's own recommended rules plus browser/node
// globals for the two runtime contexts this project actually has (inline
// <script>s in .astro files run in the browser, worker.js runs in the
// Workers runtime, which is close enough to Node's globals for lint
// purposes). eslint-config-prettier last so it can turn off any
// formatting-related rules Prettier already owns.
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

export default [
	{
		ignores: ['dist/**', '.astro/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'],
	},
	...eslintPluginAstro.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
	},
	{
		// .astro frontmatter uses real TypeScript (interfaces, `as` casts,
		// typed object literals) - eslint-plugin-astro's recommended config
		// parses it as plain JS by default, which fails on that syntax.
		files: ['**/*.astro'],
		languageOptions: {
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.astro'],
			},
		},
	},
	{
		files: ['src/worker.js'],
		languageOptions: {
			globals: {
				...globals.worker,
			},
		},
	},
	eslintConfigPrettier,
];
