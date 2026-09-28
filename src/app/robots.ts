import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/site.config'

/**
 * robots.txt.
 *
 * `/dev/` jest wykluczone dwutorowo: tutaj oraz przez `robots: { index: false }`
 * w metadanych samych stron. Wpis w robots.txt mówi „nie odwiedzaj", metatag
 * mówi „nie indeksuj" — obie deklaracje są potrzebne, bo strona odwiedzona
 * z linku zewnętrznego omija pierwszą z nich.
 */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/dev/', '/api/'],
			},
		],
		sitemap: absoluteUrl('/sitemap.xml'),
	}
}
