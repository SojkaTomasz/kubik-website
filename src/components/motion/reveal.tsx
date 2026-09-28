'use client'

import { motion } from 'motion/react'
import * as React from 'react'

import { motionTokens } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * Pojawienie się elementu przy wejściu w pole widzenia.
 *
 * Ograniczony ruch obsługują warstwy POZA tym komponentem (`MotionConfig`
 * w `Providers`, reguły w `app/theme/motion.css`) — tutaj markup zostaje ten
 * sam niezależnie od ustawienia, inaczej serwer i klient renderują co innego.
 * `data-reveal` jest zaczepem tamtych reguł i musi zostać ZAWSZE.
 */

/*
 * `motion.div` deklaruje własne wersje tych zdarzeń, o innych sygnaturach niż
 * React — bez wycięcia definicje zderzają się i komponent się nie kompiluje.
 */
type DivPropsWithoutMotionConflicts = Omit<
	React.ComponentProps<'div'>,
	'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'style'
>

export interface RevealProps extends DivPropsWithoutMotionConflicts {
	/** Opóźnienie w sekundach. Dla list użyj `RevealGroup`. */
	delay?: number
	/** Kierunek, z którego element dojeżdża. `none` animuje samą przezroczystość. */
	direction?: 'up' | 'down' | 'left' | 'right' | 'none'
	/** Ile elementu musi wejść w kadr. Przy wysokich blokach `0.3` bywa nieosiągalne. */
	amount?: number
}

function offsetFor(direction: RevealProps['direction']): { x?: number; y?: number } {
	const { distance } = motionTokens

	switch (direction) {
		case 'down':
			return { y: -distance }
		case 'left':
			return { x: distance }
		case 'right':
			return { x: -distance }
		case 'none':
			return {}
		default:
			return { y: distance }
	}
}

export function Reveal({
	className,
	children,
	delay = 0,
	direction = 'up',
	amount = 0.15,
	...props
}: RevealProps) {
	// ŻADNEJ gałęzi na ograniczony ruch w tym miejscu: serwer nie zna ustawienia
	// systemowego, więc rozgałęzienie daje niezgodność hydracji — widoczną
	// wyłącznie w przebiegu deweloperskim.
	return (
		<motion.div
			data-slot='reveal'
			data-reveal=''
			className={cn(className)}
			initial={{ opacity: 0, ...offsetFor(direction) }}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
			viewport={{ once: true, amount }}
			transition={{
				duration: motionTokens.duration,
				delay,
				ease: motionTokens.ease,
			}}
			{...props}
		>
			{children}
		</motion.div>
	)
}

export interface RevealGroupProps extends Omit<RevealProps, 'delay'> {
	/** Odstęp między kolejnymi dziećmi w sekundach. */
	stagger?: number
}

/** Kaskada — opóźnienie liczone z pozycji dziecka, więc dopisanie pozycji nie wymaga przenumerowania. */
export function RevealGroup({
	children,
	stagger = motionTokens.stagger,
	className,
	...props
}: RevealGroupProps) {
	return (
		<div
			data-slot='reveal-group'
			className={className}
		>
			{React.Children.map(children, (child, index) => (
				<Reveal
					delay={index * stagger}
					{...props}
				>
					{child}
				</Reveal>
			))}
		</div>
	)
}
