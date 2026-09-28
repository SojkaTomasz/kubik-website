import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Kroje zastępcze dopasowane metrycznie. Usterka łamie się CAŁKOWICIE CICHO:
 * tekst jest na miejscu, tylko przeskakuje w trakcie ładowania (zmierzone:
 * CLS 0,0205). Najbardziej prawdopodobny sposób złamania to podmiana kroju
 * marki bez przeliczenia metryk — instrukcja w nagłówku `fonts.css`.
 */

const THEME = join(process.cwd(), 'src/app/theme')

const fontsCss = readFileSync(join(THEME, 'fonts.css'), 'utf8')
const typographyCss = readFileSync(join(THEME, 'typography.css'), 'utf8')

/** Rodziny zadeklarowane w `fonts.css` jako `… Fallback`. */
function declaredFallbacks(): string[] {
	return [...fontsCss.matchAll(/font-family:\s*'([^']+ Fallback)'/g)].flatMap(([, family]) =>
		family ? [family] : []
	)
}

/** Blok `@font-face` danej rodziny — do sprawdzenia kompletu nadpisań. */
function faceBlock(family: string): string {
	const start = fontsCss.indexOf(`font-family: '${family}'`)
	expect(start, `brak deklaracji @font-face dla '${family}'`).toBeGreaterThan(-1)

	return fontsCss.slice(start, fontsCss.indexOf('}', start))
}

/** Stosy krojów z `typography.css` — wartości zmiennych `--font-*`. */
function fontStacks(): Record<string, string> {
	const stacks: Record<string, string> = {}

	for (const [, name, value] of typographyCss.matchAll(/--font-([a-z]+):\s*([^;]+);/g)) {
		if (!name || !value) continue

		// Zmienne wskazujące na inne zmienne (`--font-headings: var(--font-body)`)
		// nie mają własnego stosu — pilnuje ich ta, na którą wskazują.
		if (value.includes('var(')) continue

		stacks[name] = value.replaceAll(/\s+/g, ' ').trim()
	}

	return stacks
}

describe('kroje zastępcze', () => {
	it('każdy krój właściwy ma swój odpowiednik zastępczy', () => {
		// Bez tego cały mechanizm nie istnieje — a jego brak jest niewidoczny.
		const stacks = fontStacks()

		expect(Object.keys(stacks).length, 'nie znaleziono żadnego stosu krojów').toBeGreaterThan(0)

		for (const [name, stack] of Object.entries(stacks)) {
			expect(stack, `stos --font-${name} nie ma kroju zastępczego`).toMatch(/'[^']+ Fallback'/)
		}
	})

	it('krój zastępczy stoi ZARAZ za właściwym, przed rodzinami systemowymi', () => {
		// Sedno: `… Fallback` za `ui-sans-serif` nie robi nic, a wygląda identycznie.
		for (const [name, stack] of Object.entries(fontStacks())) {
			const families = stack.split(',').map(part => part.trim())

			expect(families[1], `--font-${name}: na drugiej pozycji nie ma kroju zastępczego`).toMatch(
				/^'[^']+ Fallback'$/
			)
		}
	})

	it('każda rodzina zastępcza ma komplet nadpisań metryk', () => {
		// Brak choćby jednego nadpisania zostawia część przesunięcia. Najłatwiej
		// zgubić `line-gap-override`, bo dla naszych krojów wynosi zero.
		const fallbacks = declaredFallbacks()

		expect(fallbacks.length, 'nie zadeklarowano żadnej rodziny zastępczej').toBeGreaterThan(0)

		for (const family of fallbacks) {
			const block = faceBlock(family)

			expect(block, `${family}: brak size-adjust`).toMatch(/size-adjust:\s*[\d.]+%/)
			expect(block, `${family}: brak ascent-override`).toMatch(/ascent-override:\s*[\d.]+%/)
			expect(block, `${family}: brak descent-override`).toMatch(/descent-override:\s*[\d.]+%/)
			expect(block, `${family}: brak line-gap-override`).toMatch(/line-gap-override:\s*[\d.]+%/)
		}
	})

	it('rodzina zastępcza sięga po krój systemowy, nie po plik z sieci', () => {
		// `local()` nie kosztuje żądania. `url()` byłby błędem w zamyśle: krój
		// zastępczy ma być gotowy ZANIM cokolwiek się pobierze.
		for (const family of declaredFallbacks()) {
			const block = faceBlock(family)

			expect(block, `${family}: krój zastępczy pobierany z sieci`).not.toMatch(/url\(/)
			expect(block, `${family}: brak źródła local()`).toMatch(/local\(/)
		}
	})

	it('nie zostaje rodzina zastępcza, której nikt nie używa', () => {
		// Martwa deklaracja sugeruje, że stos gdzieś zgubił swoją pozycję —
		// czyli że przesunięcie wróciło w tej jednej rodzinie.
		const stacks = Object.values(fontStacks()).join(' ')

		for (const family of declaredFallbacks()) {
			expect(stacks, `rodzina '${family}' nie występuje w żadnym stosie`).toContain(family)
		}
	})
})
