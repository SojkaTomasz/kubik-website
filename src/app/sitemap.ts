import type { MetadataRoute } from 'next'

import { cities, cityPath } from '@/data/cities'
import { projectPath, projects } from '@/data/projects'
import { staticRoutes } from '@/lib/routes'
import { buildLanguageAlternates, localizedPath } from '@/lib/seo'
import { absoluteUrl, siteConfig } from '@/site.config'

/**
 * Sitemap dla wszystkich języków. Bez `alternates.languages` Google traktuje
 * wersje jako osobne, konkurujące strony i wybiera jedną do indeksowania.
 *
 * Strony miast i realizacji dochodzą z danych — tych samych list, z których
 * `generateStaticParams` buduje trasy, więc w sitemapie nie ma adresu bez strony.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date()

	const routes = [
		...staticRoutes.filter(route => route.inSitemap !== false),
		...cities.map(city => ({
			path: cityPath(city),
			priority: 0.8,
			changeFrequency: 'monthly' as const,
		})),
		...projects.map(project => ({
			path: projectPath(project),
			priority: 0.6,
			changeFrequency: 'yearly' as const,
		})),
	]

	return routes.flatMap(route =>
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
}
