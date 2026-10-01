import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import heroFloor from '@/assets/photos/hero-floor.jpg'
import { FaqSection } from '@/components/sections/faq-section'
import { HeroActions } from '@/components/sections/hero-actions'
import { HowItWorks } from '@/components/sections/how-it-works'
import { PriceFactors } from '@/components/sections/price-factors'
import { ProjectsSlider } from '@/components/sections/projects-slider'
import { ProofBar } from '@/components/sections/proof-bar'
import { QuoteSection } from '@/components/sections/quote-section'
import { ReviewsSection } from '@/components/sections/reviews-section'
import { SuitabilitySection } from '@/components/sections/suitability-section'
import { Button } from '@/components/ui/button'
import { CtaBand } from '@/components/ui/cta-band'
import { PageHero } from '@/components/ui/page-hero'
import { localizedProjects } from '@/data/projects'
import { SERVICE_PATH, serviceContent } from '@/data/service'
import { sectionNumber } from '@/lib/section-number'
import {
	breadcrumbJsonLd,
	buildPageMetadata,
	JsonLd,
	jsonLdGraph,
	serviceJsonLd,
	webPageJsonLd,
} from '@/lib/seo'
import type { Locale } from '@/site.config'

export async function generateMetadata({
	params,
}: PageProps<'/[locale]/frezowanie-pod-ogrzewanie-podlogowe'>): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'service' })

	return buildPageMetadata({
		title: t('title'),
		description: t('description'),
		path: SERVICE_PATH,
		locale: locale as Locale,
	})
}

/**
 * Strona usługi — najważniejsza (docs/zakres.md): hero, jak to działa,
 * realizacje jako dowód, kiedy się nadaje, cena bez stawek, opinie, FAQ,
 * formularz.
 */
export default async function ServicePage({
	params,
}: PageProps<'/[locale]/frezowanie-pod-ogrzewanie-podlogowe'>) {
	const { locale } = await params
	const t = await getTranslations('service')
	const sections = await getTranslations('sections')
	const nav = await getTranslations('nav')
	const quote = await getTranslations('quote')

	const eyebrow = (number: number, label: string) =>
		sections('eyebrow', { number: sectionNumber(number), label })

	return (
		<>
			<JsonLd
				data={jsonLdGraph(
					webPageJsonLd({ path: SERVICE_PATH, name: t('heading'), locale }),
					serviceJsonLd({
						name: t('heading').replace(/\.$/, ''),
						description: t('description'),
						path: SERVICE_PATH,
						serviceType: t('schemaType'),
					}),
					breadcrumbJsonLd([
						{ name: nav('home'), path: '/' },
						{ name: nav('service'), path: SERVICE_PATH },
					])
				)}
			/>

			<PageHero
				image={heroFloor}
				imagePosition='50% 40%'
				eyebrow={t('eyebrow')}
				title={t('heading')}
				lead={t('lead')}
			>
				<HeroActions />
			</PageHero>

			<ProofBar />
			<HowItWorks eyebrow={eyebrow(1, sections('stepsEyebrow'))} />
			<ProjectsSlider
				eyebrow={eyebrow(2, sections('projectsEyebrow'))}
				projects={localizedProjects(locale as Locale)}
			/>
			<SuitabilitySection eyebrow={eyebrow(3, t('fitEyebrow'))} />
			<PriceFactors eyebrow={eyebrow(4, t('priceEyebrow'))} />

			<CtaBand
				title={sections('quoteBandTitle')}
				action={
					<Button
						href='#wycena'
						variant='dark'
						size='xl'
						icon={<ArrowRight />}
						iconPosition='right'
						iconEffect='shiftRight'
						className='w-full md:w-auto md:min-w-72'
					>
						{nav('quote')}
					</Button>
				}
			/>

			<ReviewsSection eyebrow={eyebrow(5, sections('reviewsEyebrow'))} />
			<FaqSection
				eyebrow={eyebrow(6, sections('faqEyebrow'))}
				items={serviceContent[locale as Locale].faq}
			/>
			<QuoteSection eyebrow={eyebrow(7, quote('eyebrow'))} />
		</>
	)
}
