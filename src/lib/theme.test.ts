import { describe, expect, it, vi } from 'vitest'

import {
	applyTheme,
	DEFAULT_THEME,
	resolveTheme,
	THEME_STORAGE_KEY,
	THEMES,
	themeScript,
	withoutTransitions,
} from '@/lib/theme'

/** Ustawia atrapę `matchMedia` zwracającą zadaną preferencję systemu. */
function mockSystemPrefersDark(prefersDark: boolean) {
	vi.spyOn(window, 'matchMedia').mockImplementation(
		query => ({ matches: prefersDark, media: query }) as MediaQueryList
	)
}

describe('konfiguracja motywu', () => {
	it('domyślnie śledzi ustawienie systemu', () => {
		// Narzucanie własnego motywu przy pierwszej wizycie ignoruje wybór,
		// którego użytkownik dokonał już na poziomie systemu.
		expect(DEFAULT_THEME).toBe('system')
	})

	it('udostępnia trzy opcje', () => {
		expect(THEMES).toEqual(['light', 'dark', 'system'])
	})
})

describe('resolveTheme', () => {
	it('zwraca motyw wprost, gdy użytkownik go wymusił', () => {
		mockSystemPrefersDark(true)

		expect(resolveTheme('light')).toBe('light')
		expect(resolveTheme('dark')).toBe('dark')
	})

	it('rozwija system do ciemnego, gdy tak ustawiony jest system', () => {
		mockSystemPrefersDark(true)

		expect(resolveTheme('system')).toBe('dark')
	})

	it('rozwija system do jasnego w pozostałych przypadkach', () => {
		mockSystemPrefersDark(false)

		expect(resolveTheme('system')).toBe('light')
	})
})

describe('applyTheme', () => {
	it('dodaje klasę dark i ustawia colorScheme', () => {
		applyTheme('dark')

		expect(document.documentElement).toHaveClass('dark')
		// colorScheme mówi przeglądarce, jak malować kontrolki systemowe:
		// paski przewijania, pola formularza, natywne listy wyboru.
		expect(document.documentElement.style.colorScheme).toBe('dark')
	})

	it('zdejmuje klasę dark przy powrocie do jasnego', () => {
		applyTheme('dark')
		applyTheme('light')

		expect(document.documentElement).not.toHaveClass('dark')
		expect(document.documentElement.style.colorScheme).toBe('light')
	})
})

describe('withoutTransitions', () => {
	it('wykonuje przekazaną zmianę', () => {
		const change = vi.fn()

		withoutTransitions(change)

		expect(change).toHaveBeenCalledOnce()
	})

	it('sprząta po sobie styl blokujący animacje', () => {
		const before = document.head.querySelectorAll('style').length

		withoutTransitions(() => {})

		// Zostawiony styl wyłączyłby animacje na stronie na stałe.
		expect(document.head.querySelectorAll('style')).toHaveLength(before)
	})

	it('blokuje animacje w trakcie zmiany', () => {
		let ruleDuringChange = ''

		withoutTransitions(() => {
			ruleDuringChange = [...document.head.querySelectorAll('style')]
				.map(style => style.textContent)
				.join('')
		})

		expect(ruleDuringChange).toContain('transition:none!important')
	})
})

describe('skrypt startowy', () => {
	it('odwołuje się do właściwego klucza w localStorage', () => {
		// Rozjazd między skryptem a resztą aplikacji dawałby błysk złego motywu
		// przy każdym wejściu — skrypt czytałby pusto i zakładał jasny.
		expect(themeScript).toContain(JSON.stringify(THEME_STORAGE_KEY))
	})

	it('uwzględnia preferencję systemu', () => {
		expect(themeScript).toContain('prefers-color-scheme: dark')
	})

	it('ustawia klasę i colorScheme', () => {
		expect(themeScript).toContain('classList.toggle')
		expect(themeScript).toContain('colorScheme')
	})

	it('jest odporny na zablokowany localStorage', () => {
		// W trybie prywatnym Safari odczyt rzuca wyjątkiem. Bez try/catch
		// wywaliłby się cały skrypt i strona zostałaby bez motywu.
		expect(themeScript).toContain('try')
		expect(themeScript).toContain('catch')
	})

	it('jest samowywołującym się wyrażeniem gotowym do osadzenia', () => {
		expect(themeScript.trim().startsWith('(')).toBe(true)
		expect(themeScript.trim().endsWith(')')).toBe(true)
	})

	it('faktycznie działa po wykonaniu', () => {
		mockSystemPrefersDark(true)
		window.localStorage.setItem(THEME_STORAGE_KEY, 'system')

		// Uruchamiamy dokładnie ten kod, który trafia do <head>.

		eval(themeScript)

		expect(document.documentElement).toHaveClass('dark')
	})
})
