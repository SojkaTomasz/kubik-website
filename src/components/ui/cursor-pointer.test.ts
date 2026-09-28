import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Kursor na elementach klikalnych. Tailwind 4 zdjął przyciskom `cursor: pointer`,
 * a brak klasy nie daje ani błędu, ani ostrzeżenia — widać go wyłącznie kursorem
 * nad elementem. `shadcn add --overwrite` przywraca `cursor-default` przy każdej
 * aktualizacji rejestru, więc mechanizm potrzebuje strażnika.
 *
 * Reguła w `globals.css` jest SIATKĄ, nie źródłem prawdy: działa tylko na
 * `<button>` i wybrane role, a przez `@layer base` przegrywa z każdą utility.
 */

const UI_DIR = join(process.cwd(), 'src', 'components', 'ui')

/**
 * Moduły z elementem klikalnym, z powodem przy każdym. Lista jest jawna, bo
 * „element klikalny" nie wynika z niczego, co da się odczytać z pliku —
 * `Popover` też ma trigger, tyle że jako goły re-eksport bez `className`.
 */
const CLICKABLE: Readonly<Record<string, string>> = {
	'button.variants.ts': 'klasa bazowa przycisku — niesie ją też Pagination, Carousel i Toast',
	'accordion.tsx': 'nagłówek rozwijający sekcję',
	'attachment.tsx': 'przezroczysty trigger przykrywający kafelek',
	'breadcrumb.tsx': 'ogniwo ścieżki',
	'carousel-dots.tsx': 'kropka przeskakująca do slajdu',
	'checkbox.tsx': 'pole wyboru',
	'combobox.tsx': 'pozycja listy',
	'command.tsx': 'pozycja palety poleceń',
	'context-menu.tsx': 'pozycje, podmenu, pozycje przełączane',
	'dropdown-menu.tsx': 'pozycje, podmenu, pozycje przełączane',
	'item.tsx': 'wariant kotwicy (`[a]:cursor-pointer`)',
	'label.tsx': 'etykieta przełącza kontrolkę, którą obejmuje',
	'menubar.tsx': 'pozycje przełączane — reszta idzie przez DropdownMenu',
	'native-select.tsx': 'natywny <select>',
	'navigation-menu.tsx': 'trigger i link',
	'radio-group.tsx': 'przycisk opcji',
	'select.tsx': 'trigger, pozycje, strzałki przewijania',
	'sidebar.tsx': 'przycisk menu, akcje grupy i pozycji, link podmenu',
	'slider.tsx': 'uchwyt',
	'switch.tsx': 'przełącznik',
	'tabs.tsx': 'zakładka',
	'toggle.tsx': 'klasa bazowa — niesie ją też ToggleGroupItem',
}

function read(file: string): string {
	return readFileSync(join(UI_DIR, file), 'utf8')
}

describe('elementy klikalne mają cursor-pointer', () => {
	for (const [file, reason] of Object.entries(CLICKABLE)) {
		it(`${file} — ${reason}`, () => {
			expect(read(file)).toContain('cursor-pointer')
		})
	}

	it('żaden komponent nie został z cursor-default z rejestru', () => {
		const offenders = Object.keys(CLICKABLE).filter(file => read(file).includes('cursor-default'))

		expect(offenders).toEqual([])
	})
})
