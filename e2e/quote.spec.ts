import type { Page } from '@playwright/test'

import { expect, test } from './fixtures'

/**
 * Formularz wyceny. W środowisku testowym nie ma klucza do dostawcy poczty,
 * więc poprawne zgłoszenie kończy się komunikatem „wysyłka nieskonfigurowana" —
 * i to zaleta: przechodzi CAŁA ścieżka poza cudzą infrastrukturą.
 *
 * Strona kontaktu ma jeden formularz, więc testy ścieżki biegną tam.
 */

const SUBMIT = 'Chcę darmową wycenę'
const DIALOG_NAME = 'Ile to kosztuje u Ciebie?'

/**
 * Czeka na hydrację, po której formularz zapisuje znacznik czasu wyświetlenia.
 * Bez tego test wypełniałby jeszcze statyczny HTML z serwera.
 */
async function waitForHydration(page: Page) {
	await expect(page.locator('input[name="renderedAt"]').first()).not.toHaveValue('')
}

async function fillForm(page: Page) {
	await page.getByLabel('Metraż', { exact: true }).fill('80')
	await page.getByLabel('Telefon', { exact: true }).fill('600 100 200')
}

test.describe('strona kontaktu', () => {
	test('jest osiągalna z menu', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('banner').getByRole('link', { name: 'Kontakt' }).first().click()

		await expect(page).toHaveURL(/\/kontakt$/)
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wycena nic nie kosztuje.')
	})

	test('pokazuje telefon i e-mail obok formularza', async ({ page }) => {
		await page.goto('/kontakt')

		// Niedziałająca wysyłka nie może odciąć jedynej drogi kontaktu.
		await expect(page.getByRole('main').getByRole('link', { name: /507 125 794/ })).toBeVisible()
		await expect(page.getByRole('link', { name: /@gmail\.com/ })).toBeVisible()
	})

	test('ma komplet pól', async ({ page }) => {
		await page.goto('/kontakt')

		for (const label of ['Metraż', 'Telefon', 'Miejscowość']) {
			await expect(page.getByLabel(label, { exact: true }), `brak pola „${label}"`).toBeVisible()
		}
	})

	test('pole-pułapka jest niewidoczne i poza kolejnością Tab', async ({ page }) => {
		await page.goto('/kontakt')

		const honeypot = page.locator('input[name="website"]')

		// POZA ekranem, nie `display:none`: automaty pomijają pola wyłączone
		// z układu. Dla człowieka niedostępne potrójnie — poza obszarem,
		// aria-hidden i poza kolejnością Taba.
		const box = await honeypot.boundingBox()

		expect(box?.x ?? 0, 'pole-pułapka nie jest wyprowadzone poza ekran').toBeLessThan(0)
		await expect(honeypot).toHaveAttribute('tabindex', '-1')
		await expect(page.locator('[aria-hidden="true"] input[name="website"]')).toHaveCount(1)
	})
})

test.describe('walidacja w przeglądarce', () => {
	test('pusty formularz nie jest wysyłany', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await page.getByRole('button', { name: SUBMIT }).click()

		await expect(page.getByText('Podaj metraż w m², na przykład 80.').first()).toBeVisible()
		await expect(page).toHaveURL(/\/kontakt$/)
	})

	test('metraż przyjmuje przecinek dziesiętny', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await page.getByLabel('Metraż', { exact: true }).fill('72,5')
		await page.getByRole('button', { name: SUBMIT }).click()

		await expect(page.getByLabel('Metraż', { exact: true })).not.toHaveAttribute(
			'aria-invalid',
			'true'
		)
	})

	test('oznacza pola z błędem atrybutem aria-invalid', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await page.getByRole('button', { name: SUBMIT }).click()

		// Sam kolor kreski nie dociera do czytnika ekranu.
		await expect(page.getByLabel('Telefon', { exact: true })).toHaveAttribute(
			'aria-invalid',
			'true'
		)
	})
})

test.describe('wysyłka', () => {
	test('formularz wypełniony błyskawicznie jest odrzucany', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		// Człowiek nie wypełni pól w ułamku sekundy. Automat tak.
		await fillForm(page)
		await page.getByRole('button', { name: SUBMIT }).click()

		await expect(page.locator('form').getByRole('alert')).toContainText(
			/Nie udało się zweryfikować formularza/
		)
	})

	test('poprawne zgłoszenie przechodzi przez akcję serwerową', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await fillForm(page)

		// Odczekanie ponad próg zabezpieczenia czasowego — tak jak zrobiłby
		// to człowiek czytający pola.
		await page.waitForTimeout(3000)
		await page.getByRole('button', { name: SUBMIT }).click()

		// Kod `notConfigured` jest dowodem, że przeszła cała ścieżka: walidacja,
		// akcja, kod błędu, tłumaczenie, wyświetlenie.
		const alert = page.locator('form').getByRole('alert')
		await expect(alert).toContainText(/Wysyłka formularza nie jest jeszcze włączona/)
		await expect(alert).toBeFocused()
	})
})

test.describe('strona miasta', () => {
	test('formularz nie pyta o miejscowość', async ({ page }) => {
		await page.goto('/frezowanie-pod-ogrzewanie-podlogowe/krakow')

		const form = page.locator('#wycena')
		await expect(form.getByLabel('Metraż', { exact: true })).toBeVisible()
		await expect(form.getByLabel('Miejscowość', { exact: true })).toHaveCount(0)
	})
})

