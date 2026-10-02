import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Polityka bezpieczeństwa treści.
 *
 * ─── DLACZEGO `'unsafe-inline'` W `script-src` ───────────────────────────────
 *
 * To jest świadomy kompromis, nie przeoczenie. Strona ma CZTERY skrypty inline,
 * które muszą wykonać się przed pierwszym malowaniem: motyw, zdjęcie `no-js`,
 * zdjęcie `consent-pending` i domyślna odmowa zgód dla GTM. Do tego dochodzą
 * bloki JSON-LD i własny bootstrap Next.js.
 *
 * Alternatywą jest `nonce` — ale nonce musi być inny przy każdym żądaniu, więc
 * wymusza render dynamiczny. U nas WSZYSTKIE trasy są dziś prerenderowane jako
 * statyczne (patrz wynik `next build`), a to jest fundament wydajności tej
 * strony. Zamiana SSG na render na żądanie dla samego CSP byłaby złym
 * interesem: nagłówek chroni przed skutkiem XSS-a, a nie przed nim samym.
 *
 * Reszta polityki zostaje mocna i to ona wykonuje tu robotę: `object-src 'none'`,
 * `base-uri 'self'`, `form-action 'self'` i `frame-ancestors 'none'` zamykają
 * najczęstsze drogi eskalacji, nawet gdy skrypt inline da się wstrzyknąć.
 *
 * Gdy projekt zrezygnuje z SSG (np. włączy `cacheComponents`), przejście na
 * nonce jest wtedy tanie: wygeneruj go w `proxy.ts`, przekaż przez nagłówek
 * żądania do `InlineScript` i zamień tu `'unsafe-inline'` na
 * `'nonce-<wartość>' 'strict-dynamic'`. Uwaga: nonce i `'unsafe-inline'`
 * WYKLUCZAJĄ się — przeglądarka ignoruje to drugie, gdy widzi pierwsze.
 *
 * ─── CZEGO TU CELOWO NIE MA ──────────────────────────────────────────────────
 *
 * `require-trusted-types-for 'script'` — Lighthouse wskazuje ten nagłówek jako
 * informację. Nie da się go włączyć: React i Next.js przypisują do `innerHTML`
 * (u nas robi to też `InlineScript` i JSON-LD), a Trusted Types blokuje takie
 * przypisania bez polityki opakowującej każdą z nich. Włączenie tego wywraca
 * stronę całkowicie, a nie po cichu.
 */
