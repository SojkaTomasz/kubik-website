import { postPath, postsFor, publishedPostPaths } from '@/lib/content/posts'
import { localizedPath } from '@/lib/seo/metadata'
import { absoluteUrl, type Locale, localeTags, siteConfig } from '@/site.config'

/**
 * Kanał RSS 2.0. OSOBNY na język, bo wersje wpisów mają własne slugi i jeden
 * kanał mieszałby dwa języki w jednej liście.
 *
 * Kanał ma dwa adresy w dwóch miejscach drzewa tras, bo matcher w `proxy.ts`
 * wyklucza ścieżki z kropką — trasa wyłącznie w `[locale]` dawałaby 404 pod
 * adresem kanonicznym:
 *
 *   `/feed.xml`      `app/feed.xml/route.ts` (język domyślny, poza `[locale]`)
 *   `/en/feed.xml`   `app/(site)/[locale]/feed.xml/route.ts`
 */

/** Adres kanału dla danego języka — jedno miejsce prawdy dla trasy i dla `<head>`. */
export function feedPath(locale: Locale): string {
	return localizedPath('/feed.xml', locale)
}

/** Bez tego `&` w tytule wywraca CAŁY kanał — XML nie ma trybu odzyskiwania po błędzie. */
function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;')
}

/** RFC 822 — `YYYY-MM-DD` z frontmattera nie jest dla czytnika RSS datą. */
function toRfc822(date: string): string {
	return new Date(`${date}T00:00:00Z`).toUTCString()
}

export function buildFeed(locale: Locale): string {
	const posts = postsFor(locale)

	// Szkice odsiewa `postsFor` — filtrowanie po swojemu opublikowałoby
	// nieskończony tekst od razu subskrybentom.
	const items = posts
		.map(post => {
			const url = absoluteUrl(localizedPath(postPath(post.slug), locale))

			return `		<item>
			<title>${escapeXml(post.title)}</title>
			<link>${url}</link>
			<guid isPermaLink="true">${url}</guid>
			<description>${escapeXml(post.description)}</description>
			<pubDate>${toRfc822(post.publishedAt)}</pubDate>
${post.tags.map(tag => `			<category>${escapeXml(tag)}</category>`).join('\n')}
		</item>`
		})
		.join('\n')

	// Z najnowszego wpisu, NIE z chwili budowania: data builda mówiłaby
	// czytnikom o zmianie przy każdym wdrożeniu.
	const newest = publishedPostPaths(locale)
		.map(entry => entry.updatedAt)
		.sort()
		.at(-1)

	const selfUrl = absoluteUrl(feedPath(locale))

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${escapeXml(siteConfig.name)}</title>
		<link>${absoluteUrl(localizedPath('/blog', locale))}</link>
		<description>${escapeXml(siteConfig.description)}</description>
		<language>${localeTags[locale].replace('_', '-')}</language>
		<atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />
${newest ? `		<lastBuildDate>${toRfc822(newest)}</lastBuildDate>` : ''}
${items}
	</channel>
</rss>
`
}

/** Nagłówki odpowiedzi kanału — wspólne dla obu tras. */
export const FEED_HEADERS = {
	'Content-Type': 'application/rss+xml; charset=utf-8',
	// Godzina to kompromis: treść zmienia się przy wdrożeniu, ale czytniki
	// odpytują regularnie.
	'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
} as const
