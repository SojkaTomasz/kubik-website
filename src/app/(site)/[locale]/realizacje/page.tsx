import { Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import { companyConfig } from '@/company.config'
import { ProjectsGrid } from '@/components/projects/projects-grid'
import { QuoteSection } from '@/components/sections/quote-section'
import { Button } from '@/components/ui/button'
import { CtaBand } from '@/components/ui/cta-band'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { projects, PROJECTS_PATH } from '@/data/projects'
import { phoneLinks } from '@/lib/phone'
import { breadcrumbJsonLd, buildPageMetadata, JsonLd, jsonLdGraph, webPageJsonLd } from '@/lib/seo'
import type { Locale } from '@/site.config'

export async function generateMetadata({ params }: PageProps<'/[locale]/realizacje'>): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'projectsPage' })

	return buildPageMetadata({
		title: t('title'),
		description: t('description'),
		path: PROJECTS_PATH,
		locale: locale as Locale,
	})
}

/**
 * Lista realizacji (Paper: „Realizacje") — nagłówek z leadem obok, filtr
 * rodzaju obiektu, siatka 12 podłóg, telefon i formularz.
 */
export default async function ProjectsPage({ params }: PageProps<'/[locale]/realizacje'>) {
	const { locale } = await params
	const t = await getTranslations('projectsPage')
	const sections = await getTranslations('sections')
	const nav = await getTranslations('nav')
	const quote = await getTranslations('quote')
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined

	return (
		<>
			<JsonLd
				data={jsonLdGraph(
					webPageJsonLd({ path: PROJECTS_PATH, name: t('heading'), locale }),
					breadcrumbJsonLd([
						{ name: nav('home'), path: '/' },
						{ name: nav('projects'), path: PROJECTS_PATH },
					])
				)}
			/>

			<Section aria-labelledby='projects-title'>
				<div className='flex flex-col gap-12 lg:gap-16'>
					<SectionHeading
						as='h1'
						layout='split'
						eyebrow={t('eyebrow')}
						title={t('heading')}
						titleId='projects-title'
						lead={t('lead')}
					/>
					<ProjectsGrid projects={projects} />
				</div>
			</Section>

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

			<QuoteSection eyebrow={quote('eyebrow')} />
		</>
	)
}
