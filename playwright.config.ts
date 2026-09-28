import { defineConfig, devices } from '@playwright/test'

/**
 * Konfiguracja testów end-to-end.
 *
 * Testy jadą na buildzie PRODUKCYJNYM, nie na serwerze deweloperskim.
 * Różnice między nimi są istotne akurat dla tego, co tu sprawdzamy:
 * prerendering, kolejność skryptów w <head>, strażnik stron /dev i realny
 * rozmiar paczek. Test na `next dev` przepuściłby błąd występujący wyłącznie
 * na produkcji — czyli dokładnie ten, który boli najbardziej.
 */

/** Port własny dla testów, żeby nie kolidować z `pnpm dev` na 3000. */
const PORT = 3399
const BASE_URL = `http://localhost:${PORT}`

/**
 * Tryb deweloperski — `pnpm test:e2e:dev`.
 *
 * Część ostrzeżeń Reacta istnieje wyłącznie w trybie deweloperskim; build
 * produkcyjny je usuwa. Dwa błędy, które w tym projekcie zgłosił użytkownik
 * (skrypt w komponencie, brak `nativeButton`), były właśnie takie — przebieg
 * produkcyjny by ich nie zobaczył. Dlatego CI uruchamia oba tryby.
 *
 * Uwaga lokalnie: Next.js 16 nie pozwala uruchomić drugiego serwera
 * deweloperskiego w tym samym katalogu, więc przed tym przebiegiem zatrzymaj
 * własne `pnpm dev`.
 */
const useDevServer = process.env.E2E_DEV === '1'

export default defineConfig({
	testDir: './e2e',
	// Testy nie mogą zależeć od kolejności — każdy zaczyna z czystą kartą.
	fullyParallel: true,
	// `test.only` zostawione w kodzie po cichu wyłączyłoby resztę zestawu w CI.
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,

	/*
	 * Liczba równoległych przeglądarek.
	 *
	 * Przebieg deweloperski dostaje ich WYRAŹNIE MNIEJ i to jest wymóg, nie
	 * ostrożność. `next dev` kompiluje trasy na żądanie, a domyślna liczba
	 * workerów (połowa rdzeni — na maszynie z 20 rdzeniami to dziesięć)
	 * zasypuje go żądaniami do tras, których jeszcze nie zbudował. Serwer
	 * odpowiada wtedy 500 albo przekracza limit czasu, a wywrotki wyglądają na
	 * losowe i wędrują między testami — najczęściej trafiając te, które sięgają
	 * po trasy kompilowane osobno (`/apple-icon`, `/sitemap.xml`, `/blog`).
	 *
	 * Zmierzone na tym pakiecie: przy domyślnej liczbie workerów 2 z 4
	 * przebiegów kończyły się wywrotkami, przy dwóch — 3 z 3 czysto. Build
	 * produkcyjny nie ma tego problemu, bo wszystko jest już zbudowane, więc
	 * tam zostaje pełna równoległość i przebieg trwa ~30 s zamiast minuty.
	 *
	 * Objaw łatwo pomylić z usterką aplikacji — sam zgubiłem na tym sporo
	 * czasu, szukając winy w polityce bezpieczeństwa treści.
	 */
	workers: process.env.CI ? 1 : useDevServer ? 2 : undefined,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],

	webServer: {
		command: useDevServer
			? `pnpm exec next dev --port ${PORT}`
			: `pnpm build && pnpm exec next start --port ${PORT}`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 300_000,
		env: {
			/*
			 * Środowisko testowe ustawiamy tutaj, a nie w .env.local, żeby wynik
			 * nie zależał od tego, kto uruchamia testy. Adres musi zgadzać się
			 * z portem serwera — inaczej asercje na canonical porównywałyby
			 * adres produkcyjny z lokalnym.
			 */
			NEXT_PUBLIC_SITE_URL: BASE_URL,
			NEXT_PUBLIC_CONTACT_EMAIL: 'kontakt@example.com',
			NEXT_PUBLIC_CONTACT_PHONE: '+48123456789',
			/** Identyfikator testowy — kontener i tak jest blokowany w e2e/fixtures.ts. */
			NEXT_PUBLIC_GTM_ID: 'GTM-TEST123',
			/** Strony /dev muszą być dostępne, żeby dało się je przetestować. */
			NEXT_PUBLIC_ENABLE_DEV_PAGES: 'true',
			NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS: 'false',
		},
	},
})
