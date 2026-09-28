import { hasLocale } from 'next-intl'

import { routing } from '@/i18n/routing'
import { buildFeed, FEED_HEADERS } from '@/lib/seo/feed'
import { type Locale, siteConfig } from '@/site.config'

/** Kanały języków INNYCH niż domyślny. Układ i powód: `lib/seo/feed.ts`. */

/** Pomija język domyślny ŚWIADOMIE — inaczej ten sam kanał wisi pod dwoma adresami. */
export function generateStaticParams() {
	return routing.locales
		.filter(locale => locale !== siteConfig.defaultLocale)
		.map(locale => ({ locale }))
}

/** Adres spoza listy ma dawać 404 — inaczej `/xx/feed.xml` wygeneruje kanał w nieistniejącym języku. */
export const dynamicParams = false

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ locale: string }> }
): Promise<Response> {
	const { locale } = await params

	// `dynamicParams = false` odsiewa nieznane języki już na poziomie routera,
	// ale trasa jest publiczna — sprawdzenie zostaje jako drugi zamek.
	if (!hasLocale(routing.locales, locale)) {
		return new Response('Not found', { status: 404 })
	}

	return new Response(buildFeed(locale as Locale), { headers: FEED_HEADERS })
}
