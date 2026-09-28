import type { Locale } from '@/site.config'

/** Dane SEO strony. Wszystko poza tytułem opcjonalne — reszta ma domyślne z `site.config.ts`. */
export interface PageSeo {
	/** Trafia do `<title>` przez szablon `%s | Nazwa`. */
	title: string
	description?: string
	/** Ścieżka bez języka i domeny, np. `/kontakt` — podstawa canonical i hreflang. */
	path?: string
	locale?: Locale
	/** Obraz OG. Brak = generowany przez `app/opengraph-image.tsx`. */
	image?: string
	/** Tekst alternatywny obrazu OG. */
	imageAlt?: string
	/** Osobny tytuł do social media, gdy `<title>` jest zbyt techniczny. */
	ogTitle?: string
	/** `true` blokuje indeksowanie — dla stron dev, podziękowań, wersji roboczych. */
	noIndex?: boolean
	/** `article` dla wpisów bloga, `website` dla reszty. */
	type?: 'website' | 'article'
	/** Metadane wpisu — używane tylko przy `type: 'article'`. */
	article?: {
		publishedTime?: string
		modifiedTime?: string
		authors?: string[]
		tags?: string[]
	}
}
