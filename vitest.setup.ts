import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

/**
 * Wspólne przygotowanie środowiska testowego.
 *
 * Wszystko tutaj ma jeden cel: żeby każdy test startował z tego samego,
 * przewidywalnego stanu. Test, który przechodzi tylko wtedy, gdy uruchomi się
 * po innym teście, jest gorszy niż brak testu — daje fałszywe poczucie
 * bezpieczeństwa i kosztuje godziny przy pierwszej awarii.
 */

/**
 * jsdom nie implementuje `matchMedia`, a używa go warstwa motywu i hook
 * `use-mobile`. Atrapa domyślnie zwraca „brak dopasowania", czyli motyw jasny
 * i widok desktopowy; test, który potrzebuje innego wyniku, nadpisuje ją sam.
 */
function mockMatchMedia() {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		configurable: true,
		value: vi.fn((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	})
}

/** jsdom nie ma ResizeObservera, a wymagają go komponenty Base UI. */
function mockResizeObserver() {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
}

/**
 * jsdom nie ma IntersectionObservera, a wymaga go `whileInView` z motion.
 *
 * Atrapa NIE zgłasza wejścia elementu w kadr — animacje wejścia nie odpalają
 * się w testach jednostkowych i nie muszą. Tego, czy treść faktycznie się
 * pojawia po przewinięciu, nie da się rzetelnie sprawdzić w jsdomie, bo ten
 * nie liczy układu strony; robi to `e2e/motion.spec.ts` w prawdziwej
 * przeglądarce.
 */
function mockIntersectionObserver() {
	globalThis.IntersectionObserver = class {
		readonly root = null
		readonly rootMargin = ''
		readonly thresholds: readonly number[] = []
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords(): IntersectionObserverEntry[] {
			return []
		}
	}
}

beforeEach(() => {
	mockMatchMedia()
	mockResizeObserver()
	mockIntersectionObserver()
	window.localStorage.clear()
	document.documentElement.className = ''
	document.documentElement.style.colorScheme = ''
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})
