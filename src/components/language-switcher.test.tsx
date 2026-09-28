import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test/render'

/**
 * Przełącznik języka w obu ustawieniach startera.
 *
 * Wariant jednojęzyczny jest tu ważniejszy: menu z jedną pozycją, na dodatek
 * zablokowaną, wygląda jak zepsuta funkcja. Guard jest jedną linią, więc łatwo
 * go zgubić przy kolejnej zmianie w komponencie — a nic o tym nie powie,
 * dopóki ktoś nie zajrzy na stronę jednojęzyczną.
 */

vi.mock('@/i18n/navigation', () => ({
	usePathname: () => '/kontakt',
	useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
	Link: 'a',
	redirect: vi.fn(),
	getPathname: vi.fn(),
}))

describe('LanguageSwitcher', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('renderuje przycisk, gdy strona ma więcej niż jeden język', async () => {
		// Konfigurację podajemy jawnie w OBU testach, zamiast opierać się na
		// bieżącym site.config.ts. Inaczej ten test zaczynałby padać po
		// przełączeniu startera na jeden język — a to konfiguracja wspierana.
		vi.doMock('@/site.config', async importOriginal => {
			const original = await importOriginal<typeof import('@/site.config')>()

			return { ...original, isMultilingual: true, locales: ['pl', 'en'] as const }
		})

		const { LanguageSwitcher } = await import('@/components/language-switcher')

		render(<LanguageSwitcher />)

		expect(screen.getByRole('button')).toBeInTheDocument()
	})

	it('nie renderuje niczego na stronie jednojęzycznej', async () => {
		vi.doMock('@/site.config', async importOriginal => {
			const original = await importOriginal<typeof import('@/site.config')>()

			return { ...original, isMultilingual: false, locales: ['pl'] as const }
		})

		const { LanguageSwitcher } = await import('@/components/language-switcher')

		const { container } = render(<LanguageSwitcher />)

		expect(container).toBeEmptyDOMElement()
	})
})
