import AxeBuilder from '@axe-core/playwright'

import { expect, test } from './fixtures'

/**
 * Audyt dostępności. Narzędzia automatyczne łapią około jednej trzeciej realnych
 * barier — nie ocenią sensu tekstu alternatywnego ani kolejności czytania.
 * Poziom `serious` i `critical` traktujemy jako błąd.
 *
 * Audyt ocenia STAN KOŃCOWY strony, więc biegnie przy ograniczonym ruchu. Bez tego axe
 * łapie wejście hero w połowie (przyciski przy `opacity: 0.4`) i zgłasza kontrast,
 * którego żaden użytkownik nie zobaczy po sekundzie — wynik zależał od tego, ile
 * milisekund minęło od załadowania. Same animacje szanują to ustawienie
 * (`app/theme/motion.css`, `ScrollMotion`), więc strona jest wtedy od razu gotowa.
 */
test.use({ contextOptions: { reducedMotion: 'reduce' } })

/** Strony, które muszą przejść audyt. */
const PAGES = [
	['/', 'strona główna'],
	['/en', 'strona główna po angielsku'],
	['/frezowanie-pod-ogrzewanie-podlogowe', 'usługa'],
	['/frezowanie-pod-ogrzewanie-podlogowe/krakow', 'strona miasta'],
	['/realizacje', 'lista realizacji'],
	['/realizacje/wroclaw-50m2', 'realizacja'],
	['/kontakt', 'kontakt'],
	['/polityka-prywatnosci', 'polityka prywatności'],
	['/dev/styleguide', 'styleguide'],
	['/dev/components', 'strona komponentów'],
] as const

/** Standardy, względem których sprawdzamy. WCAG 2.2 AA to wymóg m.in. w zamówieniach publicznych. */
const STANDARDS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/**
 * Znane ograniczenia bibliotek — lista CELOWO wąska i imienna. Dopisując pozycję,
 * napisz, dlaczego nie da się tego naprawić u nas i co będzie warunkiem usunięcia.
 */
const KNOWN_LIMITATIONS = [
	{
		rule: 'aria-required-attr',
		/** Fragment kodu HTML jednoznacznie wskazujący element. */
		inMarkup: 'data-slot="resizable-handle"',
		reason:
			'react-resizable-panels renderuje uchwyt jako role="separator" z tabindex="0", ' +
			'ale nie ustawia wymaganego aria-valuenow i nie udostępnia tej wartości przez API. ' +
			'Alternatywy są gorsze: odebranie fokusu wyłączyłoby zmianę rozmiaru z klawiatury, ' +
			'a wpisanie zmyślonej wartości wprowadzałoby czytnik ekranu w błąd. ' +
			'Do usunięcia, gdy biblioteka zacznie ustawiać ten atrybut sama.',
	},
] as const

/**
 * Tekst CZYSTO DEKORACYJNY — wyjęty z audytu kontrastu. WCAG 1.4.3 zwalnia go
 * z wymogu wprost („pure decoration"), ale axe tego nie rozpozna: sprawdza
 * kontrast także pod `aria-hidden`.
 *
 * Dwa przypadki, oba wyłącznie w wersji ukrytej przed czytnikiem:
 * - przewijany pas miast w stopce — te same miasta stoją pod nim jako czytelna lista,
 * - symbole „m² / cm / km" przy czynnikach ceny — nazwa czynnika stoi obok.
 * Element bez `aria-hidden` wróciłby do audytu, i słusznie.
 */
const DECORATIVE = [
	'[data-slot="marquee"][aria-hidden="true"]',
	'[data-decorative][aria-hidden="true"]',
].join(', ')

/** Odsiewa naruszenia objęte listą znanych ograniczeń. */
function withoutKnownLimitations<T extends { id: string; nodes: { html: string }[] }>(
	violations: T[]
): T[] {
	return violations
		.map(violation => {
			const exceptions = KNOWN_LIMITATIONS.filter(o => o.rule === violation.id)
			if (exceptions.length === 0) return violation

			const nodes = violation.nodes.filter(
				node => !exceptions.some(o => node.html.includes(o.inMarkup))
			)
			return { ...violation, nodes }
		})
		.filter(violation => violation.nodes.length > 0)
}

function describeViolations(
	violations: { id: string; impact?: string | null; nodes: unknown[] }[]
) {
	return violations
		.map(v => `  • [${v.impact}] ${v.id} — ${v.nodes.length} element(ów)`)
		.join('\n')
}

for (const [path, label] of PAGES) {
	test(`${label} nie ma poważnych barier dostępności`, async ({ page }) => {
		await page.goto(path)

		const result = await new AxeBuilder({ page })
			.exclude(DECORATIVE)
			.withTags(STANDARDS)
			.analyze()

		const blocking = withoutKnownLimitations(
			result.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
		)

		expect(blocking, `Bariery na ${path}:\n${describeViolations(blocking)}`).toEqual([])
	})
}

/* Blok wyłącza zaziarnienie zgody, żeby audyt objął sam baner. */
test.describe('baner zgody', () => {
	test.use({ consentSeeded: false })

	test('nie ma barier dostępności', async ({ page }) => {
		await page.goto('/')

		// Czekamy na fokus, nie na widoczność: audyt ma zastać modal w tym samym
		// stanie, w jakim zastaje go użytkownik klawiatury.
		await expect(page.getByRole('dialog', { name: 'Zgoda na pliki cookie' })).toBeFocused()

		const result = await new AxeBuilder({ page })
			.include('[aria-label="Zgoda na pliki cookie"]')
			.withTags(STANDARDS)
			.analyze()

		const blocking = result.violations.filter(
			v => v.impact === 'critical' || v.impact === 'serious'
		)

		expect(blocking, `Bariery w banerze:\n${describeViolations(blocking)}`).toEqual([])
	})

	test('cała strona z otwartym banerem przechodzi audyt', async ({ page }) => {
		// Osobny przebieg na pełnej stronie: modal wnosi bariery, których nie
		// widać w jego własnym poddrzewie.
		await page.goto('/')
		await expect(page.getByRole('dialog', { name: 'Zgoda na pliki cookie' })).toBeFocused()

		const result = await new AxeBuilder({ page })
			.exclude(DECORATIVE)
			.withTags(STANDARDS)
			.analyze()

		const blocking = withoutKnownLimitations(
			result.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
		)

		expect(blocking, `Bariery na stronie z banerem:\n${describeViolations(blocking)}`).toEqual([])
	})
})

test('okno modalne nie zamyka użytkownika w pułapce', async ({ page }) => {
	await page.goto('/dev/components')

	await expect(async () => {
		await page.locator('#overlays').getByRole('button', { name: 'Otwórz dialog' }).click()
		await expect(page.getByRole('dialog')).toBeVisible({ timeout: 1000 })
	}).toPass({ timeout: 15_000 })

	// Escape musi zamykać okno. Bez tego użytkownik klawiatury zostaje uwięziony
	// w pułapce fokusa — to jedna z najcięższych barier, jakie da się popełnić.
	await page.keyboard.press('Escape')

	await expect(page.getByRole('dialog')).toBeHidden()
})

test('każda strona ma dokładnie jeden nagłówek pierwszego poziomu', async ({ page }) => {
	for (const [path, label] of PAGES) {
		await page.goto(path)

		const count = await page.locator('h1').count()

		// Czytnik ekranu buduje z nagłówków spis treści strony. Brak h1 zostawia
		// go bez punktu wyjścia, a kilka h1 sugeruje kilka niezależnych treści.
		expect(count, `${label} (${path}) ma ${count} nagłówków h1`).toBe(1)
	}
})
