import { expect, test } from './fixtures'

/**
 * Animacje wejścia na zbudowanej stronie — jedyne miejsce, gdzie da się
 * sprawdzić, czy treść jest FAKTYCZNIE widoczna (jsdom nie liczy układu ani nie
 * wykonuje IntersectionObservera).
 *
 * Stawka: element startuje z `opacity: 0` już w HTML-u z serwera, więc każda
 * ścieżka, na której animacja nie ruszy, ukrywa treść na stałe.
 */

test.describe('ograniczony ruch', () => {
	// W Playwright 1.62 `reducedMotion` siedzi pod `contextOptions`, a nie
	// bezpośrednio w `use` — na najwyższym poziomie nie przechodzi typowania.
	test.use({ contextOptions: { reducedMotion: 'reduce' } })

	test('treść jest widoczna od razu, bez animacji', async ({ page }) => {
		await page.goto('/blog')

		const first = page.getByRole('main').getByRole('link').first()

		await expect(first).toBeVisible()
		expect(await first.evaluate(element => Number(getComputedStyle(element).opacity))).toBe(1)
	})

	test('wpisy są widoczne bez przewijania do nich', async ({ page }) => {
		// Bez zabezpieczenia w CSS-ie element poniżej pierwszego ekranu
		// zostawałby przezroczysty do czasu wejścia w kadr — a przy ograniczonym
		// ruchu animacja wejścia nie ma prawa w ogóle wystąpić.
		await page.goto('/blog')

		const items = page.getByRole('main').getByRole('listitem')
		const count = await items.count()

		for (let index = 0; index < count; index++) {
			const opacity = await items
				.nth(index)
				.evaluate(element => Number(getComputedStyle(element).opacity))

			expect(opacity, `wpis ${index} jest przezroczysty`).toBe(1)
		}
	})
})

test.describe('bez JavaScriptu', () => {
	test.use({ javaScriptEnabled: false })

	// Chromium z wyłączonym JS zgłasza odrzucone skrypty jako nieudane żądania.
	// To mechanizm wyłączenia, nie usterka strony.
	const scriptsBlocked = {
		annotation: {
			type: 'allowed-console-errors',
			description: 'przeglądarka blokuje skrypty, bo JavaScript jest wyłączony',
		},
	}

	test('treść zostaje widoczna', scriptsBlocked, async ({ page }) => {
		// `no-js` jest w HTML-u od serwera i zdejmuje ją skrypt startowy. Logika
		// odwrotna zostawiłaby stronę pustą przy każdej awarii skryptu.
		await page.goto('/blog')

		await expect(page.locator('html')).toHaveClass(/no-js/)

		const opacity = await page
			.getByRole('main')
			.getByRole('listitem')
			.first()
			.evaluate(element => Number(getComputedStyle(element).opacity))

		expect(opacity, 'treść jest niewidoczna bez JavaScriptu').toBe(1)
	})

	test('tekst wpisu jest w dokumencie i widoczny', scriptsBlocked, async ({ page }) => {
		await page.goto('/blog/pierwszy-wpis')

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
		await expect(page.getByRole('article')).toContainText('Co podmienić na start')
	})
})

test.describe('z JavaScriptem', () => {
	test('skrypt startowy zdejmuje klasę no-js', async ({ page }) => {
		await page.goto('/blog')

		await expect(page.locator('html')).not.toHaveClass(/no-js/)
	})

	test('treść pojawia się po wejściu w pole widzenia', async ({ page }) => {
		await page.goto('/blog')

		const first = page.getByRole('main').getByRole('listitem').first()

		// Animacja trwa pół sekundy — `toBeVisible` czeka, więc test nie zależy
		// od sztywnego odczekania.
		await expect(first).toBeVisible()
		await expect
			.poll(async () => first.evaluate(element => Number(getComputedStyle(element).opacity)))
			.toBe(1)
	})
})

test.describe('strony deweloperskie', () => {
	test('sekcja animacji pokazuje wszystkie kierunki', async ({ page }) => {
		await page.goto('/dev/components')

		const labels = await page.locator('#motion span.font-mono').allTextContents()

		for (const direction of ['up', 'down', 'left', 'right', 'none']) {
			expect(labels, `brak próbki kierunku "${direction}"`).toContain(direction)
		}
	})
})
