'use client'

import padStart from 'lodash/padStart'
import * as React from 'react'

import { useCarousel } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 *
 * Osobny plik, a nie dopisek w `carousel.tsx` — tamten pochodzi z rejestru
 * i `shadcn add --overwrite` skasowałby dopisek. Pełna lista zmian: AGENTS.md.
 */

export interface CarouselProgressProps extends Omit<React.ComponentProps<'div'>, 'children'> {
	/** Liczba wszystkich elementów — pokazywana po ukośniku („01 / 12"). */
	total: number
}

/**
 * Licznik i pasek postępu karuzeli (Paper: „SliderProgress") — „01 / 12" mono
 * i cienka linia, której zimny odcinek rośnie z przewijaniem.
 *
 * Musi stać wewnątrz `<Carousel>`. Numer liczony z bieżącego przystanku, nie
 * slajdu — przy kilku kartach na ekranie jeden przystanek obejmuje kilka. Dla
 * czytnika ekranu licznik jest dekoracją: slajdy i tak mają swoje nazwy.
 */
export function CarouselProgress({ className, total, ...props }: CarouselProgressProps) {
	const { api } = useCarousel()
	const [current, setCurrent] = React.useState(1)
	const [progress, setProgress] = React.useState(0)

	React.useEffect(() => {
		if (!api) return undefined

		const sync = () => {
			const snaps = api.scrollSnapList().length
			const index = api.selectedScrollSnap()
			// Ostatni przystanek pokazuje ostatni element, nawet gdy na ekranie
			// mieści się kilka kart naraz.
			setCurrent(index === snaps - 1 ? total : index + 1)
			setProgress(snaps > 1 ? index / (snaps - 1) : 1)
		}

		sync()
		api.on('select', sync)
		api.on('reInit', sync)

		return () => {
			api.off('select', sync)
			api.off('reInit', sync)
		}
	}, [api, total])

	const pad = (value: number) => padStart(String(value), 2, '0')

	return (
		<div
			data-slot='carousel-progress'
			aria-hidden
			className={cn('flex items-center gap-3', className)}
			{...props}
		>
			<span className='font-mono text-[0.8125rem] leading-4 font-semibold tabular-nums'>
				{pad(current)} / {pad(total)}
			</span>
			<span className='relative h-0.5 w-24 shrink-0 bg-border'>
				<span
					className='absolute inset-y-0 left-0 bg-cold transition-[width] duration-300'
					style={{ width: `${Math.max(progress, 1 / Math.max(total, 1)) * 100}%` }}
				/>
			</span>
		</div>
	)
}
