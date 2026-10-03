'use client'

import { useEffect, useState } from 'react'

/** Pas obserwacji: między 20% a 30% wysokości okna, licząc od góry. */
const OBSERVER_BAND = '-20% 0px -70% 0px'

/**
 * Sekcja, którą właśnie czytasz — do podświetlania spisu treści przy przewijaniu.
 * IntersectionObserver, nie nasłuch przewijania.
 *
 * Ostatnia sekcja dokumentu bywa za krótka, żeby dojechać do pasa obserwacji,
 * więc na samym dole strony aktywna jest ona — inaczej spis zatrzymywał się
 * na przedostatniej pozycji.
 */
export function useActiveSection(ids: readonly string[]): string | undefined {
	const [active, setActive] = useState<string>()

	// Zależnością jest ZŁĄCZONA lista, nie tablica: `items.map(...)` daje przy
	// każdym renderze nową tożsamość, więc `[ids]` wpychało efekt w pętlę
	// i zostawiało podświetloną poprzednią sekcję.
	const key = ids.join('|')

	useEffect(() => {
		const order = key.split('|')
		const sections = order
			.map(id => document.getElementById(id))
			.filter((element): element is HTMLElement => element !== null)

		// Pusta lista nie jest błędem — sekcje mogą jeszcze nie istnieć w drzewie.
		if (sections.length === 0) return () => {}

		const visible = new Set<string>()
		const last = sections.at(-1)?.id

		const update = () => {
			const { scrollHeight } = document.documentElement
			const atBottom = window.scrollY + window.innerHeight >= scrollHeight - 2

			// Widocznych sekcji bywa kilka naraz. Bierzemy pierwszą w kolejności
			// dokumentu, żeby podświetlenie nie skakało przy przewijaniu.
			setActive(previous => (atBottom ? last : (order.find(id => visible.has(id)) ?? previous)))
		}

		const observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (entry.isIntersecting) visible.add(entry.target.id)
					else visible.delete(entry.target.id)
				}
				update()
			},
			{ rootMargin: OBSERVER_BAND }
		)

		for (const section of sections) observer.observe(section)
		window.addEventListener('scroll', update, { passive: true })

		return () => {
			observer.disconnect()
			window.removeEventListener('scroll', update)
		}
	}, [key])

	return active
}
