/** Motyw jasny/ciemny. Bez `'use client'` — skrypt musi być dostępny dla `<head>`. */

export const THEME_STORAGE_KEY = 'theme'

/** `system` śledzi ustawienie systemu operacyjnego. */
export type Theme = 'light' | 'dark' | 'system'

/** Motyw po rozwinięciu `system` — to on trafia na `<html>`. */
export type ResolvedTheme = 'light' | 'dark'

export const THEMES: Theme[] = ['light', 'dark', 'system']

export const DEFAULT_THEME: Theme = 'system'

/**
 * Synchronicznie w `<head>`, zanim przeglądarka cokolwiek narysuje — inaczej
 * błysk białego tła. Zapisany jako funkcja dla typów, do HTML-a idzie
 * przez `.toString()`.
 */
function applyThemeOnLoad(storageKey: string, defaultTheme: string) {
	try {
		const stored = window.localStorage.getItem(storageKey) ?? defaultTheme
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		const resolved = stored === 'system' ? (prefersDark ? 'dark' : 'light') : stored

		const root = document.documentElement
		root.classList.toggle('dark', resolved === 'dark')
		// Informuje przeglądarkę, jak malować kontrolki systemowe: paski
		// przewijania, pola formularza, natywne listy wyboru.
		root.style.colorScheme = resolved
	} catch {
		// Tryb prywatny albo zablokowany localStorage — zostaje motyw jasny.
	}
}

export const themeScript = `(${applyThemeOnLoad.toString()})(${JSON.stringify(
	THEME_STORAGE_KEY
)},${JSON.stringify(DEFAULT_THEME)})`

/** Rozwija `system` do konkretnego motywu na podstawie ustawień przeglądarki. */
export function resolveTheme(theme: Theme): ResolvedTheme {
	if (theme !== 'system') return theme
	if (typeof window === 'undefined') return 'light'

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Nakłada motyw na `<html>`. Jedyne miejsce, które dotyka DOM-u poza skryptem startowym. */
export function applyTheme(resolved: ResolvedTheme): void {
	const root = document.documentElement
	root.classList.toggle('dark', resolved === 'dark')
	root.style.colorScheme = resolved
}

/**
 * Wyłącza animacje na czas przełączenia motywu — inaczej każdy
 * `transition-colors` przechodzi z własnym opóźnieniem. Odczyt `offsetHeight`
 * wymusza zastosowanie reguły przed zmianą klasy.
 */
export function withoutTransitions(change: () => void): void {
	const style = document.createElement('style')
	style.append(
		document.createTextNode(
			'*,*::before,*::after{transition:none!important;animation:none!important}'
		)
	)
	document.head.append(style)

	change()

	void document.body.offsetHeight
	style.remove()
}
