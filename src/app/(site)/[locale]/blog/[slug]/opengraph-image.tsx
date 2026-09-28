import { postBySlug, postsFor } from '@/lib/content/posts'
import {
	OG_IMAGE_CONTENT_TYPE,
	OG_IMAGE_SIZE,
	renderOgImage,
	siteDomain,
} from '@/lib/seo/og-template'
import { type Locale, locales, siteConfig } from '@/site.config'

export const alt = siteConfig.name
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

/**
 * Bez tego obraz generuje się na żądanie, a część robotów rezygnuje, zanim
 * render się skończy. Metadane plikowe nie dziedziczą `generateStaticParams`
 * ze strony obok, więc lista jest powtórzona — musi zgadzać się z `page.tsx`.
 */
export function generateStaticParams() {
	return locales.flatMap(locale => postsFor(locale).map(post => ({ locale, slug: post.slug })))
}

/**
 * Obraz OG wpisu. Bez niego metadane plikowe dziedziczą się w dół i dziesięć
 * linków do bloga wygląda w kanale jak dziesięć kopii tego samego. `cover`
 * z frontmattera nadpisuje ten obraz. Ograniczenia Satori: `lib/seo/og-template.tsx`.
 */
export default async function PostOpengraphImage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>
}) {
	const { locale, slug } = await params
	const post = postBySlug(locale as Locale, slug)

	/*
	 * Wpis może nie istnieć — slug pochodzi z adresu. Zwracamy wtedy obraz
	 * ogólny zamiast rzucać: wyjątek podczas generowania metadanych wywraca
	 * budowanie strony, a brakująca miniatura to najwyżej brzydszy link.
	 */
	if (!post) {
		return renderOgImage({
			eyebrow: siteDomain(),
			title: siteConfig.name,
			description: siteConfig.description,
		})
	}

	return renderOgImage({
		eyebrow: siteDomain(),
		title: post.title,
		description: post.description,
		footnote: post.publishedAt,
	})
}
