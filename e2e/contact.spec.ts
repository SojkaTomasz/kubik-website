import { expect, test } from './fixtures'

/**
 * Formularz kontaktowy. W środowisku testowym nie ma klucza do dostawcy poczty,
 * więc poprawne zgłoszenie kończy się komunikatem „wysyłka nieskonfigurowana" —
 * i to zaleta: przechodzi CAŁA ścieżka poza cudzą infrastrukturą.
 *
 * Zgodę na cookies zaziarnia domyślnie fixture `consentSeeded`; bez tego modal
 * blokujący nie pozwoliłby kliknąć w formularz.
 */

/** Poprawne dane, których używają testy ścieżki pozytywnej. */
const DATA = {
	name: 'Jan Kowalski',
	email: 'jan@example.com',
	subject: 'Pytanie o ofertę',
	message: 'Dzień dobry, chciałbym poznać szczegóły współpracy przy nowym projekcie.',
}

/**
 * Czeka na hydrację, po której formularz zapisuje znacznik czasu wyświetlenia.
 * Bez tego test wypełniałby jeszcze statyczny HTML z serwera.
 */
async function waitForHydration(page: import('@playwright/test').Page) {
	await expect(page.locator('input[name="renderedAt"]')).not.toHaveValue('')
}

/** Etykiety dopasowane DOKŁADNIE: zgoda kończy się słowem „wiadomość", więc
 * bez tego locator trafia w trzy elementy naraz. */
async function fillForm(page: import('@playwright/test').Page) {
	await page.getByLabel('Imię i nazwisko', { exact: true }).fill(DATA.name)
	await page.getByLabel('Adres e-mail', { exact: true }).fill(DATA.email)
	await page.getByLabel('Temat', { exact: true }).fill(DATA.subject)
	await page.getByLabel('Wiadomość', { exact: true }).fill(DATA.message)
	await page.getByRole('checkbox').click()
}

test.describe('strona kontaktu', () => {
	test('jest osiągalna ze strony głównej', async ({ page }) => {
		await page.goto('/')

		// Zawężone do treści głównej: ten sam link jest też w nagłówku, a tu
		// sprawdzamy przycisk wezwania do działania ze strony głównej.
		await page.getByRole('main').getByRole('link', { name: 'Kontakt' }).click()

		await expect(page).toHaveURL(/\/kontakt$/)
		await expect(page.getByRole('heading', { level: 1, name: 'Kontakt' })).toBeVisible()
	})

	test('pokazuje kontakt bezpośredni obok formularza', async ({ page }) => {
		await page.goto('/kontakt')

		// Niedziałająca wysyłka nie może odciąć jedynej drogi kontaktu.
		await expect(page.getByRole('link', { name: /kontakt@/ })).toBeVisible()
		await expect(page.getByRole('link', { name: /\+48/ })).toBeVisible()
	})

	test('ma komplet pól', async ({ page }) => {
		await page.goto('/kontakt')

		for (const label of ['Imię i nazwisko', 'Adres e-mail', 'Temat', 'Wiadomość']) {
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

		await page.getByRole('button', { name: 'Wyślij wiadomość' }).click()

		await expect(page.getByText('Wpisz co najmniej dwa znaki.').first()).toBeVisible()
		// Adres nie może się zmienić — to znaczyłoby, że formularz jednak poleciał.
		await expect(page).toHaveURL(/\/kontakt$/)
	})

	test('wskazuje niepoprawny adres e-mail', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await page.getByLabel('Adres e-mail', { exact: true }).fill('to-nie-jest-adres')
		await page.getByLabel('Temat', { exact: true }).click()

		await expect(page.getByText(/Podaj poprawny adres e-mail/)).toBeVisible()
	})

	test('wymaga zgody na przetwarzanie danych', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await page.getByLabel('Imię i nazwisko', { exact: true }).fill(DATA.name)
		await page.getByLabel('Adres e-mail', { exact: true }).fill(DATA.email)
		await page.getByLabel('Temat', { exact: true }).fill(DATA.subject)
		await page.getByLabel('Wiadomość', { exact: true }).fill(DATA.message)

		await page.getByRole('button', { name: 'Wyślij wiadomość' }).click()

		// Komunikat jest teraz w DWÓCH miejscach i tak ma być: raz w podsumowaniu
		// nad formularzem, raz przy polu. Podsumowanie czyta czytnik ekranu od razu
		// po nieudanej wysyłce, komunikat przy polu — dopiero gdy się tam wróci.
		await expect(page.getByText(/Bez zgody na przetwarzanie danych/).first()).toBeVisible()
		await expect(page.getByText(/Bez zgody na przetwarzanie danych/)).toHaveCount(2)
	})

	test('oznacza pola z błędem atrybutem aria-invalid', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await page.getByRole('button', { name: 'Wyślij wiadomość' }).click()

		// Sam czerwony obramowanie nie dociera do czytnika ekranu.
		await expect(page.getByLabel('Adres e-mail', { exact: true })).toHaveAttribute(
			'aria-invalid',
			'true'
		)
	})

	test('licznik znaków pokazuje limit', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await page.getByLabel('Wiadomość', { exact: true }).fill('Krótka treść')

		await expect(page.getByText(/12 z 2000 znaków/)).toBeVisible()
	})
})

test.describe('wysyłka', () => {
	test('formularz wypełniony błyskawicznie jest odrzucany', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		// Człowiek nie wypełni pięciu pól w ułamku sekundy. Automat tak.
		await fillForm(page)
		await page.getByRole('button', { name: 'Wyślij wiadomość' }).click()

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
		await page.waitForTimeout(3500)
		await page.getByRole('button', { name: 'Wyślij wiadomość' }).click()

		// Kod `notConfigured` jest dowodem, że przeszła cała ścieżka: walidacja,
		// akcja, kod błędu, tłumaczenie, wyświetlenie.
		await expect(page.locator('form').getByRole('alert')).toContainText(
			/Wysyłka wiadomości nie jest/
		)
	})

	test('summary o niepowodzeniu jest ogłaszany czytnikom ekranu', async ({ page }) => {
		await page.goto('/kontakt')
		await waitForHydration(page)

		await fillForm(page)
		await page.getByRole('button', { name: 'Wyślij wiadomość' }).click()

		// role="alert" sprawia, że summary zostaje odczytany od razu, bez
		// przenoszenia się na niego kursorem czytnika.
		// Zawężone do formularza: powiadomienie „toast" również ma rolę alert.
		const summary = page.locator('form').getByRole('alert')

		await expect(summary).toBeVisible()
		await expect(summary).toBeFocused()
	})
})

test.describe('wersja angielska', () => {
	test('formularz i komunikaty walidacji są przetłumaczone', async ({ page }) => {
		await page.goto('/en/kontakt')
		await waitForHydration(page)

		await expect(page.getByLabel('Full name', { exact: true })).toBeVisible()

		await page.getByLabel('Email address', { exact: true }).fill('nope')
		await page.getByLabel('Subject', { exact: true }).click()

		// Schemat walidacji zwraca klucze, nie zdania — dzięki temu ten sam
		// schemat obsługuje obie wersje językowe bez duplikowania.
		await expect(page.getByText(/Enter a valid email address/)).toBeVisible()
	})
})
