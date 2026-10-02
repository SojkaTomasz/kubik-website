import { describe, expect, it } from 'vitest'

import { findActionTarget, getClickSignature, scrollRatio } from '@/lib/mirror-sync'

function html(markup: string): HTMLElement {
	const root = document.createElement('div')
	root.innerHTML = markup
	return root
}

describe('lustro między urządzeniami', () => {
	it('link wewnętrzny przenosi jako adres — nawigacja, nie symulowane kliknięcie', () => {
		const root = html('<a href="/kontakt"><span>Kontakt</span></a>')

		expect(getClickSignature(root.querySelector('span')!)).toEqual({
			kind: 'nav',
			href: '/kontakt',
		})
	})

	it('link zewnętrzny traktuje jak akcję, nie nawigację', () => {
		const root = html('<a href="https://example.com">Zewnętrzny</a>')

		expect(getClickSignature(root.querySelector('a')!)).toMatchObject({ kind: 'action' })
	})

	it('przycisk przenosi po aria-label, a bez niego po tekście', () => {
		const root = html(
			'<button aria-label="Otwórz menu"><svg></svg></button><button>Pytanie 3</button>'
		)
		const [menu, question] = Array.from(root.querySelectorAll('button'))

		expect(getClickSignature(menu!)).toEqual({
			kind: 'action',
			tag: 'BUTTON',
			ariaLabel: 'Otwórz menu',
			text: null,
		})
		expect(getClickSignature(question!)).toMatchObject({ ariaLabel: null, text: 'Pytanie 3' })
	})

	it('kliknięcie poza elementem klikalnym nie jest przenoszone', () => {
		expect(getClickSignature(html('<p>tekst</p>').querySelector('p')!)).toBeNull()
	})

	it('na drugim urządzeniu odnajduje ten sam przycisk, choć stoi gdzie indziej', () => {
		const root = html('<button>Inny</button><div><button>Pytanie 3</button></div>')

		const match = findActionTarget(
			{ kind: 'action', tag: 'BUTTON', ariaLabel: null, text: 'Pytanie 3' },
			Array.from(root.querySelectorAll('button'))
		)

		expect(match?.textContent).toBe('Pytanie 3')
	})

	it('przewinięcie liczy jako część wysokości — strony różnią się długością', () => {
		expect(scrollRatio(500, 2000, 1000)).toBe(0.5)
		// Strona krótsza niż ekran nie ma czego przewijać.
		expect(scrollRatio(0, 800, 1000)).toBe(0)
	})
})
