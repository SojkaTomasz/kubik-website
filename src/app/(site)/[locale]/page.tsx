import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { Typography } from '@/components/ui/typography'
import { buildPageMetadata, JsonLd, webPageJsonLd } from '@/lib/seo'
import type { Locale } from '@/site.config'

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'home' })

	return buildPageMetadata({
		title: t('title'),
		description: t('lead'),
		path: '/',
		locale: locale as Locale,
	})
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
	const { locale } = await params
	const t = await getTranslations('home')
	const nav = await getTranslations('nav')

	return (
		<>
			<JsonLd data={webPageJsonLd({ path: '/', name: t('title'), locale })} />

			<Section spacing='lg'>
				<div className='flex flex-col items-start gap-6'>
					<Typography
						as='h1'
						variant='displayMd'
					>
						{t('title')}
					</Typography>
					<Typography
						variant='lead'
						tone='muted'
					>
						{t('lead')}
					</Typography>
					<div className='flex flex-wrap gap-3'>
						<Button
							href='/kontakt'
							size='lg'
							icon={<ArrowRight />}
							iconPosition='right'
							iconEffect='shiftRight'
						>
							{nav('contact')}
						</Button>
						<Button
							href='/dev'
							size='lg'
							variant='outline'
						>
							{t('cta')}
						</Button>
					</div>
				</div>
			</Section>
		</>
	)
}
