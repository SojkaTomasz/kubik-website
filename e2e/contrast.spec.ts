import { expect, test } from './fixtures'

/**
 * Kontrast KAŻDEJ zadeklarowanej pary tokenów, także chwilowo nieużywanej —
 * axe sprawdza tylko te, które wystąpiły na stronie. Pomiar przez canvas:
 * przeglądarka zwraca kolory w `lab()`/`oklch()`, więc regex daje bezsens.
 */

/** Pary „tło / foreground", które muszą spełniać próg WCAG AA dla tekstu. */
const TEXT_PAIRS: [string, string, string][] = [
	['tło strony / foreground', '--background', '--foreground'],
	['tło strony / foreground wyciszony', '--background', '--muted-foreground'],
	['tło wyciszone / foreground wyciszony', '--muted', '--muted-foreground'],
	['karta / foreground karty', '--card', '--card-foreground'],
	['warstwa / foreground warstwy', '--popover', '--popover-foreground'],
	['akcja główna / jej foreground', '--primary', '--primary-foreground'],
	['akcja drugorzędna / jej foreground', '--secondary', '--secondary-foreground'],
	['podświetlenie / jego foreground', '--accent', '--accent-foreground'],

	['sukces / foreground na nim', '--success', '--success-foreground'],
	['sukces soft / foreground na nim', '--success-soft', '--success-soft-foreground'],
	['ostrzeżenie / foreground na nim', '--warning', '--warning-foreground'],
	['ostrzeżenie soft / foreground na nim', '--warning-soft', '--warning-soft-foreground'],
	['informacja / foreground na niej', '--info', '--info-foreground'],
	['informacja soft / foreground na niej', '--info-soft', '--info-soft-foreground'],
	['błąd / foreground na nim', '--destructive', '--destructive-foreground'],
	['błąd soft / foreground na nim', '--destructive-soft', '--destructive-soft-foreground'],

	['tło strony / foreground błędu', '--background', '--destructive-soft-foreground'],
	['karta / foreground błędu', '--card', '--destructive-soft-foreground'],
]

/** Próg WCAG 2.2 AA dla tekstu o normalnym rozmiarze. */
const TEXT_THRESHOLD = 4.5

/**
 * Mierzy kontrast par w aktualnym motywie strony.
 * Zwraca wynik dla każdej pairs, żeby report wymieniał wszystkie usterki naraz.
 */
async function measure(page: import('@playwright/test').Page, pairs: [string, string, string][]) {
	return page.evaluate(list => {
		const canvas = document.createElement('canvas')
		canvas.width = canvas.height = 1
		const ctx = canvas.getContext('2d', { willReadFrequently: true })!

		const probe = document.createElement('div')
		document.body.append(probe)

		/** Sprowadza dowolny zapis koloru CSS do sRGB, malując go na canvasie. */
		function srgb(token: string): [number, number, number] {
			probe.style.color = `var(${token})`
			ctx.clearRect(0, 0, 1, 1)
			ctx.fillStyle = getComputedStyle(probe).color
			ctx.fillRect(0, 0, 1, 1)
			const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
			return [r!, g!, b!]
		}

		function luminance([r, g, b]: [number, number, number]) {
			const channel = (c: number) => {
				const s = c / 255
				return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
			}
			return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
		}

		const measured = list.map(([label, background, foreground]) => {
			const [lighter, darker] = [
				luminance(srgb(background!)),
				luminance(srgb(foreground!)),
			].sort((a, b) => b - a)
			const ratio = (lighter! + 0.05) / (darker! + 0.05)
			return { label: label!, ratio: Math.round(ratio * 100) / 100 }
		})

		probe.remove()
		return measured
	}, pairs)
}

function report(results: { label: string; ratio: number }[], threshold: number) {
	return results
		.filter(w => w.ratio < threshold)
		.map(w => `  • ${w.label}: ${w.ratio.toFixed(2)}:1 (wymagane ${threshold}:1)`)
		.join('\n')
}

test('motyw jasny: każda para tokenów spełnia próg WCAG AA', async ({ page }) => {
	await page.goto('/')

	const results = await measure(page, TEXT_PAIRS)
	const failing = results.filter(w => w.ratio < TEXT_THRESHOLD)

	expect(failing, `Za niski kontrast:\n${report(results, TEXT_THRESHOLD)}`).toEqual([])
})

test('motyw ciemny: każda para tokenów spełnia próg WCAG AA', async ({ page }) => {
	await page.addInitScript(() => window.localStorage.setItem('theme', 'dark'))
	await page.goto('/')

	// Motyw ciemny bywa dodawany „na końcu" i nigdy nie sprawdzany tak dokładnie
	// jak jasny — a to w nim najłatwiej o parę, która wygląda dobrze, ale się
	// nie czyta.
	await expect(page.locator('html')).toHaveClass(/dark/)

	const results = await measure(page, TEXT_PAIRS)
	const failing = results.filter(w => w.ratio < TEXT_THRESHOLD)

	expect(failing, `Za niski kontrast (motyw ciemny):\n${report(results, TEXT_THRESHOLD)}`).toEqual(
		[]
	)
})
