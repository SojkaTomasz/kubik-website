import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'
import lodash from 'eslint-plugin-lodash'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unicorn from 'eslint-plugin-unicorn'
import unusedImports from 'eslint-plugin-unused-imports'

/**
 * Import z bibliotek prymitywów jest dozwolony wyłącznie wewnątrz src/components/ui.
 * Widoki mają korzystać z gotowych komponentów, nie budować własnych na Radiksie.
 */
const primitivePackages = [
	{
		name: 'radix-ui',
		message: 'Prymitywy owijamy w src/components/ui. W widokach importuj z @/components/ui.',
	},
	{
		name: '@base-ui/react',
		message: 'Prymitywy owijamy w src/components/ui. W widokach importuj z @/components/ui.',
	},
	/*
	 * `next/image` z tego samego powodu co prymitywy. Sam w sobie jest poprawny,
	 * ale wymaga za każdym razem ramki z proporcjami, zaokrąglenia z tokenu
	 * i propsa `sizes` — czyli doraźnego markupu, który rozjeżdża się między
	 * widokami. Wszystko to niesie `@/components/ui/image`, przepuszczając dalej
	 * pełny zestaw propsów `next/image`.
	 */
	{
		name: 'next/image',
		message: 'Użyj Image z @/components/ui/image — niesie proporcje, zaokrąglenie i sizes.',
	},
]

/**
 * Ścieżki z kodem generowanym przez `shadcn add` — nadpisywanym przy każdej
 * aktualizacji rejestru, więc nie egzekwujemy tam naszych reguł stylistycznych.
 */
const vendored = ['src/components/ui/**/*.{ts,tsx}', 'src/hooks/use-mobile.ts']

/**
 * Nasze kompozyty leżące w components/ui — piszemy je sami, więc mimo lokalizacji
 * obowiązują je pełne reguły. Dopisz tu każdy komponent, którego nie wygenerował
 * `shadcn add`.
 */
const composites = [
	'src/components/ui/container.tsx',
	'src/components/ui/typography.tsx',
	'src/components/ui/section.tsx',
	'src/components/ui/prose.tsx',
	'src/components/ui/image.tsx',
	'src/components/ui/iframe.tsx',
	'src/components/ui/stat.tsx',
	'src/components/ui/carousel-dots.tsx',
	'src/components/ui/button.variants.ts',
]