test.describe('przyklejony pasek na telefonie', () => {
	test.use({ viewport: { width: 390, height: 844 } })

	test('jest w HTML-u z serwera i otwiera okienko wyceny', async ({ page }) => {
		await page.goto('/')

		const bar = page.locator('[data-slot="sticky-call-bar"]')
		await expect(bar.getByRole('link', { name: 'Zadzwoń' })).toHaveAttribute('href', /^tel:/)

		await bar.getByRole('button', { name: 'Darmowa wycena' }).click()

		await expect(page.getByRole('dialog', { name: DIALOG_NAME })).toBeVisible()
	})

	test('od tabletu znika', async ({ page }) => {
		await page.setViewportSize({ width: 1024, height: 800 })
		await page.goto('/')

		await expect(page.locator('[data-slot="sticky-call-bar"]')).toBeHidden()
	})
})

test.describe('okno wyższe niż ekran', () => {
	// Niski telefon (np. z otwartą klawiaturą): okienko wyceny nie mieści się w 560 px.
	test.use({ viewport: { width: 390, height: 560 } })

	test('treść da się przewinąć do ostatniego przycisku', async ({ page }) => {
		await page.goto('/')
		await page
			.locator('[data-slot="sticky-call-bar"]')
			.getByRole('button', { name: 'Darmowa wycena' })
			.click()

		const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
		await expect(dialog).toBeVisible()

		// Przy `overflow: hidden` dół okna był ucięty bez możliwości przewinięcia —
		// „Nie teraz" leżał poza ekranem i nie dało się go kliknąć.
		expect(await dialog.evaluate(element => getComputedStyle(element).overflowY)).toMatch(
			/auto|scroll/
		)
		await dialog.getByRole('button', { name: 'Nie teraz' }).click({ timeout: 5000 })
		await expect(dialog).toBeHidden()
	})
})

test.describe('okienko wyceny', () => {
	test.use({ quotePopupSeen: false })

	test('otwiera się po przewinięciu 2/3 strony — raz na wizytę', async ({ page }) => {
		await page.goto('/frezowanie-pod-ogrzewanie-podlogowe')
		// Nasłuch przewijania podpina się dopiero po hydracji.
		await waitForHydration(page)

		// Środek strony, z dala od sekcji formularza — przy widocznym formularzu
		// okienko świadomie się nie otwiera.
		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.62))

		const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
		await expect(dialog).toBeVisible()
		// Poza stroną miasta okienko pyta o miejscowość.
		await expect(dialog.getByLabel('Miejscowość', { exact: true })).toBeVisible()

		await dialog.getByRole('button', { name: 'Nie teraz' }).click()
		await expect(dialog).toBeHidden()

		await page.goto('/realizacje')
		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
		await page.waitForTimeout(500)
		await expect(page.getByRole('dialog', { name: DIALOG_NAME })).toHaveCount(0)
	})

	test('na stronie miasta nie pyta o miejscowość', async ({ page }) => {
		await page.goto('/frezowanie-pod-ogrzewanie-podlogowe/krakow')
		await waitForHydration(page)
		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.62))

		const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
		await expect(dialog).toBeVisible()
		await expect(dialog.getByLabel('Metraż', { exact: true })).toBeVisible()
		await expect(dialog.getByLabel('Miejscowość', { exact: true })).toHaveCount(0)
	})

	test('polityka prywatności otwiera się na okienku, które zostaje pod spodem', async ({
		page,
	}) => {
		await page.goto('/frezowanie-pod-ogrzewanie-podlogowe')
		await waitForHydration(page)
		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.62))

		const dialog = page.getByRole('dialog', { name: DIALOG_NAME })
		await expect(dialog).toBeVisible()

		await dialog.getByRole('button', { name: 'Polityka prywatności' }).click()
		await expect(page.getByRole('dialog', { name: /polityka prywatności/i })).toBeVisible()
		await expect(page).toHaveURL(/\/frezowanie-pod-ogrzewanie-podlogowe$/)

		await page.keyboard.press('Escape')
		await expect(page.getByRole('dialog', { name: /polityka prywatności/i })).toHaveCount(0)
		await expect(dialog).toBeVisible()
	})

	test('na stronie kontaktu nie otwiera się przy przewijaniu', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
		await page.waitForTimeout(500)

		await expect(page.getByRole('dialog')).toHaveCount(0)
	})

	test('na stronie kontaktu otwiera się przy zamiarze wyjścia', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		// Kursor wyjeżdża górą okna — przeglądarka zgłasza to z ostatniej pozycji
		// w oknie, kilkanaście pikseli od krawędzi, nie z zera.
		await page.evaluate(() =>
			document.body.dispatchEvent(
				new MouseEvent('mouseout', { bubbles: true, clientY: 12, relatedTarget: null })
			)
		)

		await expect(page.getByRole('dialog', { name: DIALOG_NAME })).toBeVisible()
	})
})

test.describe('wersja angielska', () => {
	test('formularz i komunikaty walidacji są przetłumaczone', async ({ page }) => {
		await page.goto('/en/kontakt')
		await waitForHydration(page)

		await expect(page.getByLabel('Floor area', { exact: true })).toBeVisible()

		await page.getByRole('button', { name: 'Get my free quote' }).click()

		// Schemat walidacji zwraca klucze, nie zdania — dzięki temu ten sam
		// schemat obsługuje obie wersje językowe bez duplikowania.
		await expect(
			page.getByText('Enter the floor area in m², for example 80.').first()
		).toBeVisible()
	})
})
