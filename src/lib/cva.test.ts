import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { alertVariants } from '@/components/ui/alert'
import { badgeVariants } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button.variants'
import { cardVariants } from '@/components/ui/card'
import { containerVariants } from '@/components/ui/container'
import { sectionVariants } from '@/components/ui/section'
import { typographyVariants } from '@/components/ui/typography'
import { cva, variantKeys } from '@/lib/cva'

/**
 * Strażnik warstwy wariantów.
 *
 * Testy tutaj pilnują dwóch niezmienników, których złamanie NIE daje żadnego
 * błędu — ani przy kompilacji, ani w konsoli. Objawia się wyłącznie tym,
 * że sekcja na stronie /dev renderuje się pusta, a nikt tego nie zauważa,
 * dopóki nie zacznie szukać wariantu, który „chyba był".
 *
 * Oba te przypadki wystąpiły w tym projekcie naprawdę.
 */

const UI_DIR = join(process.cwd(), 'src', 'components', 'ui')

function uiSourceFiles(): { name: string; source: string }[] {
	return readdirSync(UI_DIR)
		.filter(file => /\.tsx?$/.test(file) && !file.includes('.test.'))
		.map(name => ({ name, source: readFileSync(join(UI_DIR, name), 'utf8') }))
}

describe('nakładka cva zachowuje konfigurację', () => {
	it('dokłada variantsConfig do zwróconej funkcji', () => {
		const variants = cva('base', { variants: { tone: { light: 'a', dark: 'b' } } })

		expect(variants.variantsConfig).toBeDefined()
	})

	it('zachowuje zachowanie oryginalnego cva', () => {
		const variants = cva('base', {
			variants: { tone: { light: 'jest-light', dark: 'jest-dark' } },
			defaultVariants: { tone: 'light' },
		})

		expect(variants()).toBe('base jest-light')
		expect(variants({ tone: 'dark' })).toBe('base jest-dark')
	})
})

describe('variantKeys', () => {
	it('zwraca wartości osi w kolejności deklaracji', () => {
		const variants = cva('', { variants: { size: { sm: 'a', md: 'b', lg: 'c' } } })

		expect(variantKeys(variants, 'size')).toEqual(['sm', 'md', 'lg'])
	})

	it('zwraca pustą listę dla funkcji bez konfiguracji, zamiast rzucać', () => {
		const functionWithoutConfig = Object.assign(() => '', {})

		expect(variantKeys(functionWithoutConfig, 'variant' as never)).toEqual([])
	})
})

/**
 * Ten opis pilnuje niezmiennika nr 1: komponent, którego warianty czytamy
 * na stronach /dev, musi faktycznie oddawać swoją konfigurację.
 */
describe('komponenty oddają swoje warianty', () => {
	const components = [
		['Button', buttonVariants, ['variant', 'size', 'radius']],
		['Badge', badgeVariants, ['variant', 'rounded']],
		['Alert', alertVariants, ['variant']],
		['Card', cardVariants, ['variant']],
		['Container', containerVariants, ['size', 'padding']],
		['Section', sectionVariants, ['spacing', 'background']],
		['Typography', typographyVariants, ['variant', 'tone', 'font']],
	] as const

	for (const [name, variants, axes] of components) {
		for (const axis of axes) {
			it(`${name}.${axis} zwraca niepustą listę`, () => {
				// Pusta lista oznacza, że strona /dev pokaże pustą sekcję —
				// bez śladu w konsoli i bez błędu kompilacji.
				expect(variantKeys(variants as never, axis as never).length).toBeGreaterThan(0)
			})
		}
	}

	it('Button wystawia warianty faktycznie używane w widokach', () => {
		expect(variantKeys(buttonVariants, 'variant')).toEqual(
			expect.arrayContaining(['default', 'outline', 'ghost', 'destructive'])
		)
	})

	it('Badge wystawia warianty statusowe', () => {
		expect(variantKeys(badgeVariants, 'variant')).toEqual(
			expect.arrayContaining(['success', 'warning', 'info'])
		)
	})
})

/**
 * Niezmiennik nr 2, wykryty w tym projekcie na własnej skórze.
 *
 * Eksporty modułu z dyrektywą 'use client' docierają do komponentów
 * serwerowych jako referencje klienta — puste skorupy bez `variantsConfig`.
 * Strona /dev odczytywała wtedy pustą listę i renderowała pustą sekcję,
 * nie zgłaszając niczego. Ten test zamienia tamten cichy przypadek w błąd.
 *
 * Reguła jest celowo wąska: nie zakazujemy definiowania wariantów w module
 * klienckim (część komponentów rejestru robi tak i nikomu to nie przeszkadza).
 * Zakazujemy sytuacji, w której moduł SERWEROWY czyta warianty z modułu
 * klienckiego — bo tylko wtedy odczyt zwraca puste referencje.
 */
describe('warianty czytane po stronie serwera są poza granicą klienta', () => {
	function isClientModule(source: string): boolean {
		return source.trimStart().startsWith("'use client'")
	}

	function walk(dir: string, out: string[] = []): string[] {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const path = join(dir, entry.name)
			if (entry.isDirectory()) walk(path, out)
			else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')) out.push(path)
		}
		return out
	}

	it('żaden moduł serwerowy nie importuje wariantów z modułu klienckiego', () => {
		const srcDir = join(process.cwd(), 'src')
		const violations: string[] = []

		for (const file of walk(srcDir)) {
			const source = readFileSync(file, 'utf8')
			if (isClientModule(source)) continue

			// import { …Variants… } from '@/components/ui/<moduł>'
			for (const match of source.matchAll(
				/import\s*\{([^}]*)\}\s*from\s*'@\/components\/ui\/([\w.-]+)'/g
			)) {
				const [, imported, moduleName] = match
				if (!imported?.includes('Variants')) continue

				const target = join(srcDir, 'components', 'ui', `${moduleName}.tsx`)
				const targetTs = join(srcDir, 'components', 'ui', `${moduleName}.ts`)

				let targetSource: string
				try {
					targetSource = readFileSync(target, 'utf8')
				} catch {
					targetSource = readFileSync(targetTs, 'utf8')
				}

				if (isClientModule(targetSource)) {
					violations.push(
						`${file.replace(srcDir, 'src')} → @/components/ui/${moduleName} (moduł kliencki)`
					)
				}
			}
		}

		expect(
			violations,
			"Moduł serwerowy czyta warianty z modułu z 'use client'. Takie eksporty docierają " +
				'na serwer jako puste referencje klienta, więc variantKeys() zwróci [], a sekcja ' +
				'wyrenderuje się pusta — bez błędu kompilacji i bez wpisu w konsoli. ' +
				'Przenieś wywołanie cva do osobnego pliku bez dyrektywy, wzorem ' +
				'components/ui/button.variants.ts.'
		).toEqual([])
	})

	it('wszystkie komponenty importują cva z @/lib/cva, nie z pakietu', () => {
		const fromPackage = uiSourceFiles()
			.filter(({ source }) => source.includes("from 'class-variance-authority'"))
			.map(({ name }) => name)

		expect(
			fromPackage,
			'Import cva prosto z pakietu gubi konfigurację wariantów. Uruchom `pnpm ui:sync`.'
		).toEqual([])
	})
})
