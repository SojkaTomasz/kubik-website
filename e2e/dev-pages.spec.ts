import { badgeVariants } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button.variants'
import { cardVariants } from '@/components/ui/card'
import { variantKeys } from '@/lib/cva'

import { expect, test } from './fixtures'

/**
 * Strony /dev mają pokazywać WSZYSTKO z biblioteki. Test porównuje liczbę próbek
 * z liczbą wariantów zadeklarowanych w komponencie, więc łapie też zerwanie
 * granicy klienta — sekcja renderuje się wtedy pusta, bez błędu i bez konsoli.
 */

test.describe('dostępność stron', () => {
	test('indeks prowadzi do obu podstron', async ({ page }) => {
		await page.goto('/dev')

		// Zawężamy do treści strony: te same nazwy występują też w pasku nawigacji.
		const main = page.locator('main')

		await expect(main.getByRole('link', { name: /Styleguide/ })).toBeVisible()
		await expect(main.getByRole('link', { name: /Komponenty/ })).toBeVisible()
	})

	test('strony /dev są wykluczone z indeksowania', async ({ page }) => {
		for (const path of ['/dev', '/dev/styleguide', '/dev/components']) {
			await page.goto(path)

			await expect(
				page.locator('meta[name="robots"]'),
				`brak noindex na ${path}`
			).toHaveAttribute('content', /noindex/)
		}
	})
})

test.describe('styleguide pokazuje komplet fundamentów', () => {
	test('ma wszystkie osiem sekcji', async ({ page }) => {
		await page.goto('/dev/styleguide')

		for (const id of [
			'colors',
			'typography',
			'spacing',
			'elevation',
			'radius',
			'states',
			'icons',
			'breakpoints',
		]) {
			await expect(page.locator(`section#${id}`), `brak sekcji #${id}`).toHaveCount(1)
		}
	})

	test('wartości tokenów są odczytane z CSS, a nie przepisane', async ({ page }) => {
		await page.goto('/dev/styleguide')

		// Wartość dopisuje efekt uruchamiany po hydracji, więc asercja musi
		// ponawiać próbę — `toHaveText` robi to samo z siebie.
		const value = page
			.locator('span.font-mono', { hasText: '--brand-500' })
			.first()
			.locator('xpath=following-sibling::span')

		// Sama nazwa tokenu bez wartości oznaczałaby, że odczyt z CSS się nie udał.
		await expect(value).toHaveText(/oklch|lab|rgb|#/)
	})

	test('pokazuje warianty przycisku pobrane z komponentu', async ({ page }) => {
		await page.goto('/dev/styleguide')

		const expected = variantKeys(buttonVariants, 'variant')

		for (const variant of expected) {
			// `.first()`, bo część nazw powtarza się między osiami — 'default'
			// jest zarówno wariantem, jak i rozmiarem.
			await expect(
				page.locator('#states').getByText(variant, { exact: true }).first(),
				`variant ${variant} nie jest pokazany w sekcji stanów`
			).toBeVisible()
		}
	})
})

test.describe('strona komponentów pokazuje komplet variantów', () => {
	test('ma wszystkie dziesięć grup', async ({ page }) => {
		await page.goto('/dev/components')

		for (const id of [
			'actions',
			'forms',
			'feedback',
			'overlays',
			'navigation',
			'data',
			'layout',
			'specialized',
			'motion',
			'conversation',
		]) {
			await expect(page.locator(`section#${id}`), `brak grupy #${id}`).toHaveCount(1)
		}
	})

	test('pokazuje KAŻDY variant przycisku', async ({ page }) => {
		await page.goto('/dev/components')

		for (const variant of variantKeys(buttonVariants, 'variant')) {
			await expect(
				page.locator('#actions').getByText(variant, { exact: true }).first(),
				`variant przycisku "${variant}" nie ma próbki na stronie`
			).toBeVisible()
		}
	})

	test('pokazuje KAŻDY rozmiar i zaokrąglenie przycisku', async ({ page }) => {
		await page.goto('/dev/components')

		const labels = await page.locator('#actions span.font-mono').allTextContents()

		for (const size of variantKeys(buttonVariants, 'size')) {
			expect(labels, `rozmiar "${size}" nie ma próbki`).toContain(size)
		}

		for (const radius of variantKeys(buttonVariants, 'radius')) {
			expect(labels, `zaokrąglenie "${radius}" nie ma próbki`).toContain(radius)
		}
	})

	test('pokazuje KAŻDY variant odznaki', async ({ page }) => {
		await page.goto('/dev/components')

		const labels = await page.locator('#feedback span.font-mono').allTextContents()

		for (const variant of variantKeys(badgeVariants, 'variant')) {
			expect(labels, `variant odznaki "${variant}" nie ma próbki`).toContain(variant)
		}
	})

	test('pokazuje KAŻDY variant karty', async ({ page }) => {
		await page.goto('/dev/components')

		const labels = await page.locator('#data span.font-mono').allTextContents()

		for (const variant of variantKeys(cardVariants, 'variant')) {
			expect(labels, `variant karty "${variant}" nie ma próbki`).toContain(variant)
		}
	})

	test('komponenty są interaktywne, nie są statycznym obrazkiem', async ({ page }) => {
		await page.goto('/dev/components')

		// Playwright klika, gdy element jest widoczny — a ten jest widoczny już
		// w HTML-u z serwera, zanim React podepnie zdarzenia.
		await expect(async () => {
			await page.locator('#overlays').getByRole('button', { name: 'Otwórz dialog' }).click()
			await expect(page.getByRole('dialog')).toBeVisible({ timeout: 1000 })
		}).toPass({ timeout: 15_000 })

		await expect(page.getByText('Edycja profilu')).toBeVisible()
	})
})
