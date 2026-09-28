import { expect, test } from './fixtures'

/**
 * Szkielet strony. Trzy rzeczy niewidoczne przy pobieżnym oglądaniu: `<main>` jako
 * punkt orientacyjny, pominięcie nawigacji (WCAG 2.4.1) i przycisk ustawień
 * cookies, bez którego nie da się wycofać zgody.
 */

const PAGES = ['/', '/kontakt', '/polityka-prywatnosci']

test.describe('szkielet na każdej podstronie', () => {
	for (const path of PAGES) {
		test(`${path} ma nagłówek, treść główną i stopkę`, async ({ page }) => {
			await page.goto(path)

			await expect(page.getByRole('banner')).toBeVisible()
			await expect(page.getByRole('main')).toBeVisible()
			await expect(page.getByRole('contentinfo')).toBeVisible()
		})
	}

	test('przełączniki motywu i języka są na podstronie, nie tylko na stronie głównej', async ({
		page,
	}) => {
		// Wcześniej stały wklejone w stronę główną, więc użytkownik, który wszedł
		// wprost na /kontakt, nie mógł zmienić ani języka, ani motywu.
		await page.goto('/kontakt')

		await expect(page.getByRole('button', { name: 'Zmień motyw' })).toBeVisible()
		await expect(page.getByRole('button', { name: 'Zmień język' })).toBeVisible()
	})

	test('nazwa strony w nagłówku prowadzi na stronę główną', async ({ page }) => {
		await page.goto('/kontakt')

		await page.getByRole('banner').getByRole('link').first().click()

		await expect(page).toHaveURL(/\/$/)
	})
})

test.describe('pominięcie nawigacji', () => {
	test('pierwszy Tab trafia w link pomijający', async ({ page }) => {
		await page.goto('/')
		await page.keyboard.press('Tab')

		const focused = page.locator(':focus')

		await expect(focused).toHaveText(/Przejdź do treści/)
		await expect(focused, 'link musi być widoczny po otrzymaniu fokusu').toBeVisible()
	})

	test('link prowadzi do znacznika treści głównej', async ({ page }) => {
		await page.goto('/')
		await page.keyboard.press('Tab')

		await expect(page.locator(':focus')).toHaveAttribute('href', '#content')
		await expect(page.locator('main')).toHaveAttribute('id', 'content')
	})

	test('jest niewidoczny, dopóki nie dostanie fokusu', async ({ page }) => {
		await page.goto('/')

		// `sr-only` zostawia element w drzewie dostępności, ale zwija go do
		// jednego piksela — nie może zajmować miejsca w układzie strony.
		const box = await page.getByRole('link', { name: 'Przejdź do treści' }).boundingBox()

		expect(box?.height ?? 0).toBeLessThan(5)
	})
})

test.describe('wycofanie zgody na cookies', () => {
	// Testy zaczynają się od pierwszej decyzji, więc muszą zobaczyć baner —
	// stąd wyłączone zaziarnienie zgody z fixtures.
	test.use({ consentSeeded: false })

	test('stopka pozwala otworzyć ustawienia po podjęciu decyzji', async ({ page }) => {
		await page.goto('/')

		// Pierwsza decyzja — baner znika i od tej pory jedyną drogą do zgód
		// jest stopka.
		await page.getByRole('button', { name: 'Akceptuję' }).click()
		await expect(page.getByRole('dialog', { name: 'Zgoda na pliki cookie' })).toBeHidden()

		await page.getByRole('button', { name: 'Ustawienia cookies' }).click()

		await expect(page.getByRole('dialog')).toBeVisible()
		await expect(page.getByText('Ustawienia plików cookie')).toBeVisible()
	})

	test('zmiana wyboru w dialogu trafia do dataLayer', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Akceptuję' }).click()

		await page.getByRole('button', { name: 'Ustawienia cookies' }).click()

		// Panel nie ma już skrótu „Odrzuć wszystkie" — wycofanie zgody polega na
		// przestawieniu przełączników i zapisaniu. To ta sama droga, którą ma
		// przejść użytkownik, więc test przechodzi ją tak samo.
		await page.getByRole('switch', { name: 'Analityczne' }).click()
		await page.getByRole('switch', { name: 'Marketingowe' }).click()
		await page.getByRole('button', { name: 'Zapisz' }).click()

		const signals = await page.evaluate(() => {
			const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []

			const updates = layer
				.map(entry => Array.from(entry as ArrayLike<unknown>))
				.filter(args => args[0] === 'consent' && args[1] === 'update')

			return updates.at(-1)?.[2] as Record<string, string> | undefined
		})

		expect(signals, 'wycofanie zgody nie dotarło do dataLayer').toMatchObject({
			analytics_storage: 'denied',
			ad_storage: 'denied',
		})
	})

	test('działa też w wersji angielskiej', async ({ page }) => {
		await page.goto('/en')
		await page.getByRole('button', { name: 'Accept' }).click()

		await page.getByRole('button', { name: 'Cookie settings' }).click()

		await expect(page.getByText('Cookie settings', { exact: true }).last()).toBeVisible()
	})
})
