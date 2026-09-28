import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Reveal, RevealGroup } from '@/components/motion/reveal'
import { render, screen } from '@/test/render'

/**
 * Markup `Reveal` NIE MOŻE zależeć od ustawienia „ograniczony ruch" — serwer nie
 * zna ustawienia systemowego, więc rozgałęzienie daje niezgodność hydracji
 * widoczną WYŁĄCZNIE w przebiegu deweloperskim.
 *
 * Osobny plik, bo odczyt preferencji jest zapamiętywany przy pierwszym wywołaniu
 * i trzymany przez całe życie modułu — w jednym pliku z resztą testów byłby już
 * zapamiętany jako „brak ograniczenia".
 */

beforeEach(() => {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		configurable: true,
		value: vi.fn((query: string) => ({
			matches: query.includes('prefers-reduced-motion'),
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	})
})

describe('Reveal przy ograniczonym ruchu', () => {
	it('zachowuje data-reveal, bo to zaczep reguł awaryjnych', () => {
		// NAJWAŻNIEJSZA asercja, celowo odwrotna do intuicji: to właśnie „goły"
		// element rozjeżdżał serwer z klientem, a bez atrybutu reguły
		// z `motion.css` nie mają czego złapać.
		const { container } = render(<Reveal>Treść</Reveal>)

		expect(container.querySelector('[data-reveal]')).not.toBeNull()
		expect(container.querySelector('[data-slot="reveal"]')).toBeInTheDocument()
	})

	it('renderuje ten sam element co bez ograniczenia ruchu', () => {
		// Zestaw atrybutów jest tym, co React porównuje przy hydracji. Różnica
		// choćby w jednym z nich wystarczy, żeby porzucił całe poddrzewo.
		const { container } = render(<Reveal direction='left'>Treść</Reveal>)
		const element = container.querySelector<HTMLElement>('[data-slot="reveal"]')

		expect(element?.tagName).toBe('DIV')
		expect(element?.hasAttribute('data-reveal')).toBe(true)
	})

	it('treść jest w dokumencie', () => {
		render(<Reveal>Treść</Reveal>)

		expect(screen.getByText('Treść')).toBeInTheDocument()
	})

	it('zachowuje klasy', () => {
		const { container } = render(<Reveal className='moja-klasa'>Treść</Reveal>)

		expect(container.querySelector('[data-slot="reveal"]')).toHaveClass('moja-klasa')
	})

	it('grupa renderuje komplet dzieci', () => {
		render(
			<RevealGroup>
				<span>pierwsze</span>
				<span>drugie</span>
			</RevealGroup>
		)

		expect(screen.getByText('pierwsze')).toBeInTheDocument()
		expect(screen.getByText('drugie')).toBeInTheDocument()
	})
})
