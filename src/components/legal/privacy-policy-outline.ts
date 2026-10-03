import padStart from 'lodash/padStart'

/*
 * Szkielet polityki — kolejność sekcji, kotwice i numery. Osobny, lekki moduł:
 * spis treści jest kliencki i nie powinien wciągać do przeglądarki całej treści.
 */

/** Kolejność sekcji — wspólna dla treści i spisu treści, który do nich prowadzi. */
export const SECTIONS = [
	'administrator',
	'data',
	'purposes',
	'retention',
	'recipients',
	'cookies',
	'rights',
] as const

export type SectionKey = (typeof SECTIONS)[number]

/** Kotwica sekcji — `polityka-prywatnosci#cookies` da się podlinkować z banera czy maila. */
export const sectionAnchor = (key: SectionKey) => `privacy-${key}`

/** „01", „02"… — numer sekcji w nagłówku i w spisie treści. */
export const sectionNumber = (index: number) => padStart(String(index + 1), 2, '0')