const eslintConfig = defineConfig([
	globalIgnores([
		'.next/**',
		'.next-e2e/**',
		'out/**',
		'build/**',
		'coverage/**',
		'test-results/**',
		'playwright-report/**',
		'next-env.d.ts',
		// Skille agentów z `npx skills add` — cudzy kod, nie nasza konwencja.
		'.claude/skills/**',
		// Robocze zrzuty ekranu — katalog jest też w .gitignore.
		'.tmp-shots/**',
	]),

	...nextVitals,
	...nextTs,

	// --- Baza: sortowanie importów i martwy kod ---
	{
		plugins: {
			'simple-import-sort': simpleImportSort,
			'unused-imports': unusedImports,
			unicorn,
			lodash,
		},
		rules: {
			// Sufiks NUL w regexach poniżej to znacznik `import type` dodawany przez plugin.
			// Dzięki niemu typy sortują się razem ze zwykłymi importami z tego samego
			// źródła, zamiast lądować w osobnym bloku.
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						['^\\u0000'],
						['^node:', '^@?\\w', '^@?\\w.*\\u0000$'],
						['^@/', '^@/.*\\u0000$'],
						['^\\.', '^\\..*\\u0000$'],
					],
				},
			],
			'simple-import-sort/exports': 'error',

			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],

			'unicorn/filename-case': ['error', { case: 'kebabCase' }],

			// --- Higiena ogólna ---
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-debugger': 'error',
			eqeqeq: ['error', 'always', { null: 'ignore' }],
			'no-var': 'error',
			'prefer-const': 'error',
			'consistent-return': 'error',

			// --- TypeScript ---
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
			'@typescript-eslint/naming-convention': [
				'error',
				{ selector: 'typeLike', format: ['PascalCase'] },
			],

			// --- Dostępność ---
			'jsx-a11y/anchor-is-valid': 'error',
			'jsx-a11y/click-events-have-key-events': 'error',

			// --- React ---
			'react/no-danger': 'error',
			'react/jsx-key': 'error',

			/*
			 * Reguła pochodzi z Pages Routera, gdzie `<head>` faktycznie należało
			 * zastąpić komponentem `next/head`. W App Routerze jest odwrotnie:
			 * `next/head` nie działa, a `<head>` w root layoucie to jedyne
			 * poprawne API.
			 */
			'@next/next/no-head-element': 'off',
		},
	},

	// --- lodash: wymuszenie importów per-metoda i preferowanie lodasha ---
	{
		files: ['src/**/*.{ts,tsx}'],
		ignores: vendored,
		rules: {
			...lodash.configs.recommended.rules,
			'lodash/import-scope': ['error', 'method'],
			'lodash/prefer-lodash-method': [
				'error',
				{
					/*
					 * Lodash bierzemy tam, gdzie standardowa biblioteka nie ma
					 * odpowiednika albo jest on niewygodny: groupBy, keyBy, debounce,
					 * cloneDeep, isEqual. Nie zastępujemy nim metod, które JavaScript
					 * ma od dawna i które TypeScript lepiej typuje — poniżej właśnie te.
					 */
					ignoreMethods: [
						'map',
						'filter',
						'find',
						'includes',
						'join',
						'split',
						'trim',
						'replace',
						'startsWith',
						'endsWith',
						'keys',
						'values',
						'entries',
						'assign',
						'every',
						'some',
						'reduce',
						'repeat',
						// Array.isArray zawęża typ w TypeScripcie — lodash tu nic nie wnosi.
						'isArray',
					],
				},
			],
			'lodash/prefer-constant': 'off',
			'lodash/prefer-noop': 'off',
			'lodash/prefer-lodash-typecheck': 'off',
		},
	},

	// --- Zasada architektoniczna: widoki tylko z components/ui ---
	{
		files: ['src/**/*.{ts,tsx}'],
		ignores: vendored,
		rules: {
			'no-restricted-imports': [
				'error',
				{ paths: primitivePackages, patterns: ['@radix-ui/*'] },
			],
		},
	},

	/*
	 * Kod vendorowany z shadcn.
	 *
	 * Wyłączamy tu reguły stylistyczne i te, których shadcn nie spełnia — nie po to,
	 * żeby przymykać oko, tylko dlatego, że każdy `shadcn add --overwrite` przywraca
	 * oryginalne formatowanie. Utrzymywanie tu naszego stylu oznaczałoby ręczne
	 * poprawki po każdej aktualizacji rejestru.
	 *
	 * Reguły łapiące realne błędy (react-hooks/rules-of-hooks, jsx-a11y) zostają.
	 */
	{
		files: vendored,
		rules: {
			'simple-import-sort/imports': 'off',
			'simple-import-sort/exports': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/consistent-type-definitions': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'consistent-return': 'off',
			'react/no-danger': 'off',
			'react-hooks/set-state-in-effect': 'off',
			eqeqeq: 'off',
			// input-group.tsx przekazuje kliknięcie z obudowy do inputa. Obsługa
			// klawiatury istnieje — realizuje ją sam input, nie kontener. Faktyczną
			// dostępność weryfikuje skan axe w testach e2e, nie ta reguła.
			'jsx-a11y/click-events-have-key-events': 'off',
		},
	},

	/*
	 * Nasze własne kompozyty mieszkają w components/ui (bo widoki mają importować
	 * wszystko z jednego miejsca), ale nie są kodem vendorowanym — obowiązują je
	 * pełne reguły. Ten blok jest po bloku `vendored`, więc go nadpisuje.
	 */
	{
		files: composites,
		rules: {
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
			eqeqeq: ['error', 'always', { null: 'ignore' }],
		},
	},

	/*
	 * --- Obrazy generowane przez Satori (ikony, miniatury Open Graph) ---
	 *
	 * Te pliki NIE renderują HTML-a dla przeglądarki. Renderuje je Satori,
	 * zamieniając drzewo elementów na obraz PNG — `next/image` nie ma tu czego
	 * optymalizować i w ogóle nie zadziała, więc `<img>` jest jedynym sposobem
	 * na osadzenie grafiki.
	 *
	 * Wyjątek jest w konfiguracji, a nie jako `eslint-disable-next-line`
	 * w kodzie, i to z konkretnego powodu. Dyrektywa w pliku przechodziła
	 * lokalnie (Windows), a w CI (Linux) wywracała bramkę jakości jako
	 * „Unused eslint-disable directive" — wtyczka Next.js rozpoznaje katalog
	 * `app` po ścieżce, a ta różni się separatorem między systemami. Jawny
	 * wpis tutaj zachowuje się identycznie wszędzie.
	 */
	{
		files: [
			'src/app/**/icon.tsx',
			'src/app/**/apple-icon.tsx',
			'src/app/**/opengraph-image.tsx',
			'src/lib/seo/og-template.tsx',
		],
		rules: {
			'@next/next/no-img-element': 'off',
		},
	},

	// --- Pliki konfiguracyjne, skrypty i testy e2e ---
	{
		files: ['*.{js,mjs,ts}', 'scripts/**/*.{js,mjs,ts}', 'e2e/**/*.ts'],
		rules: {
			'no-console': 'off',
			'unicorn/filename-case': 'off',
		},
	},

	/*
	 * Testy end-to-end.
	 *
	 * Playwright buduje fixture'y funkcją `use(wartość)` — zbieżność nazw z hookiem
	 * `use` z Reacta 19 sprawia, że plugin react-hooks widzi tu wywołanie hooka
	 * poza komponentem. To fałszywy alarm: w tym katalogu Reacta nie ma w ogóle.
	 */
	{
		files: ['e2e/**/*.ts'],
		rules: {
			'react-hooks/rules-of-hooks': 'off',
		},
	},

	// --- Testy jednostkowe ---
	{
		files: ['src/**/*.test.{ts,tsx}'],
		rules: {
			// Testy celowo podstawiają wartości o niepoprawnym kształcie, żeby
			// sprawdzić, jak kod się przed nimi broni.
			'@typescript-eslint/no-explicit-any': 'off',
			'no-console': 'off',
		},
	},

	prettier,
])

export default eslintConfig
