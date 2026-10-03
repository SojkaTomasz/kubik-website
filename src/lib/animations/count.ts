/**
 * Licznik animowany od zera — rozbiór napisu typu „1200+", „5,0", „15 000 m²" na
 * część stałą i liczbę, oraz złożenie go z powrotem dla dowolnej wartości pośredniej.
 *
 * Serwer renderuje WARTOŚĆ KOŃCOWĄ (robot i czytnik ekranu widzą prawdziwą liczbę),
 * a licznik podmienia tekst dopiero w przeglądarce. Dlatego format pośredni musi być
 * dokładnie taki sam jak końcowy: ten sam przecinek, te same spacje tysięcy.
 */

export interface CountParts {
	prefix: string
	value: number
	suffix: string
	decimals: number
	/** Znak dziesiętny z oryginału — „5,0" zostaje z przecinkiem. */
	decimalMark: string
	/** Separator tysięcy z oryginału — spacja, twarda spacja albo brak. */
	groupMark: string
}

/** Spacja albo twarda spacja — tak w polskim zapisie rozdziela się tysiące. */
const GROUP = '[ \\u00A0]'
const GROUP_PATTERN = new RegExp(GROUP, 'gu')
const COUNT_PATTERN = new RegExp(
	`^(\\D*?)(\\d{1,3}(?:${GROUP}\\d{3})+|\\d+)(?:([.,])(\\d+))?(.*)$`,
	'su'
)

export function parseCount(text: string): CountParts | null {
	const match = COUNT_PATTERN.exec(text.trim())
	if (!match) return null

	const [, prefix = '', integer = '', decimalMark = '', fraction = '', suffix = ''] = match
	const groupMark = integer.match(GROUP_PATTERN)?.[0] ?? ''
	const value = Number(`${integer.replaceAll(GROUP_PATTERN, '')}.${fraction || '0'}`)

	return { prefix, value, suffix, decimals: fraction.length, decimalMark, groupMark }
}

export function formatCount(parts: CountParts, value: number): string {
	const [integer = '0', fraction] = value.toFixed(parts.decimals).split('.')
	const grouped = parts.groupMark
		? integer.replaceAll(/\B(?=(\d{3})+(?!\d))/g, parts.groupMark)
		: integer

	return `${parts.prefix}${grouped}${fraction ? parts.decimalMark + fraction : ''}${parts.suffix}`
}
