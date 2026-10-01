import type * as React from 'react'

import { Typography } from '@/components/ui/typography'
import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

const stepsVariants = cva('relative', {
	variants: {
		orientation: {
			/** Zawsze w kolumnie — telefon, wąska kolumna obok zdjęcia. */
			vertical: 'flex flex-col gap-8',
			/** Kolumna na telefonie, rząd od tabletu — sekcja „Jak to działa". */
			responsive:
				'flex flex-col gap-8 md:grid md:grid-cols-[repeat(var(--steps-count),minmax(0,1fr))] md:gap-6',
		},
	},
	defaultVariants: {
		orientation: 'responsive',
	},
})

export interface StepsItem {
	title: string
	description: string
}

export interface StepsProps
	extends Omit<React.ComponentProps<'ol'>, 'children'>, VariantProps<typeof stepsVariants> {
	items: StepsItem[]
	/** Poziom nagłówka kroku — zależy od miejsca w dokumencie, nie od wyglądu. */
	headingAs?: 'h2' | 'h3' | 'h4'
}

/**
 * Kolor kroku na odcinku rury: pierwszy krok ciepły, ostatni zimny, pośrednie
 * zmieszane w oklab — tak jak gradient `--pipe-*`. W Paperze ręcznie dobrane
 * odcienie (#e5202e → #b00c2e → #6a2f70 → #2d56c8) leżą właśnie na tej prostej.
 */
function stepColor(index: number, count: number): string {
	const share = count > 1 ? Math.round((index / (count - 1)) * 100) : 0

	return `color-mix(in oklab, var(--hot), var(--cold) ${share}%)`
}

/**
 * Numerowane kroki połączone rurą — „Rozplanowanie pętli → Frezowanie →
 * Układanie rury → Zalewanie".
 *
 * Lista uporządkowana (`<ol>`), więc czytnik ekranu ogłasza „lista, 4 elementy"
 * i numer pozycji sam — widoczna cyfra w kółku jest przed nim schowana.
 */
export function Steps({
	className,
	items,
	orientation = 'responsive',
	headingAs = 'h3',
	style,
	...props
}: StepsProps) {
	const isResponsive = orientation === 'responsive'

	return (
		<ol
			data-slot='steps'
			data-orientation={orientation}
			className={cn(stepsVariants({ orientation }), className)}
			style={{ '--steps-count': items.length, ...style } as React.CSSProperties}
			{...props}
		>
			{items.map((item, index) => {
				const isLast = index === items.length - 1

				return (
					<li
						key={item.title}
						data-slot='steps-item'
						className={cn('relative flex gap-5', isResponsive && 'md:flex-col md:gap-8')}
						style={
							{
								'--step-color': stepColor(index, items.length),
								'--step-next': stepColor(index + 1, items.length),
							} as React.CSSProperties
						}
					>
						{/*
							Odcinek rury do następnego kroku: w kolumnie w dół od kółka,
							w rzędzie w prawo aż do kolejnego kółka (przez odstęp siatki).
						*/}
						{!isLast && (
							<span
								aria-hidden
								data-slot='steps-connector'
								className={cn(
									'absolute top-8 -bottom-8 left-[0.9375rem] w-0.5 bg-linear-to-b from-(--step-color) to-(--step-next)',
									isResponsive &&
										'md:top-[1.3125rem] md:-right-6 md:bottom-auto md:left-11 md:h-0.5 md:w-auto md:bg-linear-to-r'
								)}
							/>
						)}

						<span
							aria-hidden
							data-slot='steps-marker'
							className={cn(
								'relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-(--step-color) bg-background font-mono text-xs leading-4 font-bold text-foreground',
								isResponsive && 'md:size-11 md:text-[0.8125rem]'
							)}
						>
							{index + 1}
						</span>

						<div className='flex flex-1 flex-col gap-1.5 md:gap-3'>
							<Typography
								as={headingAs}
								variant='h3'
							>
								{item.title}
							</Typography>
							<Typography
								variant='body'
								tone='muted'
							>
								{item.description}
							</Typography>
						</div>
					</li>
				)
			})}
		</ol>
	)
}

export { stepsVariants }
