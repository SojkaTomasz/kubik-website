import type * as React from 'react'
import { cloneElement, isValidElement } from 'react'

import { Typography } from '@/components/ui/typography'
import { anim, animationKey } from '@/lib/animations/attributes'
import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

const sectionHeadingVariants = cva('flex', {
	variants: {
		layout: {
			/** Etykieta, tytuł i lead jeden pod drugim. */
			stack: 'flex-col gap-4 md:gap-5',
			/** Od desktopu tytuł z lewej, lead i akcja z prawej, wyrównane do dołu. */
			split: 'flex-col gap-4 md:gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-20',
		},
	},
	defaultVariants: {
		layout: 'stack',
	},
})

export interface SectionHeadingProps
	extends Omit<React.ComponentProps<'div'>, 'title'>, VariantProps<typeof sectionHeadingVariants> {
	/** Etykieta mono nad tytułem — „01 · Jak to działa". */
	eyebrow?: string
	/** Kolor etykiety: czerwona w sekcjach głównych, niebieska w drugoplanowych. */
	eyebrowTone?: 'primary' | 'cold' | 'muted'
	title: React.ReactNode
	/** Poziom nagłówka — zależy od miejsca w dokumencie, nie od wyglądu. */
	as?: 'h1' | 'h2' | 'h3'
	titleId?: string
	lead?: React.ReactNode
	/** Element obok leada — przycisk, strzałki karuzeli. */
	action?: React.ReactNode
}

/**
 * Nagłówek sekcji (Paper: „SectionHeading") — etykieta mono, tytuł krojem
 * nagłówkowym, opcjonalny lead i akcja.
 */
export function SectionHeading({
	className,
	layout,
	eyebrow,
	eyebrowTone = 'primary',
	title,
	as = 'h2',
	titleId,
	lead,
	action,
	...props
}: SectionHeadingProps) {
	const hasAside = Boolean(lead || action)

	return (
		<div
			data-slot='section-heading'
			className={cn(sectionHeadingVariants({ layout }), className)}
			{...props}
		>
			<div className='flex flex-col gap-4 md:gap-5'>
				{eyebrow && (
					<Typography
						key={animationKey(eyebrow)}
						as='p'
						variant='overline'
						tone={eyebrowTone}
						{...anim('eyebrow')}
					>
						{eyebrow}
					</Typography>
				)}
				{/* Animacja wejścia: linie spod maski (`lib/animations/engine.ts`). `key`
				    z treści — powód w `animationKey`. */}
				<Typography
					key={animationKey(title)}
					as={as}
					id={titleId}
					variant='displayMd'
					className='max-w-[20ch]'
					{...anim('heading')}
				>
					{title}
				</Typography>
			</div>

			{hasAside && (
				<div
					className={cn(
						'flex flex-col gap-6',
						layout === 'split' && 'lg:max-w-md lg:shrink-0',
						// Lead zostaje wyrównany do lewej (Paper), do prawej dosuwa się tylko akcja.
						layout === 'split' && action && 'lg:items-end'
					)}
				>
					{lead && (
						<Typography
							key={animationKey(lead)}
							variant='lead'
							tone='muted'
							{...anim('text')}
						>
							{lead}
						</Typography>
					)}
					{/* Rola dopisana wprost do elementu akcji, bez opakowania: strzałki karuzeli
					    bywają `hidden` na telefonie, a puste opakowanie dokładałoby odstęp. */}
					{isValidElement<Record<string, unknown>>(action)
						? cloneElement(action, anim('action'))
						: action}
				</div>
			)}
		</div>
	)
}

export { sectionHeadingVariants }