function contentSecurityPolicy(frameAncestors = "'none'"): string {
	const directives: Record<string, string[]> = {
		'default-src': ["'self'"],

		// Powód `'unsafe-inline'` — w komentarzu wyżej.
		'script-src': ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],

		// Next.js wstawia arkusze inline, a Base UI pozycjonuje warstwy atrybutem
		// `style`. Bez `'unsafe-inline'` rozjeżdża się cała strona.
		'style-src': ["'self'", "'unsafe-inline'"],

		// `data:` jest wymagane przez rozmyte podglądy `next/image`
		// (`placeholder='blur'`), `blob:` przez obrazy generowane po stronie klienta.
		'img-src': [
			"'self'",
			'data:',
			'blob:',
			'https://www.googletagmanager.com',
			'https://www.google-analytics.com',
		],

		'font-src': ["'self'"],

		'connect-src': [
			"'self'",
			'https://www.google-analytics.com',
			'https://*.analytics.google.com',
			'https://*.googletagmanager.com',
		],

		/*
		 * `'self'` obejmuje ramkę `noscript` GTM-a oraz podgląd osadzenia
		 * z `public/`. Dokładając osadzenia (mapa, film), dopisz tu ich domeny —
		 * BEZ tego ramka zostanie pusta, a przeglądarka zgłosi to wyłącznie
		 * w konsoli.
		 */
		'frame-src': ["'self'", 'https://www.googletagmanager.com'],

		'media-src': ["'self'"],
		'manifest-src': ["'self'"],
		'worker-src': ["'self'", 'blob:'],

		// Wtyczki (Flash, Java) — nie używamy żadnej, a są klasyczną drogą ataku.
		'object-src': ["'none'"],

		// Blokuje przestawienie bazy adresów względnych wstrzykniętym `<base>`.
		'base-uri': ["'self'"],

		// Formularz nie ma prawa wysłać danych na obcy adres.
		'form-action': ["'self'"],

		// Nikt nie osadzi tej strony w ramce — ochrona przed clickjackingiem.
		// Nowocześniejszy odpowiednik `X-Frame-Options`, który zostaje obok
		// wyłącznie dla starszych przeglądarek.
		'frame-ancestors': [frameAncestors],
	}

	if (isDevelopment) {
		/*
		 * Tryb deweloperski wymaga dwóch rozluźnień i ŻADNE z nich nie trafia
		 * do produkcji: Turbopack kompiluje moduły przez `eval`, a Fast Refresh
		 * utrzymuje połączenie websocket.
		 */
		directives['script-src']?.push("'unsafe-eval'")
		directives['connect-src']?.push('ws:', 'wss:')
	}

	/*
	 * `upgrade-insecure-requests` NIE JEST tu przez pomyłkę pominięte.
	 *
	 * Ta dyrektywa podnosi każde żądanie http na https — również wtedy, gdy
	 * strona stoi pod `http://localhost`. Skutek: build produkcyjny obejrzany
	 * lokalnie (`next start`, a więc i cały pakiet e2e) przestaje działać przy
	 * pierwszej nawigacji klienckiej. Objaw jest mylący, bo pierwsza strona
	 * ładuje się normalnie, a dopiero pobranie ładunku RSC pada na
	 * `net::ERR_SSL_PROTOCOL_ERROR` i router po cichu schodzi do pełnego
	 * przeładowania. Sprawdzone w tym projekcie.
	 *
	 * Nic przy tym nie tracimy. Dyrektywa ratuje przed treścią wpisaną na
	 * sztywno jako `http://`, a takiej tu nie ma: wszystkie zasoby zewnętrzne
	 * są https i wymienione w dyrektywach powyżej, a wymuszenie https dla
	 * własnej domeny załatwia nagłówek `Strict-Transport-Security`.
	 */

	return Object.entries(directives)
		.map(([directive, values]) => `${directive} ${values.join(' ')}`)
		.join('; ')
}

/**
 * Nagłówki bezpieczeństwa dla całej strony.
 *
 * Sprawdza je `e2e/security-headers.spec.ts`. Test jest tu konieczny, bo błąd
 * w tej warstwie nie daje żadnego objawu: strona wygląda i działa tak samo
 * z nagłówkami i bez nich. Naruszenia CSP widać wyłącznie w konsoli
 * przeglądarki — i to właśnie dlatego kontrola konsoli w `e2e/fixtures.ts`
 * jest tu drugim, ważniejszym strażnikiem: każde zablokowane żądanie wywraca
 * dowolny test e2e, który wejdzie na taką stronę.
 */
