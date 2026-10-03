import type * as React from 'react'

import { Container } from '@/components/ui/container'
import { Typography } from '@/components/ui/typography'
import { anim, animationKey } from '@/lib/animations/attributes'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

export interface CtaBandProps extends Omit<React.ComponentProps<'section'>, 'title'> {
	title: React.ReactNode
	/** Poziom nagłówka — zależy od miejsca w dokumencie. */
	as?: 'h2' | 'h3'
	/** Przycisk z prawej — `variant='dark'`, jak w projekcie. */
	action: React.ReactNode
}

/**
 * Pas wezwania do działania na gradiencie rury (Paper: „CtaBand") —
 * „Podaj metraż, a oddzwonimy z ceną.", „Wolisz od razu porozmawiać?".
 *
 * Biały tekst na najjaśniejszym punkcie gradientu ma 4,6:1, więc tytuł zostaje
 * duży i pogrubiony — w tej wielkości wymóg to 3:1.
 */
export function CtaBand({ className, title, as = 'h2', action, ...props }: CtaBandProps) {
	return (
		<section
			data-slot='cta-band'
			className={cn('bg-pipe py-10 md:py-14 lg:py-16', className)}
			{...props}
		>
			<Container className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-12'>
				<Typography
					key={animationKey(title)}
					as={as}
					{...anim('heading')}
					variant='displaySm'
					className='max-w-[18ch] text-white md:text-4xl lg:text-[2.5rem] lg:leading-tight'
				>
					{title}
				</Typography>
				<div
					className='md:shrink-0'
					{...anim('action')}
				>
					{action}
				</div>
			</Container>
		</section>
	)
}
