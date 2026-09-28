/**
 * Data w formie do czytania.
 *
 * Powód istnienia tego pliku jest dostępnościowy. Widoki pokazywały surowe
 * `2026-09-01` — oko czyta to bez trudu, ale synteza mowy wymawia ciąg cyfr
 * z myślnikami („dwa tysiące dwadzieścia sześć minus zero dziewięć…”), bo nie ma
 * skąd wiedzieć, że to data. Sformatowany napis trafia do treści elementu,
 * a wersja maszynowa zostaje w atrybucie `dateTime`.
 */

/**
 * Formatuje datę zapisaną jako `YYYY-MM-DD`.
 *
 * `timeZone: 'UTC'` jest konieczne, nie ostrożnościowe: bez niego `new Date()`
 * czyta datę jako północ UTC i w każdej strefie na zachód od Greenwich pokazuje
 * dzień WCZEŚNIEJSZY. Strona jest prerenderowana, więc strefa serwera budującego
 * decydowałaby o dacie widocznej u wszystkich.
 */
export function formatIsoDate(isoDate: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(
		new Date(isoDate)
	)
}
