import type { MetadataRoute } from 'next'

import { postPath, publishedPostPaths } from '@/lib/content/posts'
import { staticRoutes } from '@/lib/routes'
import { buildLanguageAlternates, localizedPath } from '@/lib/seo'
import { absoluteUrl, siteConfig } from '@/site.config'

/**
 * Sitemap dla wszystkich języków. Bez `alternates.languages` Google traktuje
 * wersje jako osobne, konkurujące strony i wybiera jedną do indeksowania.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date()

	const staticEntries = staticRoutes
		.filter(route => route.inSitemap !== false)
		.flatMap(route =>
			siteConfig.locales.map(locale => {
				const languages = buildLanguageAlternates(route.path)

				return {
					url: absoluteUrl(localizedPath(route.path, locale)),
					lastModified,
					changeFrequency: route.changeFrequency,
					priority: route.priority,
					// Przy jednym języku bloku `alternates` nie ma wcale — pusty
					// `xhtml:link` w sitemapie jest dla Google sygnałem błędu.
					...(languages && { alternates: { languages } }),
				}
			})
		)

	/*
	 * Wpisy BEZ `alternates`: wersje językowe mają własne slugi, więc podmiana
	 * samego prefiksu dawałaby hreflang prowadzący do 404 — gorzej niż jego brak.
	 *
	 * `lastModified` z frontmatteru, nie z daty builda.
	 */
	const postEntries = siteConfig.locales.flatMap(locale =>
		publishedPostPaths(locale).map(({ slug, updatedAt }) => ({
			url: absoluteUrl(localizedPath(postPath(slug), locale)),
			lastModified: new Date(updatedAt),
			changeFrequency: 'monthly' as const,
			priority: 0.6,
		}))
	)

	return [...staticEntries, ...postEntries]
}
