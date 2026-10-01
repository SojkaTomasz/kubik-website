/**
 * Dane firmy — wyłącznie do danych strukturalnych (JSON-LD) i stopki.
 *
 * Rozdzielone od `site.config.ts` celowo: strona może być wizytówką firmy,
 * portfolio osoby albo landingiem produktu. To, co Google ma zrozumieć jako
 * „kto stoi za tą stroną", zmienia się niezależnie od tego, jak strona wygląda.
 *
 * Puste pola są pomijane w JSON-LD (patrz `optional()` w lib/seo/json-ld.ts),
 * więc bezpiecznie zostawić to, czego nie masz — Google nie dostanie pustych kluczy.
 */

export interface CompanyConfig {
	/** Nazwa handlowa — pod tą nazwą marka występuje publicznie. */
	name: string
	/** Pełna nazwa rejestrowa, jeśli różni się od handlowej. */
	legalName?: string
	description?: string
	/** Logo jako URL bezwzględny lub ścieżka względem domeny. Google preferuje PNG/SVG. */
	logo?: string
	email?: string
	phone?: string
	/** NIP w formacie międzynarodowym, np. PL1234567890. */
	taxId?: string
	address?: {
		streetAddress?: string
		postalCode?: string
		addressLocality?: string
		addressRegion?: string
		/** Kod kraju ISO 3166-1 alpha-2. */
		addressCountry: string
	}
	/** Obszar działania — nazwy miast, regionów lub krajów. */
	areaServed?: string[]
	/** Widełki cenowe w konwencji Google: '$' … '$$$$'. */
	priceRange?: string
	/** Profile w serwisach zewnętrznych — trafiają do `sameAs`. */
	socialProfiles?: string[]
	/** Godziny otwarcia w formacie schema.org, np. 'Mo-Fr 09:00-17:00'. */
	openingHours?: string[]
}

/**
 * Dane z `docs/dane-firmy.md` (wizytówka Google, dane od klienta 29.09.2026).
 *
 * ⚠️ Pełny adres jest tu, bo wymaga go prawo (administrator danych w polityce
 * prywatności, dane usługodawcy). Na stronie NIE promujemy miejscowości — klient
 * nie chce narracji „z Tylmanowej", w tekstach marketingowych mówimy o Małopolsce.
 * Adres pokazują wyłącznie: polityka prywatności, „Dane firmy" w Kontakcie, JSON-LD.
 */
export const companyConfig: CompanyConfig = {
	name: 'Frezowane ogrzewanie podłogowe Kubik',
	description:
		'Frezowanie wylewki pod ogrzewanie podłogowe — bez skuwania posadzki, bez kurzu, w jeden dzień. Pracujemy w całej Polsce.',
	logo: '/icon.svg',
	email: 'kubikph@gmail.com',
	phone: '+48 507 125 794',
	taxId: 'PL7352431636',
	address: {
		streetAddress: 'Rzeka 371a',
		postalCode: '34-451',
		addressLocality: 'Tylmanowa',
		addressRegion: 'małopolskie',
		addressCountry: 'PL',
	},
	areaServed: ['Polska'],
	socialProfiles: [
		'https://www.facebook.com/p/Frezowane-ogrzewanie-pod%C5%82ogowe-Kubik-100077713809387/',
	],
	// Czynne całą dobę — tak podaje wizytówka Google.
	openingHours: ['Mo-Su 00:00-23:59'],
}
