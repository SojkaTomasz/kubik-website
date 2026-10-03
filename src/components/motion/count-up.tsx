'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useCountUp } from 'react-countup'
import type * as React from 'react'

import { formatCount, parseCount } from '@/lib/animations/count'

export interface CountUpProps {
	/**
	 * Gotowy napis z liczbą — „1200+", „5,0", „70+ opinii w Google". Liczy się PIERWSZA
	 * liczba, reszta napisu stoi w miejscu, w tym samym zapisie (przecinek, spacje).
	 */
	value: string
	/** Czas odliczania w sekundach. */
	duration?: number
	className?: string
}

/**
 * Licznik od zera do wartości przy wejściu w kadr — `react-countup` (countUp.js).
 *
 * Serwer renderuje WARTOŚĆ KOŃCOWĄ: robot, czytnik ekranu i przeglądarka bez JS-a
 * widzą prawdziwą liczbę, a zero pojawia się wyłącznie w przeglądarce. Element poza
 * ekranem jest zerowany od razu po montażu (niewidocznie) i odlicza przy wejściu
 * w kadr; element widoczny już przy starcie (hero) odlicza od razu. Przy ograniczonym
 * ruchu licznik w ogóle nie rusza.
 *
 * Napis podmienia countUp.js przez `innerHTML`, więc `value` musi być stałe dla danego
 * elementu — zmienną wartość podaj razem z `key={value}`, żeby React zamontował nowy.
 */
export function CountUp({ value, duration = 2.2, className }: CountUpProps) {
	const ref = useRef<HTMLSpanElement>(null)
	const parts = useMemo(() => parseCount(value), [value])

	const { start, reset } = useCountUp({
		// Typy biblioteki nie znają `RefObject<T | null>` z React 19; w chwili użycia
		// (efekt po montażu) element już jest.
		ref: ref as React.RefObject<HTMLElement>,
		start: 0,
		end: parts?.value ?? 0,
		decimals: parts?.decimals ?? 0,
		duration,
		startOnMount: false,
		formattingFn: current => (parts ? formatCount(parts, current) : value),
	})

	useEffect(() => {
		const element = ref.current
		const isStill = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (!element || !parts || parts.value === 0 || isStill) return undefined

		let isFirstReport = true
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry) return
				if (isFirstReport) {
					isFirstReport = false
					// Poza ekranem: zero teraz, kiedy nikt nie patrzy — odliczanie przy wejściu.
					if (!entry.isIntersecting) {
						reset()
						return
					}
				}
				if (entry.isIntersecting) {
					observer.disconnect()
					start()
				}
			},
			{ threshold: 0.6 }
		)
		observer.observe(element)

		return () => observer.disconnect()
	}, [parts, reset, start])

	return (
		<span
			ref={ref}
			className={className}
		>
			{value}
		</span>
	)
}
