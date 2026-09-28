import { render, screen } from '@/test/render'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/ui/button'
import { iconEffectClasses } from '@/components/ui/button.variants'

/**
 * Testy pilnują tego, co ta warstwa rozstrzyga: JAKI element powstaje i JAKIE
 * dostaje atrybuty. Wygląd pomijamy — weryfikuje go oko na stronie /dev.
 */

describe('wybór elementu na podstawie href', () => {
	it('bez href renderuje przycisk', () => {
		render(<Button>Zapisz</Button>)

		expect(screen.getByRole('button', { name: 'Zapisz' })).toBeInTheDocument()
	})

	it('adres wewnętrzny renderuje link', () => {
		render(<Button href='/kontakt'>Kontakt</Button>)

		expect(screen.getByRole('link', { name: 'Kontakt' })).toHaveAttribute('href', '/kontakt')
	})

	it('adres zewnętrzny otwiera się w nowej karcie z zabezpieczeniem rel', () => {
		render(<Button href='https://example.org'>Zewnętrzny</Button>)

		const link = screen.getByRole('link', { name: /Zewnętrzny/ })

		expect(link).toHaveAttribute('target', '_blank')
		// Bez rel="noopener" otwarta strona dostaje uchwyt do naszego okna
		// przez window.opener i może je przekierować.
		expect(link).toHaveAttribute('rel', 'noopener noreferrer')
	})

	it('mailto i tel dostają rel zewnętrzny, ale NIE nową kartę', () => {
		render(
			<>
				<Button href='mailto:kontakt@example.com'>Napisz</Button>
				<Button href='tel:+48123456789'>Zadzwoń</Button>
			</>
		)

		// Adres przejmuje program pocztowy albo dialer, a otwarta dla nich karta
		// zostaje pusta — i zapowiedź „otwiera się w nowej karcie" byłaby wtedy
		// kłamstwem wobec osoby korzystającej z czytnika ekranu.
		expect(screen.getByRole('link', { name: 'Napisz' })).not.toHaveAttribute('target')
		expect(screen.getByRole('link', { name: 'Zadzwoń' })).not.toHaveAttribute('target')
	})

	it('props external wymusza zachowanie zewnętrzne wbrew heurystyce', () => {
		render(
			<Button
				href='/pliki/oferta.pdf'
				external
			>
				Pobierz PDF
			</Button>
		)

		expect(screen.getByRole('link', { name: /Pobierz PDF/ })).toHaveAttribute('target', '_blank')
	})

	/*
	 * Zapowiedź nowej karty.
	 *
	 * Nowa karta bez ostrzeżenia to zmiana kontekstu bez ostrzeżenia (WCAG 3.2.5):
	 * osoba widząca zauważy ją sama, czytnik ekranu nie powie o niej nic. Napis
	 * jest `sr-only`, więc łamie się CAŁKOWICIE cicho — na ekranie nie ma go
	 * widać ani wtedy, gdy jest, ani wtedy, gdy zniknie.
	 */
	it('link do nowej karty zapowiada to czytnikowi ekranu', () => {
		render(<Button href='https://example.org'>Zewnętrzny</Button>)

		expect(screen.getByRole('link', { name: /otwiera się w nowej karcie/ })).toBeInTheDocument()
	})

	it('announceNewTab wyłącza zapowiedź, gdy tekst przycisku już ją niesie', () => {
		render(
			<Button
				href='https://example.org'
				announceNewTab={false}
			>
				Otwórz w nowej karcie
			</Button>
		)

		expect(screen.getByRole('link', { name: 'Otwórz w nowej karcie' })).toBeInTheDocument()
	})

	it('link wewnętrzny nie zapowiada nowej karty', () => {
		render(<Button href='/kontakt'>Kontakt</Button>)

		expect(screen.getByRole('link', { name: 'Kontakt' })).toBeInTheDocument()
	})

	it('kotwica nie otwiera nowej karty', () => {
		render(<Button href='#kontakt'>Do kontaktu</Button>)

		const link = screen.getByRole('link', { name: 'Do kontaktu' })

		expect(link).toHaveAttribute('href', '#kontakt')
		expect(link).not.toHaveAttribute('target')
	})

	it('kotwica przewija sama i blokuje domyślny skok przeglądarki', async () => {
		const section = document.createElement('section')
		section.id = 'kontakt'
		document.body.append(section)

		const scrollTo = vi.fn()
		vi.stubGlobal('scrollTo', scrollTo)

		render(<Button href='#kontakt'>Do kontaktu</Button>)
		await userEvent.click(screen.getByRole('link', { name: 'Do kontaktu' }))

		// Własne przewijanie omija nagłówek przyklejony do góry strony
		// i nie dopisuje kotwicy do historii przeglądarki.
		expect(scrollTo).toHaveBeenCalled()
	})

	it('kotwica wskazująca nieistniejący element nie wywraca aplikacji', async () => {
		render(<Button href='#nie-ma-takiej-sekcji'>Nigdzie</Button>)

		await expect(
			userEvent.click(screen.getByRole('link', { name: 'Nigdzie' }))
		).resolves.not.toThrow()
	})
})

