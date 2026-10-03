'use client'

import { useEffect } from 'react'

/** Ile pikseli przewinięcia wystarczy, żeby nagłówek przykleił się do góry. */
const DOCK_AFTER = 8

/**
 * Stan „zadokowanego" nagłówka — atrybut `data-header-docked` na `<html>`.
 * Cały wygląd i animacja siedzą w klasach `in-data-[header-docked]:` nagłówka,
 * tu jest tylko odczyt pozycji przewinięcia. Bez JS-a nagłówek zostaje
 * pływającą kartą, czyli w stanie z projektu.
 *
 * Atrybut na `<html>`, nie stan Reacta: przełączenie nie renderuje nagłówka
 * od nowa, zmienia się tylko CSS. Zmiana jest czysto wizualna (przezroczystość
 * i przesunięcie), więc nie przesuwa układu strony — bez CLS.
 */
export function HeaderDock() {
	useEffect(() => {
		const root = document.documentElement
		let frame = 0

		const update = () => {
			frame = 0
			const docked = window.scrollY > DOCK_AFTER
			// Zapis tylko przy zmianie — przewijanie odpala zdarzenie co klatkę.
			if (docked !== (root.dataset.headerDocked === 'true')) {
				if (docked) root.dataset.headerDocked = 'true'
				else delete root.dataset.headerDocked
			}
		}

		const handleScroll = () => {
			if (!frame) frame = requestAnimationFrame(update)
		}

		// Odświeżenie w połowie strony: przeglądarka przywraca pozycję przed nami.
		update()
		window.addEventListener('scroll', handleScroll, { passive: true })

		return () => {
			window.removeEventListener('scroll', handleScroll)
			if (frame) cancelAnimationFrame(frame)
			delete root.dataset.headerDocked
		}
	}, [])

	return null
}
