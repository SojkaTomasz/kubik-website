'use client'

import {
	createContext,
	use,
	useCallback,
	useLayoutEffect,
	useMemo,
	useSyncExternalStore,
} from 'react'

import {
	applyTheme,
	DEFAULT_THEME,
	type ResolvedTheme,
	type Theme,
	THEME_STORAGE_KEY,
	withoutTransitions,
} from '@/lib/theme'

/**
 * Motyw jasny/ciemny bez `next-themes`: tamten renderuje skrypt startowy wewnątrz
 * drzewa Reacta, co zostawia w konsoli stałe ostrzeżenie React 19. Nasz idzie
 * przez `InlineScript`. Stan przez `useSyncExternalStore`, bo motyw mieszka
 * poza Reactem.
 */

interface ThemeContextValue {
	/** Wybór użytkownika: 'light', 'dark' albo 'system'. */
	theme: Theme
	/** Motyw faktycznie nałożony na `<html>` — 'system' jest już rozwinięty. */
	resolvedTheme: ResolvedTheme
	setTheme: (theme: Theme) => void
	/**
	 * `false` do zakończenia hydracji.
	 *
	 * Serwer nie zna wyboru użytkownika, więc pierwszy render ma wartość
	 * domyślną. Treść zależną od motywu renderuj dopiero przy `mounted` — albo,
	 * lepiej, wariantem CSS `dark:`, który działa od pierwszej klatki.
	 */
	mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredTheme(): Theme {
	try {
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
		return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : DEFAULT_THEME
	} catch {
		return DEFAULT_THEME
	}
}

/* ------------------------------------------------- store: wybór motywu --- */

const themeListeners = new Set<() => void>()

/** Podręczna kopia — `getSnapshot` musi zwracać stabilną wartość między renderami. */
let themeSnapshot: Theme | undefined

function notifyThemeChanged(): void {
	themeSnapshot = readStoredTheme()
	for (const listener of themeListeners) listener()
}

function subscribeToTheme(listener: () => void): () => void {
	themeListeners.add(listener)

	// Zmiana w innej karcie tej samej domeny — wybór ma obowiązywać wszędzie.
	const onStorage = (event: StorageEvent) => {
		if (event.key !== THEME_STORAGE_KEY) return

		notifyThemeChanged()
		applyTheme(resolveWith(readStoredTheme(), prefersDark()))
	}

	window.addEventListener('storage', onStorage)

	return () => {
		themeListeners.delete(listener)
		window.removeEventListener('storage', onStorage)
	}
}

function getThemeSnapshot(): Theme {
	themeSnapshot ??= readStoredTheme()
	return themeSnapshot
}

/* -------------------------------------------- store: ustawienie systemu --- */

function prefersDark(): boolean {
	return window.matchMedia(DARK_QUERY).matches
}

function subscribeToSystem(listener: () => void): () => void {
	const media = window.matchMedia(DARK_QUERY)

	const onChange = () => {
		listener()

		// Zmiana motywu systemu ma być widoczna od razu, ale tylko wtedy, gdy
		// użytkownik nie wymusił konkretnego motywu.
		if (getThemeSnapshot() === 'system') {
			applyTheme(media.matches ? 'dark' : 'light')
		}
	}

	media.addEventListener('change', onChange)
	return () => media.removeEventListener('change', onChange)
}

function getSystemSnapshot(): ResolvedTheme {
	return prefersDark() ? 'dark' : 'light'
}

/* ---------------------------------------------------------------- utils --- */

function resolveWith(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
	if (theme !== 'system') return theme
	return systemPrefersDark ? 'dark' : 'light'
}

function noopSubscribe(): () => void {
	return () => {}
}

/* ------------------------------------------------------------- provider --- */

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => DEFAULT_THEME)
	const systemTheme = useSyncExternalStore(subscribeToSystem, getSystemSnapshot, () => 'light')
	const mounted = useSyncExternalStore(
		noopSubscribe,
		() => true,
		() => false
	)

	// Strict Mode remontuje drzewo i kasuje z `<html>` klasę ustawioną przez
	// skrypt startowy. Na produkcji efekt jest pustą operacją.
	// `useLayoutEffect`, bo poprawka ma trafić przed malowaniem.
	useLayoutEffect(() => {
		applyTheme(resolveWith(getThemeSnapshot(), prefersDark()))
	}, [])

	const setTheme = useCallback((next: Theme) => {
		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, next)
		} catch {
			// Tryb prywatny — wybór obowiązuje do końca sesji.
		}

		themeSnapshot = next
		for (const listener of themeListeners) listener()

		withoutTransitions(() => applyTheme(resolveWith(next, prefersDark())))
	}, [])

	const value = useMemo<ThemeContextValue>(
		() => ({
			theme,
			resolvedTheme: resolveWith(theme, systemTheme === 'dark'),
			setTheme,
			mounted,
		}),
		[theme, systemTheme, setTheme, mounted]
	)

	return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
	const context = use(ThemeContext)

	if (!context) {
		throw new Error('useTheme musi być wywołane wewnątrz <ThemeProvider>.')
	}

	return context
}
