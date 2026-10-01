import type * as React from 'react'

import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK Z REJESTRU MAGIC UI (`https://magicui.design/r/marquee.json`),
 * zmodyfikowany: tylko poziomo (pionowego pasa projekt nie ma), `data-slot`
 * dla reguły ograniczonego ruchu w theme/motion.css, kopie treści ukryte przed
 * czytnikiem ekranu. `shadcn add --overwrite` to skasuje. Lista: AGENTS.md.
 */

interface MarqueeProps extends React.ComponentPropsWithoutRef<'div'> {
	/** Przewijanie w przeciwną stronę. */
	reverse?: boolean
	/** Zatrzymanie pod kursorem. */
	pauseOnHover?: boolean
	children: React.ReactNode
	/**
	 * Ile razy powtórzyć treść. Musi wystarczyć na szerokość ekranu plus jedną
	 * kopię — inaczej na szerokim monitorze pas urywa się przed końcem pętli.
	 */
	repeat?: number
}

/**
 * Pas przewijający się bez końca — miasta w stopce.
 *
 * Treść jest powielana `repeat` razy. Czytnik ekranu dostaje WYŁĄCZNIE pierwszą
 * kopię: bez `aria-hidden` na pozostałych lista miast byłaby przeczytana
 * cztery razy z rzędu.
 */
export function Marquee({
	className,
	reverse = false,
	pauseOnHover = false,
	children,
	repeat = 4,
	...props
}: MarqueeProps) {
	return (
		<div
			data-slot='marquee'
			{...props}
			className={cn(
				// `min-w-0 w-full` — bez tego najmniejsza szerokość pasa to suma WSZYSTKICH
				// kopii treści i pas rozpycha rodzica, dając poziome przewijanie strony.
				'group flex w-full min-w-0 flex-row gap-(--gap) overflow-hidden [--duration:40s] [--gap:1rem]',
				className
			)}
		>
			{Array.from({ length: repeat }, (_unused, index) => (
				<div
					key={index}
					aria-hidden={index > 0 || undefined}
					className={cn(
						'flex shrink-0 animate-marquee flex-row justify-around gap-(--gap)',
						pauseOnHover && 'group-hover:[animation-play-state:paused]',
						reverse && '[animation-direction:reverse]'
					)}
				>
					{children}
				</div>
			))}
		</div>
	)
}
