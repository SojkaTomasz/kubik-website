'use client'

import padStart from 'lodash/padStart'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type KeyboardEvent, type TouchEvent, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Image, type ImageSource } from '@/components/ui/image'
import { Typography } from '@/components/ui/typography'

/** Minimalne przesunięcie palca, które liczy się jako przewinięcie, a nie stuknięcie. */
const SWIPE_THRESHOLD = 50

export interface ProjectPhotoDialogProps {
	photos: ImageSource[]
	alts: string[]
	index: number
	onIndexChange: (index: number) => void
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Zdjęcie z galerii realizacji na cały ekran. Strzałki na ekranie i klawiaturze oraz
 * przesunięcie palcem przełączają zdjęcia w kółko.
 *
 * Zdjęcie dostaje `sizes='100vw'` i jakość 90 — to jedyne miejsce, w którym zdjęcie z budowy
 * ogląda się w pełnej rozdzielczości źródła (2560 px, `scripts/optimize-photos.mjs`).
 */
export function ProjectPhotoDialog({
	photos,
	alts,
	index,
	onIndexChange,
	open,
	onOpenChange,
}: ProjectPhotoDialogProps) {
	const t = useTranslations('project')
	const touchStart = useRef<number | null>(null)
	const count = photos.length
	const photo = photos[index]

	const show = (offset: number) => onIndexChange((index + offset + count) % count)

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault()
			show(-1)
		} else if (event.key === 'ArrowRight') {
			event.preventDefault()
			show(1)
		}
	}

	const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
		touchStart.current = event.touches[0]?.clientX ?? null
	}

	const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
		const start = touchStart.current
		const end = event.changedTouches[0]?.clientX
		touchStart.current = null
		if (start === null || end === undefined) return

		const distance = end - start
		if (Math.abs(distance) >= SWIPE_THRESHOLD) show(distance < 0 ? 1 : -1)
	}

	if (!photo) return null

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent
				onKeyDown={handleKeyDown}
				// Pełny ekran zamiast okna na środku: zdejmuje wymiary, odstępy i wyśrodkowanie
				// z `DialogContent`, żeby zdjęcie miało do dyspozycji cały ekran.
				className='inset-0 flex h-dvh max-h-none w-full flex-col gap-0 overflow-hidden rounded-none bg-background p-0 sm:inset-0 sm:max-w-none sm:translate-x-0 sm:translate-y-0 sm:p-0 lg:p-0'
			>
				<DialogTitle className='sr-only'>{alts[index]}</DialogTitle>

				<div
					className='relative min-h-0 flex-1 touch-pan-y'
					onTouchStart={handleTouchStart}
					onTouchEnd={handleTouchEnd}
				>
					{/* Bez `placeholder='blur'`: Next rozciąga podgląd na całą ramkę (`cover`),
					    więc przy `fit='contain'` rozmyta plama zalewała cały ekran. */}
					<Image
						key={photo.src}
						src={photo}
						alt={alts[index] ?? ''}
						ratio='fill'
						fit='contain'
						rounded='none'
						sizes='100vw'
						quality={90}
						eager
						className='bg-transparent'
					/>
					{/* Sąsiednie zdjęcia wczytane z wyprzedzeniem — strzałka pokazuje je od razu. */}
					{count > 1 &&
						[-1, 1].map(offset => {
							const neighbour = photos[(index + offset + count) % count]

							return (
								neighbour &&
								neighbour.src !== photo.src && (
									<Image
										key={`${offset}-${neighbour.src}`}
										src={neighbour}
										alt=''
										aria-hidden
										ratio='fill'
										fit='contain'
										rounded='none'
										sizes='100vw'
										quality={90}
										eager
										className='invisible'
									/>
								)
							)
						})}
				</div>

				{count > 1 && (
					<div className='flex items-center justify-between gap-4 border-t border-border px-4 py-3 sm:px-6'>
						<Button
							variant='outline'
							size='icon-lg'
							aria-label={t('photoPrevious')}
							icon={<ArrowLeft />}
							onClick={() => show(-1)}
						/>
						<Typography
							variant='meta'
							aria-live='polite'
						>
							{`${padStart(String(index + 1), 2, '0')} / ${padStart(String(count), 2, '0')}`}
						</Typography>
						<Button
							variant='outline'
							size='icon-lg'
							aria-label={t('photoNext')}
							icon={<ArrowRight />}
							onClick={() => show(1)}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
