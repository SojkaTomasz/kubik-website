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

/** Ile razy wolno dociągnąć przewijanie, gdy cel przesunął się w trakcie. */
const MAX_CORRECTIONS = 3

/**
 * Respektuje `prefers-reduced-motion` — przy tym ustawieniu skaczemy od razu.
 *
 * Cel liczony jest na starcie, a sekcje z `deferLayout` (`content-visibility:
 * auto`) mają do pierwszego narysowania szacunkową wysokość. Przewijanie przez
 * nie zmienia układu pod spodem i kończyło się kilkaset pikseli za celem. Po
 * `scrollend` liczymy więc jeszcze raz i dociągamy. Przeglądarka bez
 * `scrollend` zostaje przy pierwszym przewinięciu.
 */
export function scrollToElement(element: HTMLElement, extraOffset = 20): void {
	const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		? 'auto'
		: 'smooth'
	let corrections = 0

	// Ruch użytkownika w trakcie przerywa dociąganie — nie szarpiemy stroną,
	// którą ktoś właśnie sam przewija.
	const USER_INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

	const stop = () => {
		window.removeEventListener('scrollend', step)
		for (const type of USER_INPUT) window.removeEventListener(type, stop)
	}

	/**
	 * Przewija do bieżącej pozycji celu. Nasłuch `scrollend` tylko wtedy, gdy
	 * przewijanie faktycznie rusza — inaczej zdarzenie nie przyjdzie, a nasłuch
	 * odpaliłby się dopiero przy następnym przewinięciu użytkownika.
	 */
	function step() {
		const top =
			element.getBoundingClientRect().top + window.scrollY - getNavHeight() - extraOffset
		const maxScroll = document.documentElement.scrollHeight - window.innerHeight
		const reachable = Math.min(Math.max(top, 0), maxScroll)

		if (Math.abs(reachable - window.scrollY) < 2 || corrections > MAX_CORRECTIONS) {
			stop()
			return
		}

		corrections += 1
		window.addEventListener('scrollend', step, { once: true })
		window.scrollTo({ top: reachable, behavior })
	}

	for (const type of USER_INPUT) window.addEventListener(type, stop, { once: true, passive: true })
	step()
}

/** Przewija do elementu wskazanego selektorem kotwicy, np. `#kontakt`. */
export function scrollToAnchor(hash: string, extraOffset = 20): boolean {
	const element = document.querySelector<HTMLElement>(hash)
	if (!element) return false

	scrollToElement(element, extraOffset)
	return true
}
