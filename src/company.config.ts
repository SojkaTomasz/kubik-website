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

export const companyConfig: CompanyConfig = {
	name: 'Starter',
	legalName: '',
	description: 'Firma przykładowa — podmień dane przed wdrożeniem.',
	logo: '/icon.svg',
	address: {
		addressCountry: 'PL',
	},
	areaServed: ['Polska'],
	socialProfiles: [],
	openingHours: [],
}