describe('ikona', () => {
	it('renderuje ikonę przed tekstem domyślnie', () => {
		render(<Button icon={<span data-testid='icon' />}>Pobierz</Button>)

		expect(screen.getByTestId('icon').closest('[data-icon]')).toHaveAttribute(
			'data-icon',
			'inline-start'
		)
	})

	it('renderuje ikonę po tekście przy iconPosition="right"', () => {
		render(
			<Button
				icon={<span data-testid='icon' />}
				iconPosition='right'
			>
				Dalej
			</Button>
		)

		expect(screen.getByTestId('icon').closest('[data-icon]')).toHaveAttribute(
			'data-icon',
			'inline-end'
		)
	})

	it('animacja wybranego efektu ląduje na opakowaniu ikony', () => {
		// Klasy z `iconEffectClasses`, nie literałem: literał pękałby przy zmianie
		// odległości przesunięcia, choć mechanizm działałby dalej.
		render(
			<Button
				icon={<span data-testid='icon' />}
				iconEffect='shiftRight'
			>
				Dalej
			</Button>
		)

		const wrapper = screen.getByTestId('icon').closest('[data-icon]')

		for (const token of iconEffectClasses.shiftRight.split(' ')) {
			expect(wrapper).toHaveClass(token)
		}
	})

	it('efekt "none" nie dokłada żadnych klas animacji', () => {
		// Zabezpieczenie przed testem, który przechodzi na pustej liście klas.
		render(<Button icon={<span data-testid='icon' />}>Dalej</Button>)

		const wrapper = screen.getByTestId('icon').closest('[data-icon]')

		for (const token of iconEffectClasses.shiftRight.split(' ')) {
			expect(wrapper).not.toHaveClass(token)
		}
	})

	it('bez podanej ikony nie tworzy pustego opakowania', () => {
		render(<Button>Zapisz</Button>)

		expect(document.querySelectorAll('[data-icon]')).toHaveLength(0)
	})
})

describe('stan ładowania', () => {
	it('blokuje przycisk i ogłasza zajętość czytnikom ekranu', () => {
		render(<Button isLoading>Wysyłanie</Button>)

		const button = screen.getByRole('button', { name: /Wysyłanie/ })

		expect(button).toBeDisabled()
		expect(button).toHaveAttribute('aria-busy', 'true')
	})

	it('zachowuje tekst, żeby szerokość przycisku nie skakała', () => {
		render(<Button isLoading>Wysyłanie</Button>)

		expect(screen.getByRole('button')).toHaveTextContent('Wysyłanie')
	})

	it('podmienia podaną ikonę na wskaźnik ładowania', () => {
		render(
			<Button
				icon={<span data-testid='icon' />}
				isLoading
			>
				Wyślij
			</Button>
		)

		// Ikona docelowa znika — jej miejsce zajmuje spinner, więc układ
		// przycisku pozostaje ten sam.
		expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
		expect(document.querySelector('[data-icon="inline-start"]')).toBeInTheDocument()
	})

	it('dokłada wskaźnik nawet wtedy, gdy przycisk nie ma ikony', () => {
		render(<Button isLoading>Zapisywanie</Button>)

		expect(document.querySelector('[data-icon="inline-start"]')).toBeInTheDocument()
	})

	it('nie wywołuje onClick w trakcie ładowania', async () => {
		const onClick = vi.fn()
		render(
			<Button
				isLoading
				onClick={onClick}
			>
				Wyślij
			</Button>
		)

		await userEvent.click(screen.getByRole('button'))

		expect(onClick).not.toHaveBeenCalled()
	})
})

describe('zachowanie przycisku', () => {
	it('wywołuje onClick', async () => {
		const onClick = vi.fn()
		render(<Button onClick={onClick}>Zapisz</Button>)

		await userEvent.click(screen.getByRole('button', { name: 'Zapisz' }))

		expect(onClick).toHaveBeenCalledOnce()
	})

	it('jest osiągalny z klawiatury', async () => {
		const onClick = vi.fn()
		render(<Button onClick={onClick}>Zapisz</Button>)

		await userEvent.tab()
		await userEvent.keyboard('{Enter}')

		expect(onClick).toHaveBeenCalledOnce()
	})

	it('zablokowany nie reaguje na kliknięcie', async () => {
		const onClick = vi.fn()
		render(
			<Button
				disabled
				onClick={onClick}
			>
				Zapisz
			</Button>
		)

		await userEvent.click(screen.getByRole('button'))

		expect(onClick).not.toHaveBeenCalled()
	})

	it('przepuszcza własne className obok klas wariantu', () => {
		render(<Button className='moja-klasa'>Zapisz</Button>)

		expect(screen.getByRole('button')).toHaveClass('moja-klasa')
	})
})
