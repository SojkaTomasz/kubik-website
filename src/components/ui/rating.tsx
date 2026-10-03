import { StarIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import type * as React from 'react'

import { CountUp } from '@/components/motion/count-up'
import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

const ratingVariants = cva('flex', {
	variants: {
		size: {
			/** Nagłówek strony — jedna gwiazdka, „5,0 · 70+ opinii" w jednej linii. */
			sm: 'items-center gap-1.5 text-sm',
			/** Hero, popup wyceny — liczba obok gwiazdek i podpisu. */
			md: 'items-center gap-3',
			/** Sekcja opinii — duża liczba, gwiazdki i podpis w kolumnie obok. */
			lg: 'items-baseline gap-3',
		},
	},
	defaultVariants: {
		size: 'md',
	},
})

const ratingValueVariants = cva('font-heading text-foreground tabular-nums', {
	variants: {
		size: {
			sm: 'font-sans font-semibold',
			md: 'text-3xl leading-9 font-bold tracking-[-0.02em]',
			lg: 'text-display-xl font-extrabold tracking-[-0.05em]',
		},
	},
	defaultVariants: {
		size: 'md',
	},
})

export interface RatingProps
	extends Omit<React.ComponentProps<'div'>, 'children'>, VariantProps<typeof ratingVariants> {
	/** Średnia ocena, np. 5 — wyświetlana jako „5,0" w języku strony. */
	value: number
	/** Skala ocen. */
	max?: number
	/** Podpis — źródło i liczba opinii, np. „70+ opinii w Google". */
	label: string
}

/**
 * Ocena z gwiazdkami. Ocena i liczba opinii pochodzą z JEDNEGO źródła
 * (konfiguracja strony) — widok podaje je propsami, komponent tylko pokazuje.
 *
 * Gwiazdki są dekoracją: czytnik ekranu dostaje zdanie „Ocena 5,0 na 5" z ukrytego
 * napisu, a liczba widoczna na ekranie jest przed nim schowana, żeby nie padła
 * dwa razy. Kolor gwiazdek z tokenu `--rating-star` (theme/brand.css).
 */
export function Rating({ className, value, max = 5, label, size, ...props }: RatingProps) {
	const t = useTranslations('a11y')
	const format = useFormatter()
	const formatted = format.number(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
	const stars = size === 'sm' ? 1 : max
	const isCounting = size !== 'sm'

	return (
		<div
			data-slot='rating'
			className={cn(ratingVariants({ size }), className)}
			{...props}
		>
			<span className='sr-only'>{t('rating', { value: formatted, max })}</span>

			{size === 'sm' && (
				<StarIcon
					aria-hidden
					className='size-3.5 shrink-0 fill-rating-star text-rating-star'
				/>
			)}

			{/* Średnia i liczba opinii odliczają od zera (`CountUp`) — poza wersją `sm`
			    z nagłówka, który stoi na każdej podstronie i liczyłby przy każdym wejściu. */}
			<span
				aria-hidden
				data-slot='rating-value'
				className={ratingValueVariants({ size })}
			>
				{isCounting ? (
					<CountUp
						key={formatted}
						value={formatted}
						duration={1.8}
					/>
				) : (
					formatted
				)}
			</span>

			{size === 'sm' ? (
				<span className='text-muted-foreground'>
					{/* Kropka bez `aria-hidden` czytana jest jako „kropka środkowa". */}
					<span aria-hidden>· </span>
					{label}
				</span>
			) : (
				<span className='flex flex-col gap-1'>
					<span
						aria-hidden
						className='flex gap-0.5'
					>
						{Array.from({ length: stars }, (_unused, index) => (
							<StarIcon
								key={index}
								className='size-3.5 shrink-0 fill-rating-star text-rating-star'
							/>
						))}
					</span>
					<span
						className={cn(
							'text-muted-foreground',
							size === 'lg' ? 'text-[0.9375rem] leading-snug' : 'text-sm'
						)}
					>
						{/* Licznik zmienia napis w trakcie odliczania, więc czytnik dostaje
						    stałą wersję obok, a odliczana jest przed nim schowana. */}
						<span aria-hidden>
							<CountUp
								key={label}
								value={label}
								duration={2.2}
							/>
						</span>
						<span className='sr-only'>{label}</span>
					</span>
				</span>
			)}
		</div>
	)
}

export { ratingVariants }
