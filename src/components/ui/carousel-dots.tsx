'use client'

import * as React from 'react'

import { useCarousel } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 *
 * Świadomie OSOBNY plik, a nie dopisek w `carousel.tsx`: tamten pochodzi
 * z rejestru i `shadcn add --overwrite` skasowałby dopisek przy najbliższej
 * aktualizacji. Pełna lista zmian rejestru: AGENTS.md.
 */

export interface CarouselDotsProps extends Omit<React.ComponentProps<'div'>, 'children'> {
	/** Etykieta pojedynczej kropki dla czytnika ekranu. Dostaje numer slajdu. */
	slideLabel?: (index: number) => string
}

/**
 * Muszą stać wewnątrz `<Carousel>` — liczbę PRZYSTANKÓW czytają z kontekstu.
 * Liczba podana propsem rozjeżdża się po cichu, bo przystanki to nie to samo
 * co slajdy. Kropka jest `<button>`, więc działa Tabem i Enterem.
 */
export function CarouselDots({
	className,
	slideLabel = index => `Przejdź do slajdu ${index}`,
	...props
}: CarouselDotsProps) {
	const { api } = useCarousel()
	const [snapCount, setSnapCount] = React.useState(0)
	const [selected, setSelected] = React.useState(0)

	React.useEffect(() => {
		if (!api) return undefined

		const sync = () => {
			setSnapCount(api.scrollSnapList().length)
			setSelected(api.selectedScrollSnap())
		}

		sync()
		api.on('select', sync)
		// `reInit` łapie zmianę liczby slajdów i zmianę punktu przełamania układu.
		api.on('reInit', sync)

		return () => {
			api.off('select', sync)
			api.off('reInit', sync)
		}
	}, [api])

	// Jeden przystanek to brak wyboru — rząd jednej kropki tylko myli.
	if (snapCount <= 1) return null

	return (
		<div
			data-slot='carousel-dots'
			className={cn('flex items-center justify-center', className)}
			{...props}
		>
			{/*
				Kropka 8 px, ale cel dotyku 24 px (WCAG 2.5.8) — przycisk jest polem wokół
				kropki. Przy 8 px i odstępie 8 px axe zgłaszał `target-size`, i to nie za
				każdym razem: wynik zależał od zaokrągleń układu, więc test bywał czerwony
				albo zielony bez żadnej zmiany w kodzie.
			*/}
			{Array.from({ length: snapCount }, (_unused, index) => (
				<button
					key={index}
					type='button'
					data-slot='carousel-dot'
					aria-label={slideLabel(index + 1)}
					aria-current={index === selected ? 'true' : undefined}
					onClick={() => api?.scrollTo(index)}
					className='group/dot flex size-6 cursor-pointer items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
				>
					<span
						aria-hidden
						className={cn(
							'size-2 rounded-full transition-colors',
							index === selected
								? 'bg-primary'
								: 'bg-primary/25 group-hover/dot:bg-primary/50'
						)}
					/>
				</button>
			))}
		</div>
	)
}
