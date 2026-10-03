import padStart from 'lodash/padStart'
import { useTranslations } from 'next-intl'

import {
	GalleryPhotoButton,
	ProjectGalleryLightbox,
} from '@/components/projects/project-gallery-lightbox'
import { Badge } from '@/components/ui/badge'
import { Image } from '@/components/ui/image'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { anim } from '@/lib/animations/attributes'
import { cn } from '@/lib/utils'
import type { Project } from '@/data/projects'

/** „03 / 08" — numer zdjęcia na tle kadru. */
function photoNumber(position: number, count: number): string {
	return `${padStart(String(position), 2, '0')} / ${padStart(String(count), 2, '0')}`
}

/**
 * Ile zdjęć z początku galerii idzie dużo, po dwa w rzędzie — tak, żeby reszta wypełniła
 * rzędy po trzy bez dziury. Roboty mają od 2 do 8 zdjęć, a stały układ „dwa duże + po trzy"
 * zostawiał przy 3, 4, 6 i 7 zdjęciach pusty kawałek ostatniego rzędu.
 *
 *   2 → 2 duże      3 → 3 małe          4 → 4 duże
 *   5 → 2 + 3       6 → 3 + 3 małe      7 → 4 duże + 3      8 → 2 + 3 + 3
 */
function leadCount(count: number): number {
	if (count === 1) return 1
	const remainder = count % 3

	return remainder === 0 ? 0 : remainder === 1 ? 4 : 2
}

/**
 * Galeria realizacji (Paper: „Przebieg robót"). Kliknięcie zdjęcia otwiera je na cały ekran
 * (`ProjectGalleryLightbox`). Duże zdjęcia po dwa w rzędzie, reszta po trzy, każde z numerem
 * w kolejności robót. Na telefonie duże zajmują całą szerokość, małe po dwa; nieparzyste
 * ostatnie małe rozciąga się na cały rząd.
 */
export function ProjectGallery({ project }: { project: Project }) {
	const t = useTranslations('project')
	const count = project.photos.length
	const leads = leadCount(count)
	const smallCount = count - leads
	const alts = project.photos.map((_, index) =>
		t('photoAlt', { title: project.title, city: project.cityName, number: index + 1, count })
	)

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
				<ProjectGalleryLightbox
					photos={project.photos}
					alts={alts}
				>
					<ul
						className='grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4'
						{...anim('stagger')}
					>
						{project.photos.map((photo, index) => {
							const isLead = index < leads
							const isSolo = count === 1
							// Ostatnie z nieparzystej liczby małych — na telefonie zostałoby samo w rzędzie.
							const isWideOnMobile = !isLead && smallCount % 2 === 1 && index === count - 1

							return (
								<li
									key={photo.src}
									className={cn(
										'relative',
										isSolo
											? 'col-span-2 md:col-span-6'
											: isLead
												? 'col-span-2 md:col-span-3'
												: isWideOnMobile
													? 'col-span-2 md:col-span-2'
													: 'md:col-span-2'
									)}
								>
									<GalleryPhotoButton index={index}>
										<Image
											src={photo}
											alt={alts[index] ?? ''}
											ratio='video'
											sizes={
												isSolo
													? '(min-width: 1440px) 1280px, 100vw'
													: isLead
														? '(min-width: 1440px) 640px, (min-width: 768px) 50vw, 100vw'
														: isWideOnMobile
															? '(min-width: 1440px) 420px, (min-width: 768px) 33vw, 100vw'
															: '(min-width: 1440px) 420px, (min-width: 768px) 33vw, 50vw'
											}
											quality={90}
											placeholder='blur'
											className={cn(
												!isLead &&
													(isWideOnMobile
														? 'md:aspect-[4/3]'
														: 'aspect-square md:aspect-[4/3]')
											)}
										/>
									</GalleryPhotoButton>
									<Badge
										variant='photo'
										aria-hidden
										className='pointer-events-none absolute bottom-3 left-3'
									>
										{photoNumber(index + 1, count)}
									</Badge>
								</li>
							)
						})}
					</ul>
				</ProjectGalleryLightbox>
			</div>
		</Section>
	)
}
