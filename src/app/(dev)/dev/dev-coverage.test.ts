import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Kompletność stron `/dev`: komponent bez próbki jest w praktyce niewidoczny,
 * więc powstanie zamiast niego doraźny markup w widoku. `shadcn add` dokłada
 * plik i nic tego nie zgłasza — ani kompilacja, ani lint.
 *
 * SPRAWDZAMY EKSPORTY, NIE PLIKI. Wersja pytająca o import dawała fałszywe
 * pokrycie: 65 modułów miało próbkę, a ponad sto eksportów nie renderowało się
 * nigdzie. Jeden import wystarczał na cały plik.
 */

const UI_DIR = join(process.cwd(), 'src', 'components', 'ui')
const SECTIONS_DIR = join(process.cwd(), 'src', 'app', '(dev)', 'dev', 'components', '_sections')

/**
 * Eksporty bez własnej próbki — tylko to, co renderuje rodzic albo co nie rysuje
 * niczego. Wszystko, co pisze użytkownik komponentu, MUSI mieć próbkę, inaczej
 * lista zamienia się w miejsce na chowanie długów.
 */
const NO_SAMPLE: Readonly<Record<string, string>> = {
	AlertDialogPortal: 'portal — przenosi treść, nie rysuje niczego',
	ContextMenuPortal: 'portal — przenosi treść, nie rysuje niczego',
	DialogPortal: 'portal — przenosi treść, nie rysuje niczego',
	DrawerPortal: 'portal — przenosi treść, nie rysuje niczego',
	DropdownMenuPortal: 'portal — przenosi treść, nie rysuje niczego',
	MenubarPortal: 'portal — przenosi treść, nie rysuje niczego',
	AlertDialogOverlay: 'tło warstwy — renderuje je Content, nie piszący widok',
	DialogOverlay: 'tło warstwy — renderuje je Content, nie piszący widok',
	DrawerOverlay: 'tło warstwy — renderuje je Content, nie piszący widok',
	NavigationMenuPositioner: 'wewnętrzne pozycjonowanie — składa je Content',
	NavigationMenuIndicator: 'wewnętrzna strzałka — składa ją Content',
	TooltipProvider: 'provider — Tooltip niesie go u siebie',
	ChartStyle: 'wstrzykuje zmienne CSS, nie ma własnego wyglądu',

	// Renderuje je rodzic, więc w JSX-ie widoku nie mają prawa się pojawić.
	ScrollBar: 'renderuje go ScrollArea (dziś tylko pionowy)',
	CalendarDayButton: 'Calendar podaje go DayPickerowi przez `components`',
	SelectScrollUpButton: 'renderuje go SelectContent',
	SelectScrollDownButton: 'renderuje go SelectContent',
	ProgressTrack: 'renderuje go Progress',
	ProgressIndicator: 'renderuje go Progress',
	// Renderuje go `ComboboxInput`. Drugie opakowanie dawało dwa elementy bez
	// nazwy dostępnej — próbka pokazywałaby wzorzec, którego zabraniamy.
	ComboboxTrigger: 'renderuje go ComboboxInput — patrz triggerLabel w AGENTS.md',
	DrawerSwipeHandle: 'renderuje go DrawerContent przy `showSwipeHandle` na Drawer',

	// Warstwa sterowana IMPERATYWNIE: widok woła `toast.add(...)`, nikt nie
	// pisze `<ToastTitle>` ręcznie.
	Toaster: 'montowany raz w Providers',
	ToastProvider: 'składowa Toastera',
	ToastPortal: 'składowa Toastera',
	ToastViewport: 'składowa Toastera',
	Toast: 'renderowany przez Toastera z danych `toast.add`',
	ToastContent: 'renderowany przez Toastera z danych `toast.add`',
	ToastTitle: 'renderowany przez Toastera z danych `toast.add`',
	ToastDescription: 'renderowany przez Toastera z danych `toast.add`',
	ToastAction: 'renderowany przez Toastera z danych `toast.add`',
	ToastClose: 'renderowany przez Toastera z danych `toast.add`',
}

/** Komponenty eksportowane przez `components/ui`, po nazwie. */
function uiExports(): { name: string; module: string }[] {
	const found: { name: string; module: string }[] = []

	for (const file of readdirSync(UI_DIR)) {
		if (!/\.tsx$/.test(file) || file.includes('.test.')) continue

		const source = readFileSync(join(UI_DIR, file), 'utf8')
		const moduleName = file.replace(/\.tsx$/, '')

		// Wielka litera odsiewa funkcje pomocnicze i definicje wariantów.
		const add = (name: string) => {
			if (/^[A-Z]\w*$/.test(name)) found.push({ name, module: moduleName })
		}

		for (const block of source.matchAll(/export\s*\{([^}]*)\}/gs)) {
			// `Foo as Bar` eksportuje pod nazwą po `as`.
			for (const entry of (block[1] ?? '').split(','))
				add(entry.split(' as ').pop()?.trim() ?? '')
		}

		// Eksport przy deklaracji, obok bloku `export { … }`. Czytanie samych
		// bloków zostawiało kompozyty (`Container`, `Section`, `Prose`) poza strażnikiem.
		for (const match of source.matchAll(/export\s+(?:function|const)\s+(\w+)/g))
			add(match[1] ?? '')
	}

	return found.sort((a, b) => a.name.localeCompare(b.name))
}

/** Kod wszystkich sekcji sklejony w jeden ciąg — szukamy w nim użyć w JSX-ie. */
function sectionsSource(): string {
	return readdirSync(SECTIONS_DIR)
		.filter(file => /\.tsx$/.test(file) && !file.includes('.test.'))
		.map(file => readFileSync(join(SECTIONS_DIR, file), 'utf8'))
		.join('\n')
}

describe('strony /dev pokazują cały rejestr', () => {
	const source = sectionsSource()
	const exported = uiExports()

	// UŻYCIE W JSX-ie, nie import: import mówi tylko, że nazwa przeszła przez plik.
	const isRendered = (name: string) =>
		new RegExp(`<${name}[\\s/>]`).test(source) ||
		new RegExp(`render=\\{<${name}[\\s/>]`).test(source)

	it('znajduje komponenty do sprawdzenia', () => {
		// Zabezpieczenie przed testem, który przechodzi, bo nic nie znalazł.
		expect(exported.length).toBeGreaterThan(300)
		expect(source.length).toBeGreaterThan(1000)
	})

	it('lista wyjątków nie zawiera martwych wpisów', () => {
		const names = new Set(exported.map(entry => entry.name))
		const stale = Object.keys(NO_SAMPLE).filter(name => !names.has(name))

		// Wyjątek dla nieistniejącego eksportu to ślad po komponencie, którego już
		// nie ma — i cicha dziura, gdyby nazwa kiedyś wróciła w innej roli.
		expect(stale).toEqual([])
	})

	for (const { name, module } of exported) {
		const reason = NO_SAMPLE[name]

		if (reason) {
			it.skip(`${name} — bez próbki: ${reason}`, () => {})
			continue
		}

		it(`${name} (${module}) jest renderowany na /dev`, () => {
			expect(
				isRendered(name),
				`Komponent "${name}" z components/ui/${module} nie jest renderowany w żadnej sekcji ` +
					'strony /dev. Dołóż próbkę w app/(dev)/dev/components/_sections/ — bez tego nikt ' +
					'się o nim nie dowie i skończy się doraźnym markupem w widoku. Jeśli komponent ' +
					'naprawdę nie ma własnego wyglądu, dopisz go do NO_SAMPLE wraz z powodem.'
			).toBe(true)
		})
	}
})
