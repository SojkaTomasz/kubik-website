import type { ConsentCategories } from '@/lib/analytics/consent'

/**
 * STRUKTURA kategorii — kolejność i to, która jest niezbędna. Etykiety i opisy
 * leżą w `messages/*.json`.
 *
 * ► Dopasuj opisy do tego, co faktycznie robi Twój kontener GTM, zanim
 *   wypuścisz stronę: RODO wymaga, żeby użytkownik wiedział, na co się zgadza.
 */

export interface CookieCategoryInfo {
	key: keyof ConsentCategories
	/** Kategoria niezbędna — przełącznik jest zablokowany we włączonej pozycji. */
	required?: boolean
}

export const cookieCategories: CookieCategoryInfo[] = [
	{ key: 'necessary', required: true },
	{ key: 'analytics' },
	{ key: 'marketing' },
	{ key: 'preferences' },
]
