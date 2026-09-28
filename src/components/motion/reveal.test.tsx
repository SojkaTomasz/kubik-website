import { describe, expect, it } from 'vitest'

import { Reveal, RevealGroup } from '@/components/motion/reveal'
import { render, screen } from '@/test/render'

/**
 * Animacje wejścia — zachowanie domyślne, bez ograniczenia ruchu.
 *
 * Sprawdzamy nie tyle sam efekt, ile to, czy treść w ogóle dociera do
 * użytkownika. Animacja startuje z `opacity: 0`, więc każda ścieżka, na której
 * nie dojdzie do jej odpalenia, ukrywa tekst — i to jest jedyny sposób, w jaki
 * ten komponent może zaszkodzić.
 *
 * Wariant z ograniczonym ruchem siedzi w OSOBNYM pliku i to nie jest kwestia
 * porządku: `useReducedMotion` z motion odczytuje ustawienie raz, przy
 * pierwszym wywołaniu, i zapamiętuje wynik na cały czas życia modułu. Zmiana
 * atrapy `matchMedia` w trakcie pliku nie miałaby już żadnego skutku, więc
 * test przechodziłby, sprawdzając nie to, co trzeba.
 */

describe('Reveal', () => {
	it('renderuje przekazaną treść', () => {
		render(<Reveal>Treść wpisu</Reveal>)

		expect(screen.getByText('Treść wpisu')).toBeInTheDocument()
	})

	it('oznacza element atrybutem data-reveal', () => {
		// To zaczepienie dla reguł awaryjnych z app/theme/motion.css. Bez niego
		// brak JavaScriptu zostawiłby treść przezroczystą na zawsze.
		const { container } = render(<Reveal>Treść</Reveal>)

		expect(container.querySelector('[data-reveal]')).toBeInTheDocument()
	})

	it('przepuszcza klasy do elementu', () => {
		const { container } = render(<Reveal className='moja-klasa'>Treść</Reveal>)

		expect(container.querySelector('[data-slot="reveal"]')).toHaveClass('moja-klasa')
	})

	it('przyjmuje każdy kierunek bez wywrotki', () => {
		for (const direction of ['up', 'down', 'left', 'right', 'none'] as const) {
			expect(() => render(<Reveal direction={direction}>Treść</Reveal>)).not.toThrow()
		}
	})
})

describe('RevealGroup', () => {
	it('renderuje każde dziecko', () => {
		render(
			<RevealGroup>
				<span>pierwsze</span>
				<span>drugie</span>
				<span>trzecie</span>
			</RevealGroup>
		)

		for (const label of ['pierwsze', 'drugie', 'trzecie']) {
			expect(screen.getByText(label)).toBeInTheDocument()
		}
	})

	it('opakowuje każde dziecko osobno', () => {
		// Opóźnienie liczone jest z pozycji, więc każde dziecko musi mieć własny
		// Reveal. Jeden wspólny dawałby wszystkim ten sam czas startu.
		const { container } = render(
			<RevealGroup>
				<span>a</span>
				<span>b</span>
			</RevealGroup>
		)

		expect(container.querySelectorAll('[data-slot="reveal"]')).toHaveLength(2)
	})

	it('nie wywraca się na braku dzieci', () => {
		expect(() => render(<RevealGroup />)).not.toThrow()
	})
})
