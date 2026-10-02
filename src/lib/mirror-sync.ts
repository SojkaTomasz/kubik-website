import find from 'lodash/find'
import startsWith from 'lodash/startsWith'

/**
 * Logika lustra przewijania i kliknięć między urządzeniami (`pnpm dev:mobile`) —
 * osobno od komponentu, żeby dało się ją sprawdzić testem jednostkowym.
 *
 * Kliknięcie przenosimy SEMANTYCZNIE, nie po współrzędnych: układ desktopu
 * i telefonu jest inny (menu za przyciskiem, kolumny pod sobą), więc ten sam
 * punkt ekranu prawie nigdy nie trafia w ten sam element. Link przenosimy
 * jako adres (nawigacja routerem), resztę — jako znacznik + `aria-label`
 * albo tekst, wyszukiwane na drugim urządzeniu.
 */

export type ClickSignature =
	| { kind: 'nav'; href: string }
	| { kind: 'action'; tag: string; ariaLabel: string | null; text: string | null }

export type MirrorMessage =
	{ type: 'scroll'; ratio: number } | { type: 'click'; signature: ClickSignature }

/** Elementy, których kliknięcie jest „akcją" wartą powtórzenia. */
export const ACTIONABLE_SELECTOR = 'a[href], button, [role="button"], summary'

/** Domyślny port serwera przekaźnika — taki sam w `scripts/dev-mobile.mjs`. */
export const DEFAULT_MIRROR_PORT = 4001

/** Tekst porównywany między urządzeniami — przycięty, bo długie bloki różnią się białymi znakami. */
function comparableText(element: Element): string | null {
	return element.textContent?.trim().slice(0, 80) || null
}

/** Podpis kliknięcia z najbliższego klikalnego przodka celu. `null` — nic do powtórzenia. */
export function getClickSignature(target: Element): ClickSignature | null {
	const element = target.closest(ACTIONABLE_SELECTOR)
	if (!element) return null

	const href = element.getAttribute('href') ?? ''
	// Tylko adresy wewnętrzne — zewnętrzny link otworzyłby na drugim urządzeniu obcą stronę.
	if (element.tagName === 'A' && startsWith(href, '/')) return { kind: 'nav', href }

	const text = comparableText(element)
	const ariaLabel = element.getAttribute('aria-label')
	if (!text && !ariaLabel) return null

	return { kind: 'action', tag: element.tagName, ariaLabel, text }
}

/** Element odpowiadający podpisowi na tym urządzeniu: najpierw `aria-label`, potem tekst. */
export function findActionTarget(
	signature: Extract<ClickSignature, { kind: 'action' }>,
	candidates: HTMLElement[]
): HTMLElement | undefined {
	return find(candidates, element => {
		if (element.tagName !== signature.tag) return false
		if (signature.ariaLabel) return element.getAttribute('aria-label') === signature.ariaLabel
		return comparableText(element) === signature.text
	})
}

/** Pozycja przewinięcia jako część przewijalnej wysokości — strony mają różną wysokość na różnych ekranach. */
export function scrollRatio(
	scrollY: number,
	documentHeight: number,
	viewportHeight: number
): number {
	const max = documentHeight - viewportHeight
	return max > 0 ? scrollY / max : 0
}
