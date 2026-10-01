import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ProjectCard } from '@/components/projects/project-card'
import { Button } from '@/components/ui/button'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel'
import { CarouselProgress } from '@/components/ui/carousel-progress'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import type { Project } from '@/data/projects'

export interface ProjectsSliderProps {
	/** Etykieta z numerem sekcji — „02 · Ostatnie realizacje". */
	eyebrow: string
	title?: string
	projects: Project[]
}

/**
 * Karuzela realizacji (Paper: „ProjectSlider + SliderProgress") — strzałki
 * przy nagłówku, licznik i odnośnik do pełnej listy pod kartami.
 *
 * Karty wychodzą za prawą krawędź na telefonie (80% szerokości), żeby było
 * widać, że jest ich więcej.
 */
export function ProjectsSlider({ eyebrow, title, projects }: ProjectsSliderProps) {
	const t = useTranslations('sections')

	return (
		<Section
			deferLayout
			aria-labelledby='projects-slider-title'
		>
			<Carousel
				opts={{ align: 'start' }}
				className='flex flex-col gap-10 lg:gap-12'
			>
				<SectionHeading
					layout='split'
					eyebrow={eyebrow}
					eyebrowTone='cold'
					title={title ?? t('projectsTitle')}
					titleId='projects-slider-title'
					action={
						<div className='hidden gap-2 md:flex'>
							<CarouselPrevious className='static my-0' />
							<CarouselNext className='static my-0' />
						</div>
					}
				/>

				<CarouselContent className='-ml-3 md:-ml-6'>
					{projects.map(project => (
						<CarouselItem
							key={project.slug}
							className='basis-[80%] pl-3 sm:basis-1/2 md:pl-6 lg:basis-1/3'
						>
							<ProjectCard project={project} />
						</CarouselItem>
					))}
				</CarouselContent>

				<div className='flex items-center justify-between gap-6'>
					<CarouselProgress total={projects.length} />
					<Button
						href='/realizacje'
						variant='link'
						size='none'
						icon={<ArrowRight className='size-4' />}
						iconPosition='right'
						iconEffect='shiftRight'
						className='text-[0.9375rem] font-semibold text-foreground no-underline'
					>
						{t('projectsAll')}
					</Button>
				</div>
			</Carousel>
		</Section>
	)
}
