import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Napisy widoczne WYŁĄCZNIE dla czytnika ekranu muszą iść przez `messages/*.json`.
 *
 * To jedyna kategoria treści, której nie widzi nikt poza osobą niewidomą — i stąd
 * najłatwiejsza do przeoczenia. Rejestr shadcn przychodzi z angielskimi napisami
 * wpisanymi wprost w kod (`Close`, `Previous slide`, `Loading`, `More pages`),
 * a `shadcn add --overwrite` przywraca je przy każdej aktualizacji komponentu.
 *
 * Objaw jest niewidoczny na wylot: strona wygląda identycznie, lint milczy, testy
 * zachowania przechodzą, axe też — bo nazwa dostępna JEST, tylko w złym języku.
 * Widać to dopiero wtedy, gdy polska synteza mowy czyta „Close" w środku
 * polskiego zdania.
 */

const UI_DIR = import.meta.dirname

/** Atrybuty, których wartość trafia do czytnika ekranu jako tekst. */
const TEXT_ATTRIBUTES = ['aria-label', 'aria-description', 'aria-roledescription', 'title']

/**
 * Napisy dopuszczone wprost w kodzie — lista CELOWO krótka i imienna.
 * Dopisując pozycję, napisz, dlaczego tekst nie musi być tłumaczony.
 */
const ALLOWED: readonly { file: string; text: string; reason: string }[] = [
	{
		file: 'chart.tsx',
		text: 'dataKey',
		reason: 'nazwa pola w danych, nie tekst dla użytkownika — recharts używa jej jako klucza',
	},
]

interface Finding {
	file: string
	text: string
	line: number
}

/**
 * Zdejmuje komentarze przed skanowaniem.
 *
 * Bez tego test przewraca się na własnej dokumentacji: nagłówek wyjaśniający, że
 * rejestr wpisywał tu `aria-label='Loading'`, wygląda dla wyrażenia regularnego
 * dokładnie tak samo jak kod, który ma zostać zgłoszony.
 *
 * `//` liczy się wyłącznie na początku wiersza — w środku napisu to zwykle część
 * adresu (`https://…`), a nie komentarz.
 */
function withoutComments(source: string): string {
	const blockComment = new RegExp(String.raw`/\*[\s\S]*?\*/`, 'g')
	const lineComment = new RegExp(String.raw`^[ \t]*//.*$`, 'gm')

	return source.replaceAll(blockComment, '').replaceAll(lineComment, '')
}

function sourceFiles(): string[] {
	return readdirSync(UI_DIR)
		.filter(name => name.endsWith('.tsx'))
		.sort()
}

/** Numer wiersza, w którym wypadło dopasowanie — bez niego komunikat nic nie ułatwia. */
function lineOf(source: string, index: number): number {
	return source.slice(0, index).split('\n').length
}

/** Wyłapuje `<span className='sr-only'>Tekst</span>` z napisem wpisanym wprost. */
function srOnlyLiterals(source: string, file: string): Finding[] {
	const pattern = new RegExp(
		String.raw`className=(['"])[^'"]*\bsr-only\b[^'"]*\1\s*>\s*([^<{\s][^<{]*)`,
		'g'
	)

	return [...source.matchAll(pattern)].map(match => ({
		file,
		text: (match[2] ?? '').trim(),
		line: lineOf(source, match.index),
	}))
}

/** Wyłapuje `aria-label='Tekst'` — wartość w nawiasach klamrowych przechodzi. */
function attributeLiterals(source: string, file: string): Finding[] {
	const pattern = new RegExp(String.raw`\b(${TEXT_ATTRIBUTES.join('|')})=(['"])([^'"]+)\2`, 'g')

	return [...source.matchAll(pattern)].map(match => ({
		file,
		text: (match[3] ?? '').trim(),
		line: lineOf(source, match.index),
	}))
}

function isAllowed({ file, text }: Finding): boolean {
	return ALLOWED.some(entry => entry.file === file && entry.text === text)
}

const findings = sourceFiles().flatMap(file => {
	const source = withoutComments(readFileSync(join(UI_DIR, file), 'utf8'))

	return [...srOnlyLiterals(source, file), ...attributeLiterals(source, file)].filter(
		finding => finding.text.length > 0 && !isAllowed(finding)
	)
})

describe('napisy dla czytnika ekranu w components/ui', () => {
	it('żaden nie jest wpisany wprost w kod', () => {
		const listed = findings.map(({ file, line, text }) => `${file}:${line} → "${text}"`)

		expect(
			listed,
			'Te napisy czyta wyłącznie czytnik ekranu, więc muszą iść przez ' +
				'messages/*.json — inaczej polska strona mówi po angielsku. ' +
				'Po `shadcn add --overwrite` nanieś tłumaczenie ponownie.'
		).toEqual([])
	})
})
