import {
	OG_IMAGE_CONTENT_TYPE,
	OG_IMAGE_SIZE,
	renderOgImage,
	siteDomain,
} from '@/lib/seo/og-template'
import { locales, siteConfig } from '@/site.config'

export const alt = siteConfig.name
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

/**
 * Bez tego obraz generowałby się na żądanie przy każdym udostępnieniu linku.
 * Metadane plikowe nie dziedziczą `generateStaticParams` z layoutu — trzeba je
 * powtórzyć tutaj.
 */
export function generateStaticParams() {
	return locales.map(locale => ({ locale }))
}

/**
 * Domyślny obraz OG — dziedziczony przez każdą podstronę bez własnego. Wpisy
 * bloga mają swój. Ograniczenia Satori: `lib/seo/og-template.tsx`.
 */
export default async function OpengraphImage() {
	return renderOgImage({
		eyebrow: siteDomain(),
		title: siteConfig.name,
		description: siteConfig.description,
	})
}
