import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useIsOpen } from '@/hooks/use-is-open'

describe('useIsOpen', () => {
	it('startuje zamknięty, chyba że powiedziano inaczej', () => {
		expect(renderHook(() => useIsOpen()).result.current.isOpen).toBe(false)
		expect(renderHook(() => useIsOpen(true)).result.current.isOpen).toBe(true)
	})

	it('otwiera, zamyka i przełącza', () => {
		const { result } = renderHook(() => useIsOpen())

		act(() => result.current.handleOpen())
		expect(result.current.isOpen).toBe(true)

		act(() => result.current.handleClose())
		expect(result.current.isOpen).toBe(false)

		act(() => result.current.handleToggle())
		expect(result.current.isOpen).toBe(true)
	})

	it('handleOpenChange przenosi decyzję okna, zamiast ją zgadywać', () => {
		/*
		 * Escape i kliknięcie w tło idą WYŁĄCZNIE przez `onOpenChange`. Handler
		 * ignorujący argument (`() => handleClose()`) wygląda na działający
		 * i rozjeżdża stan przy każdym otwarciu spoza przycisku.
		 */
		const { result } = renderHook(() => useIsOpen())

		act(() => result.current.handleOpenChange(true))
		expect(result.current.isOpen).toBe(true)

		act(() => result.current.handleOpenChange(false))
		expect(result.current.isOpen).toBe(false)
	})

	it('otwiera z wartością i oddaje ją oknu', () => {
		const { result } = renderHook(() => useIsOpen<{ id: number }>())

		act(() => result.current.handleOpenWithTransportedValue({ id: 7 }))

		expect(result.current.isOpen).toBe(true)
		expect(result.current.transportedValue).toEqual({ id: 7 })
	})

	it('czyści przeniesioną wartość przy zamknięciu', () => {
		/*
		 * Bez tego wartość z poprzedniego otwarcia zostaje w stanie i mignie
		 * w oknie otwartym dla czegoś innego — okno „Usuń adres" pokazałoby przez
		 * klatkę poprzedni adres. Nic tego nie zgłasza, bo dane SĄ, tylko nie te.
		 */
		const { result } = renderHook(() => useIsOpen<{ id: number }>())

		act(() => result.current.handleOpenWithTransportedValue({ id: 7 }))
		act(() => result.current.handleOpenChange(false))

		expect(result.current.transportedValue).toBeNull()
	})
})

/**
 * Strażnik konwencji: moduł `*-dialog.tsx` poza `components/ui` wchodzi do drzewa
 * wyłącznie przez `import()`. Łamie się CICHO — statyczny import nie daje ani
 * błędu, ani ostrzeżenia lintu, tylko większy bundle.
 */
describe('konwencja: okna ładowane leniwie', () => {
	const SRC = join(process.cwd(), 'src')

	function sourceFiles(dir: string): string[] {
		return readdirSync(dir).flatMap(entry => {
			const path = join(dir, entry)
			if (statSync(path).isDirectory()) return sourceFiles(path)
			return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [path] : []
		})
	}

	/**
	 * Moduły okien, zapisane tak, jak wyglądają w imporcie: `@/components/…`.
	 *
	 * Lista jest WYPROWADZANA z drzewa plików, nie wypisana ręcznie — nowe okno
	 * wchodzi pod strażnika samo, bez pamiętania o dopisaniu go tutaj.
	 */
	const dialogModules = sourceFiles(SRC)
		.filter(file => /-dialog\.tsx$/.test(file))
		.map(file =>
			relative(SRC, file)
				.replaceAll('\\', '/')
				.replace(/\.tsx$/, '')
		)
		.filter(module => !module.startsWith('components/ui/'))
		.map(module => `@/${module}`)

	it('istnieje przynajmniej jedno okno, więc test ma czego pilnować', () => {
		// Bez tego skasowanie wszystkich okien zamieniłoby strażnika w test
		// przechodzący zawsze i niesprawdzający niczego.
		expect(dialogModules.length).toBeGreaterThan(0)
	})

	it('żaden moduł okna nie jest importowany statycznie', () => {
		const offenders = sourceFiles(SRC).flatMap(file => {
			const source = readFileSync(file, 'utf8')

			return dialogModules
				.filter(module => new RegExp(`\\sfrom\\s+'${module}'`).test(source))
				.map(module => `${relative(process.cwd(), file)} → ${module}`)
		})

		expect(
			offenders,
			'Okno zaimportowane statycznie ląduje w bundlu strony, choć otwiera je ułamek ' +
				'odwiedzających. Użyj `next/dynamic` i `useIsOpen` — wzorzec w ' +
				'`components/cookie/cookie-consent.tsx`, uzasadnienie i pomiary w AGENTS.md.'
		).toEqual([])
	})
})
