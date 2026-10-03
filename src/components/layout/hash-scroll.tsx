'use client'

import { useLayoutEffect, useRef } from 'react'

import { usePathname } from '@/i18n/navigation'
import { scrollToElement } from '@/lib/scroll'

/**
 * Przejście na INNĄ stronę z kotwicą (`/kontakt#wycena`): nowa strona pojawia
 * się normalnie, od góry, a dopiero potem płynnie zjeżdża do sekcji. Bez tego
 * router skakał od razu w środek strony i nie było widać, gdzie się wylądowało.
 *
 * - `useLayoutEffect` — przed malowaniem, więc skok routera do kotwicy nie
 *   zdąży mignąć. Router przewija w fazie layoutu strony, która jest dzieckiem
 *   layoutu, czyli wcześniej niż ten efekt.
 * - Pierwsze wejście (link z Google, z maila) zostawiamy przeglądarce: skacze
 *   do kotwicy, zanim JS w ogóle się wczyta, a cofanie tego po hydracji byłoby
 *   widocznym przeskokiem.
 * - Kotwica na TEJ SAMEJ stronie nie zmienia ścieżki — tę obsługuje `Button`
 *   (`scrollToAnchor`).
 */
export function HashScroll() {
	const pathname = usePathname()
	const isFirstRender = useRef(true)

	useLayoutEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false
			return
		}

		const id = decodeURIComponent(window.location.hash.slice(1))
		const target = id ? document.getElementById(id) : null
		if (!target) return

		window.scrollTo({ top: 0, behavior: 'instant' })
		// Klatka przerwy: przeglądarka maluje górę strony, potem rusza przewijanie.
		requestAnimationFrame(() => scrollToElement(target))
	}, [pathname])

	return null
}
