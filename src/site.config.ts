import { env } from '@/env'

/**
 * Jedyne źródło prawdy o stronie.
 *
 * ► Startując nowy projekt: podmień ten plik i `company.config.ts` — metadane,
 *   sitemap, robots, JSON-LD, stopka i OG czytają stąd. Nic tutaj nie może
 *   zależeć od Reacta ani Next.js: plik importują też testy jednostkowe.
 */

/**
 * Języki, które kod ZNA. Rozdzielone od `locales` celowo: gdyby `Locale` wynikało
 * z listy włączonych, zawężenie jej do `['pl']` wywalałoby build zamiast po
 * prostu zadziałać. Nowy język dopisujesz tu razem z wpisem w `localeTags`.
 */
export const supportedLocales = ['pl', 'en'] as const

export type Locale = (typeof supportedLocales)[number]

/**
 * ► TO JEST LISTA, KTÓRĄ EDYTUJESZ. Strona jednojęzyczna: `['pl']` — reszta
 * dostosuje się sama. Nie kasuj przy tym segmentu `[locale]` ani `proxy.ts`.
 */
export const locales: readonly Locale[] = ['pl', 'en']

export const defaultLocale: Locale = 'pl'

/** `false` przy jednym języku — wyłącza przełącznik i `hreflang` wskazujący sam siebie. */
export const isMultilingual: boolean = locales.length > 1

/** Format `og:locale` / hreflang. Kluczowane po `supportedLocales`, żeby mapa była kompletna. */
export const localeTags: Record<Locale, string> = {
	pl: 'pl_PL',
	en: 'en_US',
}

export interface SiteConfig {
	/** Nazwa marki — trafia do `og:site_name` i szablonu tytułu. */
	name: string
	/** Krótki opis, domyślny `<meta name="description">`. Trzymaj poniżej 160 znaków. */
	description: string
	/** Adres produkcyjny bez ukośnika na końcu — podstawa canonical i sitemapy. */
	url: string
	locales: readonly Locale[]
	defaultLocale: Locale
	/** `false`, gdy strona ma jeden język — patrz `isMultilingual` wyżej. */
	isMultilingual: boolean
	/** Statyczny obraz OG. Puste = generowany przez `opengraph-image.tsx`. */
	defaultOgImage?: string
	/** Konto na X/Twitterze bez małpy — puste, jeśli marka go nie ma. */
	twitterHandle: string
	contact: {
		email: string
		phone: string
	}
}

export const siteConfig: SiteConfig = {
	name: 'Starter',
	description:
		'Kompletny szablon strony WWW: Next.js, shadcn/ui, SEO, Consent Mode v2 i testy end-to-end.',
	url: env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''),
	locales,
	defaultLocale,
	isMultilingual,
	twitterHandle: '',
	contact: {
		email: env.NEXT_PUBLIC_CONTACT_EMAIL,
		phone: env.NEXT_PUBLIC_CONTACT_PHONE,
	},
}

/** Adres bezwzględny — canonical, hreflang, sitemap, JSON-LD, OG. */
export function absoluteUrl(path = '/'): string {
	return new URL(path, `${siteConfig.url}/`).toString().replace(/\/$/, '') || siteConfig.url
}
