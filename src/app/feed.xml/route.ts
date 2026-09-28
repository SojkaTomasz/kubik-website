import { buildFeed, FEED_HEADERS } from '@/lib/seo/feed'
import { siteConfig } from '@/site.config'

/**
 * Kanał języka domyślnego. POZA segmentem `[locale]`, bo matcher w `proxy.ts`
 * wyklucza ścieżki z kropką — trasa tylko w `[locale]` dawałaby 404 pod adresem
 * kanonicznym. Całość układu: `lib/seo/feed.ts`.
 */
export const dynamic = 'force-static'

export function GET(): Response {
	return new Response(buildFeed(siteConfig.defaultLocale), { headers: FEED_HEADERS })
}
