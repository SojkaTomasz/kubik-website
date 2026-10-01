import padStart from 'lodash/padStart'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Image } from '@/components/ui/image'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { cn } from '@/lib/utils'
import type { Project } from '@/data/projects'

/** „03 / 08" — numer zdjęcia na tle kadru. */
function photoNumber(position: number, count: number): string {
	return `${padStart(String(position), 2, '0')} / ${padStart(String(count), 2, '0')}`
}

/**
 * Galeria realizacji (Paper: „Przebieg robót") — dwa pierwsze zdjęcia duże,
 * reszta po trzy w rzędzie, każde z numerem w kolejności robót.
 */
export function ProjectGallery({ project }: { project: Project }) {
	const t = useTranslations('project')
	const count = project.photos.length

	return (
		<Section
			deferLayout
			aria-labelledby='project-gallery-title'
		>
			<div className='flex flex-col gap-8'>
				<SectionHeading
					title={t('galleryTitle')}
					titleId='project-gallery-title'
				/>
				<ul className='grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4'>
					{project.photos.map((photo, index) => {
						const isLead = index < 2

						return (
							<li
								key={photo.src}
								className={cn('relative', isLead ? 'col-span-2 md:col-span-3' : 'md:col-span-2')}
							>
								<Image
									src={photo}
									alt={t('photoAlt', {
										title: project.title,
										city: project.cityName,
										number: index + 1,
										count,
									})}
									ratio='video'
									sizes={
										isLead
											? '(min-width: 1440px) 640px, (min-width: 768px) 50vw, 100vw'
											: '(min-width: 1440px) 420px, (min-width: 768px) 33vw, 50vw'
									}
									placeholder='blur'
									className={cn(!isLead && 'aspect-square md:aspect-[4/3]')}
								/>
								<Badge
									variant='photo'
									aria-hidden
									className='absolute bottom-3 left-3'
								>
									{photoNumber(index + 1, count)}
								</Badge>
							</li>
						)
					})}
				</ul>
			</div>
		</Section>
	)
}
