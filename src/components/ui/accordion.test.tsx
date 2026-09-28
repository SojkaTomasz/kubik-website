import { describe, expect, it } from 'vitest'

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { render } from '@/test/render'

/**
 * Treść zwinięta MUSI zostać w dokumencie — akordeon to najczęstsze miejsce na
 * FAQ, czyli treść, po którą przychodzi robot. Base UI domyślnie usuwa zwinięty
 * panel: sprawdzone, pytania były w źródle, odpowiedzi nie było ani jednej.
 */

function Faq() {
	return (
		<Accordion>
			<AccordionItem value='czas'>
				<AccordionTrigger>Ile trwa realizacja?</AccordionTrigger>
				<AccordionContent>Od dwóch do czterech tygodni.</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}

describe('treść zwiniętego panelu', () => {
	it('zostaje w dokumencie, mimo że nie jest widoczna', () => {
		render(<Faq />)

		// `getByText` domyślnie pomija elementy ukryte, więc pytamy o sam tekst
		// w drzewie — o to samo, co widzi robot czytający źródło strony.
		expect(document.body.textContent).toContain('Od dwóch do czterech tygodni.')
	})

	it('jest ukryta atrybutem hidden, a nie usunięta', () => {
		render(<Faq />)

		const panel = document.querySelector('[data-slot="accordion-content"]')

		expect(panel).not.toBeNull()
		// `until-found` pozwala wyszukiwarce przeglądarki znaleźć tekst i rozwinąć
		// panel. Zwykłe `hidden` dałoby tylko obecność w źródle.
		expect(panel?.getAttribute('hidden')).toBe('until-found')
	})

	// Świadomie BEZ testu na niewidoczność dla czytnika: jsdom nie implementuje
	// semantyki `hidden='until-found'`, więc wynik zależałby od jego wersji.
	// Dostępność weryfikuje skan axe w pakiecie e2e.

	it('pozwala wyłączyć zachowanie, gdy panel niesie coś ciężkiego', () => {
		render(
			<Accordion>
				<AccordionItem value='ciezki'>
					<AccordionTrigger>Mapa</AccordionTrigger>
					<AccordionContent hiddenUntilFound={false}>Osadzona mapa</AccordionContent>
				</AccordionItem>
			</Accordion>
		)

		expect(document.body.textContent).not.toContain('Osadzona mapa')
	})
})
