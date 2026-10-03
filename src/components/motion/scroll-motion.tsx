'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Uruchamia silnik animacji przewijania (`lib/animations/engine.ts`) po każdej zmianie
 * trasy. Nic nie renderuje.
 *
 * Silnik przychodzi przez `import()` — GSAP ląduje w osobnym chunku pobieranym po
 * hydracji, więc nie dokłada się do pierwszego malowania ani do TBT. Do tego czasu
 * strona jest w stanie końcowym, bo z serwera nic nie przychodzi ukryte.
 *
 * Przy ograniczonym ruchu silnik w ogóle się nie pobiera — oszczędność transferu
 * i gwarancja, że żadna animacja nie wystartuje (WCAG 2.3.3).
 */
export function ScrollMotion() {
	const pathname = usePathname()

	useEffect(() => {
		let stop: (() => void) | undefined
		let isCancelled = false

		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			void import('@/lib/animations/engine').then(({ startAnimations }) => {
				if (!isCancelled) stop = startAnimations(document)
			})
		}

		return () => {
			isCancelled = true
			stop?.()
		}
	}, [pathname])

	return null
}
