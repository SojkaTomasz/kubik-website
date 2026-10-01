import { ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import heroFloor from '@/assets/photos/hero-floor.jpg'
import { PageBreadcrumbs } from '@/components/layout/page-breadcrumbs'
import { CityLocal } from '@/components/sections/city-local'
import { FaqSection } from '@/components/sections/faq-section'
import { HeroActions } from '@/components/sections/hero-actions'
import { HowItWorks } from '@/components/sections/how-it-works'
import { ProjectsSlider } from '@/components/sections/projects-slider'
import { ProofBar } from '@/components/sections/proof-bar'
import { QuoteSection } from '@/components/sections/quote-section'
import { ReviewsSection } from '@/components/sections/reviews-section'
import { Button } from '@/components/ui/button'
import { CtaBand } from '@/components/ui/cta-band'
import { PageHero } from '@/components/ui/page-hero'
import { cities, cityPath, findCity } from '@/data/cities'
import { projects } from '@/data/projects'
import { SERVICE_PATH, serviceFaq } from '@/data/service'
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

type CityPageProps = PageProps<'/[locale]/frezowanie-pod-ogrzewanie-podlogowe/[city]'>

/** Lista miast jest zamknięta (docs/zakres.md) — nieznany adres to 404, nie render na żądanie. */
export const dynamicParams = false

export function generateStaticParams() {
	return cities.map(city => ({ city: city.slug }))
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
	const { locale, city: slug } = await params
	const city = findCity(slug)
	if (!city) return {}
	const t = await getTranslations({ locale, namespace: 'city' })

	return buildPageMetadata({
		title: t('title', { name: city.name }),
		description: city.description,
		path: cityPath(city),
		locale: locale as Locale,
	})
}

/**
 * Strona miasta (Paper: „Miasto") — szkielet usługi z treścią pisaną dla
 * miasta osobno: lead, sekcja lokalna, FAQ. Realizacja z tego miasta idzie
 * w sliderze pierwsza, a formularz zna miejscowość i o nią nie pyta.
 */
export default async function CityPage({ params }: CityPageProps) {
	const { locale, city: slug } = await params
	const city = findCity(slug)
	if (!city) notFound()

	const t = await getTranslations('city')
	const sections = await getTranslations('sections')
	const nav = await getTranslations('nav')
	const quote = await getTranslations('quote')

	const eyebrow = (number: number, label: string) =>
		sections('eyebrow', { number: sectionNumber(number), label })

	const path = cityPath(city)
	const heading = t('heading', { inCity: city.inCity })
	const breadcrumbs = [
		{ name: nav('home'), path: '/' },
		{ name: t('breadcrumbService'), path: SERVICE_PATH },
		{ name: city.name },
	]
	// Lokalny dowód pierwszy, reszta w zwykłej kolejności.
	const sliderProjects = [
		...projects.filter(project => project.city === city.slug),
		...projects.filter(project => project.city !== city.slug),
	]

	return (
		<>
			<JsonLd
				data={jsonLdGraph(
					webPageJsonLd({ path, name: heading, locale }),
					serviceJsonLd({
						name: heading.replace(/\.$/, ''),
						description: city.description,
						path,
						serviceType: 'Frezowanie wylewki pod ogrzewanie podłogowe',
						areaServed: [city.name],
					}),
					breadcrumbJsonLd(
						breadcrumbs.map(item => ({ name: item.name, path: item.path ?? path })),
						path
					)
				)}
			/>

			<PageHero
				image={heroFloor}
				imagePosition='50% 40%'
				breadcrumbs={<PageBreadcrumbs items={breadcrumbs} />}
				eyebrow={t('eyebrow', { region: city.region })}
				title={heading}
				lead={city.lead}
			>
				<HeroActions />
			</PageHero>

			<ProofBar />
			<CityLocal
				eyebrow={eyebrow(1, t('localEyebrow', { name: city.name }))}
				city={city}
			/>
			<HowItWorks eyebrow={eyebrow(2, sections('stepsEyebrow'))} />
			<ProjectsSlider
				eyebrow={eyebrow(3, sections('projectsEyebrow'))}
				title={t('projectsTitle')}
				projects={sliderProjects}
			/>

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

			<ReviewsSection eyebrow={eyebrow(4, sections('reviewsEyebrow'))} />
			<FaqSection
				eyebrow={eyebrow(5, sections('faqEyebrow'))}
				title={t('faqTitle', { inCity: city.inCity })}
				items={[...city.faq, ...serviceFaq.slice(0, 3)]}
			/>
			<QuoteSection
				eyebrow={eyebrow(6, quote('eyebrow'))}
				city={city.name}
			/>
		</>
	)
}
