import type { Metadata } from 'next'

import { absoluteUrl, type Locale, localeTags, siteConfig } from '@/site.config'
import type { PageSeo } from '@/lib/seo/types'

/** Ścieżka z prefiksem języka. Domyślny go nie dostaje (`localePrefix: 'as-needed'`). */
export function localizedPath(path: string, locale: Locale): string {
	const clean = path === '/' ? '' : path.replace(/\/$/, '')
	return locale === siteConfig.defaultLocale ? clean || '/' : `/${locale}${clean}`
}

/** Komplet `hreflang`. Brak `x-default` to dla Google niekompletna deklaracja. */
export function buildLanguageAlternates(path: string): Record<string, string> | undefined {
	// Przy jednym języku hreflang wskazywałby sam siebie — Google zgłasza to
	// jako niedokończoną konfigurację wielojęzyczną.
	if (!siteConfig.isMultilingual) return undefined

	const alternates: Record<string, string> = {}

	for (const locale of siteConfig.locales) {
		alternates[locale] = absoluteUrl(localizedPath(path, locale))
	}

	alternates['x-default'] = absoluteUrl(localizedPath(path, siteConfig.defaultLocale))

	return alternates
}

/** Komplet metadanych: canonical, hreflang, robots, OG, karta Twittera. */
export function buildPageMetadata(seo: PageSeo): Metadata {
	const {
		title,
		description = siteConfig.description,
		path = '/',
		locale = siteConfig.defaultLocale,
		image,
		imageAlt,
		ogTitle,
		noIndex = false,
		type = 'website',
		article,
	} = seo

	const canonical = absoluteUrl(localizedPath(path, locale))

	// Bez własnego obrazu NIE ustawiamy `images` — Next dołoży wtedy obraz
	// z konwencji plikowej. Cokolwiek tu wpisanego nadpisze go martwym linkiem.
	const ogImage = image ? absoluteUrl(image) : undefined

	return {
		title,
		description,

		alternates: {
			canonical,
			languages: buildLanguageAlternates(path),
		},

		robots: noIndex
			? { index: false, follow: false }
			: {
					index: true,
					follow: true,
					googleBot: {
						index: true,
						follow: true,
						// Bez tych dwóch Google pokazuje miniaturę pocztówkową i ucina
						// opis do własnej, zwykle krótszej długości.
						'max-image-preview': 'large',
						'max-snippet': -1,
						'max-video-preview': -1,
					},
				},

		openGraph: {
			type,
			title: ogTitle ?? title,
			description,
			url: canonical,
			siteName: siteConfig.name,
			locale: localeTags[locale],
			alternateLocale: siteConfig.locales
				.filter(other => other !== locale)
				.map(other => localeTags[other]),
			...(ogImage && {
				images: [{ url: ogImage, width: 1200, height: 630, alt: imageAlt ?? title }],
			}),
			...(type === 'article' &&
				article && {
					publishedTime: article.publishedTime,
					modifiedTime: article.modifiedTime,
					authors: article.authors,
					tags: article.tags,
				}),
		},

		twitter: {
			card: 'summary_large_image',
			title: ogTitle ?? title,
			description,
			...(ogImage && { images: [ogImage] }),
			...(siteConfig.twitterHandle && {
				site: `@${siteConfig.twitterHandle}`,
				creator: `@${siteConfig.twitterHandle}`,
			}),
		},
	}
}

/**
 * Metadane korzenia. `metadataBase` jest kluczowe: bez niego OG dostaje adresy
 * względne, których crawlery Facebooka i LinkedIna nie rozwiną.
 */
export function buildRootMetadata(): Metadata {
	return {
		metadataBase: new URL(siteConfig.url),
		title: {
			default: siteConfig.name,
			template: `%s | ${siteConfig.name}`,
		},
		description: siteConfig.description,
		applicationName: siteConfig.name,
		formatDetection: { telephone: false, address: false, email: false },
	}
}
