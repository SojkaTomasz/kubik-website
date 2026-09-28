/**
 * Przewijanie z uwzględnieniem przyklejonej nawigacji. `scroll-padding-top`
 * działa przy natywnym skoku po kotwicy, ale nie przy przewijaniu z JS-u.
 */

/** Wysokość nawigacji odczytana z tokenu ustawianego w CSS. */
function getNavHeight(): number {
	if (typeof window === 'undefined') return 0

	const raw = getComputedStyle(document.documentElement).getPropertyValue('--navbar-height').trim()

	// Token bywa podany w rem — przelicz na piksele względem rozmiaru bazowego.
	if (raw.endsWith('rem')) {
		const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
		return Number.parseFloat(raw) * rootSize
	}

	return Number.parseFloat(raw) || 0
}

/** Respektuje `prefers-reduced-motion` — przy tym ustawieniu skaczemy od razu. */
export function scrollToElement(element: HTMLElement, extraOffset = 20): void {
	const offset = getNavHeight() + extraOffset
	const top = element.getBoundingClientRect().top + window.scrollY - offset

	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

	window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

/** Przewija do elementu wskazanego selektorem kotwicy, np. `#kontakt`. */
export function scrollToAnchor(hash: string, extraOffset = 20): boolean {
	const element = document.querySelector<HTMLElement>(hash)
	if (!element) return false

	scrollToElement(element, extraOffset)
	return true
}
