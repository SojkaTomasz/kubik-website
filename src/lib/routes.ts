/**
 * Rejestr tras statycznych — jedno źródło dla sitemapy i nawigacji. Wpisy
 * dynamiczne (blog) dokłada `sitemap.ts`.
 */

/**
 * Segmenty POZA routingiem językowym: bez wersji `/en/…` i bez prefiksu
 * w `Button` z `href`. Lista jest powtórzona w matcherze `proxy.ts` (Next.js
 * wymaga tam literału) — zgodności pilnuje `routes.test.ts`.
 *
 * `apple-icon` jest tu, bo to jedyna trasa metadanych BEZ kropki w adresie,
 * więc reguła w matcherze jej nie łapie i ikona zwracała 404.
 */
export const UNLOCALIZED_SEGMENTS = ['api', 'dev', '_next', '_vercel', 'apple-icon'] as const

/** `true`, gdy ścieżka wskazuje trasę spoza routingu językowego. */
export function isUnlocalizedPath(path: string): boolean {
	const first = path.replace(/^\//, '').split(/[/?#]/)[0] ?? ''

	return (UNLOCALIZED_SEGMENTS as readonly string[]).includes(first)
}

export interface StaticRoute {
	/** Ścieżka bez prefiksu języka, np. `/kontakt`. */
	path: string
	/** Priorytet dla sitemapy: 1.0 strona główna, 0.8 kluczowe podstrony, 0.3 dokumenty. */
	priority: number
	changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
	/** `false` wyłącza wpis z sitemapy — np. strona podziękowania po formularzu. */
	inSitemap?: boolean
}

/** ► Dopisuj wpis DOPIERO wtedy, gdy strona istnieje — 404 w sitemapie obniża zaufanie do całej. */
export const staticRoutes: StaticRoute[] = [
	{ path: '/', priority: 1, changeFrequency: 'weekly' },
	{ path: '/kontakt', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
	// `inSitemap: false`, dopóki polityka jest szkieletem z noIndex — zgłaszanie
	// Google adresu oznaczonego jako nieindeksowany to sprzeczny sygnał.
	{ path: '/polityka-prywatnosci', priority: 0.3, changeFrequency: 'yearly', inSitemap: false },
]
