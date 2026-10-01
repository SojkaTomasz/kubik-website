import { expect, test } from './fixtures'

/**
 * Animacje wejścia na zbudowanej stronie — jedyne miejsce, gdzie da się
 * sprawdzić, czy treść jest FAKTYCZNIE widoczna (jsdom nie liczy układu ani nie
 * wykonuje IntersectionObservera).
 *
 * Stawka: element startuje z `opacity: 0` już w HTML-u z serwera, więc każda
 * ścieżka, na której animacja nie ruszy, ukrywa treść na stałe.
 *
 * Testy biegną na próbkach `Reveal` z `/dev/components` — strony Kubika dziś
 * animacji wejścia nie używają, a mechanizm ma działać, zanim pierwsza dojdzie.
 */

const MOTION_PAGE = '/dev/components'
const REVEALED = '#motion [data-reveal]'

test.describe('ograniczony ruch', () => {
	// W Playwright 1.62 `reducedMotion` siedzi pod `contextOptions`, a nie
	// bezpośrednio w `use` — na najwyższym poziomie nie przechodzi typowania.
	test.use({ contextOptions: { reducedMotion: 'reduce' } })

	test('elementy są widoczne bez przewijania do nich', async ({ page }) => {
		// Bez zabezpieczenia w CSS-ie element poniżej pierwszego ekranu
		// zostawałby przezroczysty do czasu wejścia w kadr — a przy ograniczonym
		// ruchu animacja wejścia nie ma prawa w ogóle wystąpić.
		await page.goto(MOTION_PAGE)

		const items = page.locator(REVEALED)
		const count = await items.count()
		expect(count, 'brak próbek Reveal na stronie').toBeGreaterThan(0)

		for (let index = 0; index < count; index++) {
			const opacity = await items
				.nth(index)
				.evaluate(element => Number(getComputedStyle(element).opacity))

			expect(opacity, `element ${index} jest przezroczysty`).toBe(1)
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
		await page.goto(MOTION_PAGE)

		await expect(page.locator('html')).toHaveClass(/no-js/)

		const opacity = await page
			.locator(REVEALED)
			.first()
			.evaluate(element => Number(getComputedStyle(element).opacity))

		expect(opacity, 'treść jest niewidoczna bez JavaScriptu').toBe(1)
	})

	test('strona usługi ma treść bez JavaScriptu', scriptsBlocked, async ({ page }) => {
		await page.goto('/frezowanie-pod-ogrzewanie-podlogowe')

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
		// Odpowiedzi FAQ są w dokumencie także zwinięte (`hiddenUntilFound`).
		await expect(page.locator('[data-slot="accordion-content"]').first()).toBeAttached()
	})
})

test.describe('z JavaScriptem', () => {
	test('skrypt startowy zdejmuje klasę no-js', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('html')).not.toHaveClass(/no-js/)
	})

	test('treść pojawia się po wejściu w pole widzenia', async ({ page }) => {
		await page.goto(MOTION_PAGE)

		const first = page.locator(REVEALED).first()
		await first.scrollIntoViewIfNeeded()

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