const securityHeaders = [
	{ key: 'Content-Security-Policy', value: contentSecurityPolicy() },

	/*
	 * Odcina stronę od okien otwartych przez `window.open` i od tych, które
	 * otworzyły ją same. Bez tego obca strona zachowuje uchwyt `window.opener`
	 * i może podmienić adres naszej karty.
	 */
	{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },

	// Starszy odpowiednik `frame-ancestors`. Zostaje dla przeglądarek, które
	// nie znają CSP poziomu 2.
	{ key: 'X-Frame-Options', value: 'DENY' },

	// Zabrania zgadywania typu treści po zawartości. Bez tego plik tekstowy
	// wgrany przez użytkownika potrafi zostać wykonany jako skrypt.
	{ key: 'X-Content-Type-Options', value: 'nosniff' },

	// Pełny adres trafia tylko do własnego pochodzenia; obcy serwis dostaje samą
	// domenę, a przy zejściu z https na http — nic.
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

	/*
	 * Wyłącza uprawnienia, których strona nie używa. Lista jest krótka celowo:
	 * wymienione są rzeczy najbardziej wrażliwe. Dokładając mapę albo
	 * wideorozmowę, otwórz tu odpowiednie uprawnienie.
	 */
	{
		key: 'Permissions-Policy',
		value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
	},

	/*
	 * Wymusza https przez rok, razem z subdomenami.
	 *
	 * Przeglądarki honorują ten nagłówek WYŁĄCZNIE na połączeniu https, więc
	 * lokalny serwer pod http://localhost jest nim nietknięty. Bez `preload`:
	 * wpisanie domeny na listę wstępną przeglądarek jest trudne do wycofania
	 * i powinno być świadomą decyzją właściciela domeny, nie startera.
	 */
	{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig: NextConfig = {
	/** Nagłówek `X-Powered-By: Next.js` niczego nie wnosi, a zdradza stos technologiczny. */
	poweredByHeader: false,

	/**
	 * Telefon w sieci lokalnej (`pnpm dev:mobile`). Next 16 blokuje zasoby serwera
	 * deweloperskiego (HMR, chunki) dla źródeł spoza tej listy — strona się
	 * wyświetla, ale React się nie hydratuje i nic nie reaguje, bez błędu w konsoli.
	 * Dotyczy wyłącznie `next dev`; build produkcyjny tego nie czyta.
	 */
	// Sieci lokalne (Wi-Fi, kabel) i Tailscale (100.x) — telefon w VPN-ie też ma działać.
	allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.*.*.*', '100.*.*.*'],

	/**
	 * Nagłówki bezpieczeństwa na KAŻDĄ trasę.
	 *
	 * Wzorzec `/:path*` obejmuje też zasoby z `public/` i trasy API. Zawężanie
	 * go do samych stron byłoby błędem: `nosniff` i `frame-ancestors` mają
	 * największe znaczenie właśnie przy plikach serwowanych bezpośrednio.
	 */
	async headers() {
		return [
			{ source: '/:path*', headers: securityHeaders },
			/*
			 * Wyjątek: podgląd osadzenia z `/dev` MA być osadzany — przez własną
			 * domenę i nikogo więcej. Przy dopasowaniu kilku wpisów wygrywa
			 * ostatni, więc te dwa klucze nadpisują `DENY` / `'none'` z wpisu wyżej.
			 * Bez tego ramka na `/dev/components` zostawała pusta, a przeglądarka
			 * mówiła o tym wyłącznie w konsoli.
			 */
			{
				source: '/embed-preview.html',
				headers: [
					{ key: 'Content-Security-Policy', value: contentSecurityPolicy("'self'") },
					{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
				],
			},
		]
	},

	images: {
		/** AVIF przed WebP — mniejsze pliki, gdy przeglądarka go obsługuje. */
		formats: ['image/avif', 'image/webp'],
		remotePatterns: [
			// Dopisz tu domeny zewnętrznych obrazów, np. CDN-a lub CMS-a:
			// { protocol: 'https', hostname: 'cdn.example.com' },
		],
	},

	/**
	 * Doładowywanie wyłącznie faktycznie użytych modułów. `lucide-react` i
	 * `date-fns` są optymalizowane domyślnie, `lodash` już nie — bez tego wpisu
	 * import jednej metody wciągałby do paczki całą bibliotekę.
	 */
	experimental: {
		optimizePackageImports: ['lodash'],

		/**
		 * Włącza `app/global-not-found.tsx` — stronę 404 dla adresów bez pasującej
		 * trasy. Bez tej flagi plik jest cicho ignorowany, a użytkownik dostaje
		 * wbudowaną, niestylowaną stronę Next.js. Powód, dla którego nie wystarczy
		 * zwykłe `not-found.tsx`, opisuje sam plik.
		 */
		globalNotFound: true,
	},

	/**
	 * Włączenia do rozważenia przy konkretnym projekcie — świadomie wyłączone
	 * w starterze, bo obie zmieniają zachowanie aplikacji:
	 *
	 * cacheComponents: true
	 *   Next 16 przechodzi wtedy na `use cache` i PPR jako domyślne. Pobieranie
	 *   danych staje się dynamiczne, a cache trzeba deklarować jawnie.
	 *   Wymaga runtime'u Node i przeglądu integracji z next-intl.
	 *
	 * reactCompiler: true
	 *   Automatyczna memoizacja komponentów. Wymaga `babel-plugin-react-compiler`
	 *   i wydłuża build — włączaj, gdy profiler pokazuje realny problem z renderami.
	 */
}

export default withNextIntl(nextConfig)
