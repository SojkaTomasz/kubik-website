import { render, screen } from '@/test/render'
import { describe, expect, it } from 'vitest'

import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

/**
 * Container i Section to nasze kompozyty, nie kod z rejestru shadcn.
 *
 * Sprawdzamy dwie rzeczy, które łatwo popsuć przy refaktorze i których nie
 * widać od razu na stronie: poprawność wybranego elementu HTML oraz to,
 * czy Section faktycznie owija treść kontenerem.
 */

describe('Container', () => {
	it('domyślnie renderuje div', () => {
		render(<Container>Treść</Container>)

		expect(screen.getByText('Treść').tagName).toBe('DIV')
	})

	it('pozwala zmienić element, gdy semantyka tego wymaga', () => {
		// Kontener bywa też nagłówkiem strony albo stopką — bez tego propsa
		// trzeba by go zagnieżdżać w dodatkowym elemencie semantycznym.
		render(<Container as='footer'>Stopka</Container>)

		expect(screen.getByText('Stopka').tagName).toBe('FOOTER')
	})

	it('oznacza się atrybutem data-slot do stylowania i testów', () => {
		render(<Container>Treść</Container>)

		expect(screen.getByText('Treść')).toHaveAttribute('data-slot', 'container')
	})

	it('przepuszcza własne className obok klas wariantu', () => {
		render(<Container className='moja-klasa'>Treść</Container>)

		expect(screen.getByText('Treść')).toHaveClass('moja-klasa')
	})
})

describe('Section', () => {
	it('renderuje element section', () => {
		render(<Section>Treść</Section>)

		expect(document.querySelector('section')).toBeInTheDocument()
	})

	it('domyślnie owija treść kontenerem', () => {
		render(<Section>Treść</Section>)

		expect(document.querySelector('[data-slot="container"]')).toBeInTheDocument()
	})

	it('pomija kontener przy contained=false', () => {
		// Potrzebne, gdy sekcja ma tło na pełną szerokość ekranu, a treść
		// w środku sama zarządza swoją szerokością.
		render(<Section contained={false}>Treść</Section>)

		expect(document.querySelector('[data-slot="container"]')).not.toBeInTheDocument()
	})

	it('przyjmuje kotwicę, do której prowadzi nawigacja', () => {
		render(<Section id='kontakt'>Treść</Section>)

		expect(document.querySelector('section')).toHaveAttribute('id', 'kontakt')
	})

	it('przekazuje rozmiar do kontenera', () => {
		render(<Section containerSize='prose'>Treść</Section>)

		expect(document.querySelector('[data-slot="container"]')).toHaveClass('max-w-prose')
	})

	it('renderuje warstwę tła dopiero po podaniu zdjęcia', () => {
		const { rerender } = render(<Section>Treść</Section>)

		expect(document.querySelector('[data-slot="section-background"]')).toBeNull()

		rerender(<Section backgroundImage='/tlo.jpg'>Treść</Section>)

		expect(document.querySelector('[data-slot="section-background"]')).not.toBeNull()
	})

	it('przyciemnienie pojawia się tylko wtedy, gdy je zamówiono', () => {
		// Nakładka bez klasy nie miałaby koloru, więc renderowanie jej „na wszelki
		// wypadek" dokładałoby pustą warstwę nad zdjęciem.
		render(<Section backgroundImage='/tlo.jpg'>Treść</Section>)

		expect(document.querySelector('[data-slot="section-overlay"]')).toBeNull()
	})

	it('odracza układanie dopiero na żądanie', () => {
		/*
		 * Domyślnie WYŁĄCZONE i to jest istota tego propsa: `content-visibility`
		 * tworzy blok zawierający dla `position: fixed`, więc założone wszędzie
		 * przycinałoby sekcje z przyklejonym elementem w środku.
		 */
		const { rerender } = render(<Section>Treść</Section>)

		expect(document.querySelector('section')).not.toHaveClass('content-skip')

		rerender(<Section deferLayout>Treść</Section>)

		expect(document.querySelector('section')).toHaveClass('content-skip')
	})
})
