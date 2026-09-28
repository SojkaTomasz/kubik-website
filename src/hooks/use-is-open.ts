'use client'

import { useCallback, useState } from 'react'

/**
 * Stan otwarcia okna modalnego. Używa się go razem z leniwym ładowaniem —
 * konwencja w AGENTS.md („Okna modalne"), wzorzec w `cookie-consent.tsx`:
 *
 * ```tsx
 * const ThingDialog = dynamic(() => import('…').then(m => m.ThingDialog))
 * const thing = useIsOpen()
 *
 * <Button onClick={thing.handleOpen}>Otwórz</Button>
 * {thing.isOpen && <ThingDialog open={thing.isOpen} onOpenChange={thing.handleOpenChange} />}
 * ```
 *
 * `transportedValue` obsługuje okna otwierane „dla czegoś" — wiersza tabeli,
 * pozycji listy.
 */
export function useIsOpen<T = unknown>(initialState = false) {
	const [isOpen, setIsOpen] = useState(initialState)
	const [transportedValue, setTransportedValue] = useState<T | null>(null)

	const handleOpen = useCallback(() => {
		setIsOpen(true)
	}, [])

	const handleClose = useCallback(() => {
		setIsOpen(false)
	}, [])

	const handleToggle = useCallback(() => {
		setIsOpen(prev => !prev)
	}, [])

	/**
	 * Handler pod `onOpenChange` — Escape i kliknięcie w tło idą WYŁĄCZNIE tą
	 * drogą, a funkcja ignorująca argument rozjeżdża stan po cichu. Czyści przy
	 * okazji `transportedValue`, żeby nie mignął w kolejnym otwarciu.
	 */
	const handleOpenChange = useCallback((open: boolean) => {
		setIsOpen(open)
		if (!open) setTransportedValue(null)
	}, [])

	const handleOpenWithTransportedValue = useCallback((value: T) => {
		setIsOpen(true)
		setTransportedValue(value)
	}, [])

	return {
		isOpen,
		handleOpen,
		handleClose,
		handleToggle,
		handleOpenChange,
		transportedValue,
		handleOpenWithTransportedValue,
	}
}
