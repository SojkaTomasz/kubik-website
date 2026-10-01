import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import {
	PrivacyPolicyHeader,
	PrivacyPolicySections,
	PrivacyPolicyToc,
} from '@/components/legal/privacy-policy'
import { Section } from '@/components/ui/section'
import { breadcrumbJsonLd, webPageJsonLd } from '@/lib/seo/json-ld'
import { jsonLdGraph } from '@/lib/seo/json-ld'
import { JsonLd } from '@/lib/seo/json-ld-component'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { type Locale } from '@/site.config'

/**
 * Oprawa polityki prywatności: metadane, dane strukturalne, szerokość kolumny.
 * Treść siedzi w `components/legal/privacy-policy.tsx`, bo pokazuje ją też okno
 * z banera. Strona musi istnieć — baner bez działającej polityki daje zgodę
 * wadliwą prawnie.
 */

export async function generateMetadata({
	params,
}: PageProps<'/[locale]/polityka-prywatnosci'>): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'privacy' })

	return buildPageMetadata({
		title: t('title'),
		description: t('description'),
		path: '/polityka-prywatnosci',
		locale: locale as Locale,
		// Treść jest robocza i czeka na weryfikację prawnika (nagłówek
		// `privacy-policy.tsx`). Zdejmij tę flagę po jej zatwierdzeniu.
		noIndex: true,
	})
}

export default async function PrivacyPolicyPage({
	params,
}: PageProps<'/[locale]/polityka-prywatnosci'>) {
	const { locale } = await params
	const t = await getTranslations('privacy')
	const nav = await getTranslations('nav')

	return (
		<>
			<JsonLd
				data={jsonLdGraph(
					webPageJsonLd({ path: '/polityka-prywatnosci', name: t('title'), locale }),
					breadcrumbJsonLd([
						{ name: nav('home'), path: '/' },
						{ name: t('title'), path: '/polityka-prywatnosci' },
					])
				)}
			/>

			{/* `h1` tylko tutaj — w oknie modalnym tytuł schodzi do `h2`, bo
			    strona pod spodem ma już własny nagłówek pierwszego poziomu. */}
			<Section
				spacing='lg'
				className='border-b'
			>
				<PrivacyPolicyHeader
					titleAs='h1'
					size='page'
				/>
			</Section>

			{/*
				Spis treści przyklejony z lewej od desktopu; na telefonie i tablecie
				go nie ma — sekcje i tak są jedna pod drugą, a lista siedmiu
				odnośników przed treścią tylko by ją odsuwała.
			*/}
			<Section>
				<div className='grid gap-20 lg:grid-cols-[17.5rem_minmax(0,47.5rem)]'>
					<PrivacyPolicyToc className='sticky top-28 hidden self-start lg:flex' />
					<PrivacyPolicySections headingAs='h2' />
				</div>
			</Section>
		</>
	)
}
