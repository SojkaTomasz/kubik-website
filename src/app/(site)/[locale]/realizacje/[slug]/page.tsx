import toLower from 'lodash/toLower'
import { ArrowLeft, ArrowRight, Images } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import { PageBreadcrumbs } from '@/components/layout/page-breadcrumbs'
import { ProjectGallery } from '@/components/projects/project-gallery'
import { QuoteSection } from '@/components/sections/quote-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CtaBand } from '@/components/ui/cta-band'
import { Image } from '@/components/ui/image'
import { Section } from '@/components/ui/section'
import { Stat, StatGroup } from '@/components/ui/stat'
import { Steps } from '@/components/ui/steps'
import { Typography } from '@/components/ui/typography'
import { findProject, projectPath, projects, PROJECTS_PATH } from '@/data/projects'
import { breadcrumbJsonLd, buildPageMetadata, JsonLd, jsonLdGraph, webPageJsonLd } from '@/lib/seo'
import type { Locale } from '@/site.config'

type ProjectPageProps = PageProps<'/[locale]/realizacje/[slug]'>

/** Lista realizacji jest zamknięta — nieznany adres to 404. */
export const dynamicParams = false

export function generateStaticParams() {
	return projects.map(project => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
	const { locale, slug } = await params
	const project = findProject(slug)
	if (!project) return {}
	const t = await getTranslations({ locale, namespace: 'project' })
	const kinds = await getTranslations({ locale, namespace: 'projectsPage.kinds' })

	return buildPageMetadata({
		title: t('title', { city: project.cityName, area: project.area }),
		description: t('description', {
			object: toLower(kinds(project.kind)),
			area: project.area,
			time: t('days', { count: project.days }),
		}),
		path: projectPath(project),
		locale: locale as Locale,
	})
}

/**
 * Realizacja (Paper: „Realizacja (Wrocław)") — tytuł ze strzałkami do
 * sąsiednich realizacji, zdjęcie, karta techniczna, przebieg w trzech
 * krokach, galeria i wezwanie dopasowane do rodzaju obiektu.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
	const { locale, slug } = await params
	const project = findProject(slug)
	if (!project) notFound()

	const t = await getTranslations('project')
	const kinds = await getTranslations('projectsPage.kinds')
	const nav = await getTranslations('nav')
	const quote = await getTranslations('quote')

	const path = projectPath(project)
	const heading = t('heading', { title: project.title, area: project.area })
	const index = projects.indexOf(project)
	const previous = projects.at(index - 1)
	const next = projects[(index + 1) % projects.length]
	const breadcrumbs = [
		{ name: nav('projects'), path: PROJECTS_PATH },
		{ name: project.cityName },
	]
	const storyLabels = t.raw('story') as string[]
	const [cover] = project.photos

	return (
		<>
			<JsonLd
				data={jsonLdGraph(
					webPageJsonLd({ path, name: heading, locale }),
					breadcrumbJsonLd(
						[{ name: nav('home'), path: '/' }, ...breadcrumbs].map(item => ({
							name: item.name,
							path: item.path ?? path,
						})),
						path
					)
				)}
			/>

			<Section aria-labelledby='project-title'>
				<div className='flex flex-col gap-10 lg:gap-14'>
					<div className='flex flex-col gap-5'>
						<PageBreadcrumbs items={breadcrumbs} />
						<div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
							<Typography
								as='h1'
								id='project-title'
								variant='displayLg'
								className='max-w-[60rem]'
							>
								{heading}
							</Typography>
							<div className='flex shrink-0 gap-2'>
								{previous && (
									<Button
										href={projectPath(previous)}
										variant='outline'
										size='icon-lg'
										aria-label={t('previous', { title: previous.title })}
										icon={<ArrowLeft />}
									/>
								)}
								{next && (
									<Button
										href={projectPath(next)}
										variant='outline'
										size='icon-lg'
										aria-label={t('next', { title: next.title })}
										icon={<ArrowRight />}
									/>
								)}
							</div>
						</div>
					</div>

					{cover && (
						<div className='relative'>
							<Image
								src={cover}
								alt={t('photoAlt', {
									title: project.title,
									city: project.cityName,
									number: 1,
									count: project.photos.length,
								})}
								ratio='video'
								eager
								sizes='(min-width: 1440px) 1280px, 100vw'
								placeholder='blur'
								className='lg:aspect-[2/1]'
							/>
							<Badge
								variant='photo'
								className='absolute bottom-4 left-4 gap-2 md:bottom-6 md:left-6'
							>
								<Images aria-hidden />
								{t('photoCount', { count: project.photos.length })}
							</Badge>
						</div>
					)}

					<div className='grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-20'>
						<StatGroup layout='grid'>
							<Stat
								layout='spec'
								size='sm'
								label={t('specs.area')}
								value={`${project.area} m²`}
							/>
							<Stat
								layout='spec'
								size='sm'
								label={t('specs.time')}
								value={t('days', { count: project.days })}
							/>
							<Stat
								layout='spec'
								size='sm'
								label={t('specs.screed')}
								value={project.screed}
							/>
							<Stat
								layout='spec'
								size='sm'
								label={t('specs.kind')}
								value={kinds(project.kind)}
							/>
						</StatGroup>
						<Typography
							variant='lead'
							tone='muted'
						>
							{project.intro}
						</Typography>
					</div>

					<section aria-labelledby='project-story-title'>
						<Typography
							as='h2'
							id='project-story-title'
							className='sr-only'
						>
							{t('storyTitle')}
						</Typography>
						<Steps
							appearance='rule'
							items={project.story.map((description, position) => ({
								title: storyLabels[position] ?? '',
								description,
							}))}
						/>
					</section>
				</div>
			</Section>

			<ProjectGallery project={project} />

			<CtaBand
				title={t(`cta.${project.kind}`)}
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

			<QuoteSection eyebrow={quote('eyebrow')} />
		</>
	)
}
