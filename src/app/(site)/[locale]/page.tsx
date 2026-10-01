import { Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import heroFloor from '@/assets/photos/hero-floor.jpg'
import { companyConfig } from '@/company.config'
import { AboutSection } from '@/components/sections/about-section'
import { HeroContactCard } from '@/components/sections/hero-contact-card'
import { HeroFeatures } from '@/components/sections/hero-features'
import { ProjectsSlider } from '@/components/sections/projects-slider'
import { ProofBar } from '@/components/sections/proof-bar'
import { QuoteSection } from '@/components/sections/quote-section'
import { ReviewsSection } from '@/components/sections/reviews-section'
import { ServiceTeaser } from '@/components/sections/service-teaser'
import { Button } from '@/components/ui/button'
import { CtaBand } from '@/components/ui/cta-band'
import { PageHero } from '@/components/ui/page-hero'
import { projects } from '@/data/projects'
import { phoneLinks } from '@/lib/phone'
import { sectionNumber } from '@/lib/section-number'
import { buildPageMetadata, JsonLd, jsonLdGraph, localBusinessJsonLd, webPageJsonLd } from '@/lib/seo'
import type { Locale } from '@/site.config'

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'home' })

	return buildPageMetadata({
		title: t('title'),
		description: t('description'),
		path: '/',
		locale: locale as Locale,
	})
}

/**
 * Strona główna (Paper: „Strona główna"). Kolejność z docs/zakres.md: hero,
 * dowód, kim jesteśmy, realizacje, usługa, opinie, telefon, formularz.
 */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
	const { locale } = await params
	const t = await getTranslations('home')
	const sections = await getTranslations('sections')
	const quote = await getTranslations('quote')
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined

	/** „01 · Kim jesteśmy" — numer sekcji w kolejności na stronie. */
	const eyebrow = (number: number, label: string) =>
		sections('eyebrow', { number: sectionNumber(number), label })

	return (
		<>
			<JsonLd
				data={jsonLdGraph(
					webPageJsonLd({ path: '/', name: t('heading'), locale }),
					localBusinessJsonLd()
				)}
			/>

			<PageHero
				image={heroFloor}
				imagePosition='50% 62%'
				eyebrow={t('eyebrow')}
				eyebrowInTitle
				title={t('heading')}
				lead={t('lead')}
				aside={<HeroContactCard />}
			>
				<HeroFeatures />
			</PageHero>

			<ProofBar />
			<AboutSection eyebrow={eyebrow(1, t('aboutEyebrow'))} />
			<ProjectsSlider
				eyebrow={eyebrow(2, sections('projectsEyebrow'))}
				projects={projects}
			/>
			<ServiceTeaser eyebrow={eyebrow(3, t('serviceEyebrow'))} />
			<ReviewsSection eyebrow={eyebrow(4, sections('reviewsEyebrow'))} />

			{phone && (
				<CtaBand
					title={sections('callBandTitle')}
					action={
						<Button
							href={phone.href}
							variant='dark'
							size='xl'
							icon={<Phone className='text-cold-text' />}
							className='w-full font-heading font-extrabold md:w-auto md:min-w-72'
						>
							{phone.display}
						</Button>
					}
				/>
			)}

			<QuoteSection eyebrow={eyebrow(5, quote('eyebrow'))} />
		</>
	)
}
