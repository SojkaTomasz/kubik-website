import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Konfiguracja testów jednostkowych i komponentowych.
 *
 * Testy end-to-end są celowo poza tym zakresem — prowadzi je Playwright
 * (`playwright.config.ts`), bo wymagają prawdziwej przeglądarki i zbudowanej
 * aplikacji. Podział ma sens praktyczny: tutaj sekundy, tam minuty.
 */
export default defineConfig({
	plugins: [react()],
	test: {
		// jsdom wystarcza do renderowania komponentów; testy wymagające prawdziwego
		// silnika (układ strony, przewijanie, media queries) należą do Playwrighta.
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./vitest.setup.ts'],

		/*
		 * Stałe zmienne środowiskowe dla testów.
		 *
		 * Testy NIE mogą czytać `.env.local` programisty — asercje na canonical
		 * czy hreflang zależą od adresu strony, więc wynik zależałby od tego,
		 * kto uruchamia testy. Tutaj adres jest zawsze ten sam, na maszynie
		 * i w CI, a `https://example.com` czyta się w asercjach jak zdanie.
		 */
		env: {
			NEXT_PUBLIC_SITE_URL: 'https://example.com',
			NEXT_PUBLIC_CONTACT_EMAIL: 'kontakt@example.com',
			NEXT_PUBLIC_CONTACT_PHONE: '+48123456789',
			NEXT_PUBLIC_GTM_ID: '',
			NEXT_PUBLIC_ENABLE_DEV_PAGES: 'false',
			NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS: 'false',
		},

		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		exclude: ['node_modules', '.next', 'e2e'],

		/*
		 * next-intl przechodzi przez transformację Vite'a zamiast być ładowany
		 * wprost przez Node'a.
		 *
		 * Bez tego jego wewnętrzny `import 'next/navigation'` wywala się na
		 * „Cannot find module": pakiet leży w izolowanym drzewie pnpm, a resolver
		 * Node'a pomija tam mapę `exports` z package.json Next.js. Resolver
		 * Vite'a ją respektuje.
		 */
		server: {
			deps: {
				inline: ['next-intl'],
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			// Pokrycie mierzymy tam, gdzie mamy realny wpływ na kod. Komponenty
			// z rejestru shadcn są vendorowane — ich testowanie sprawdzałoby
			// cudzą bibliotekę, a nie nasz starter.
			include: [
				'src/lib/**',
				'src/hooks/**',
				'src/components/ui/{container,section,typography}.tsx',
			],
			exclude: ['src/**/*.test.{ts,tsx}', 'src/lib/cva.ts'],
		},
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			/*
			 * Warstwa treści generowana przez content-collections.
			 *
			 * Alias musi być powtórzony tutaj, bo vitest nie czyta `paths`
			 * z tsconfig.json. Bez niego każdy test dotykający `lib/content`
			 * wywalał się na nierozwiązanym imporcie — a katalog powstaje
			 * dopiero przy pierwszym `next build` lub `next dev`.
			 */
			'content-collections': fileURLToPath(
				new URL('./.content-collections/generated', import.meta.url)
			),
		},
	},
})
