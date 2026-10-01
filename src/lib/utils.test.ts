import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/utils'

/**
 * `cn` łączy clsx z tailwind-merge. Sama konkatenacja klas nie wystarcza:
 * w Tailwindzie o wyniku decyduje kolejność w arkuszu, a nie w atrybucie class,
 * więc `px-2 px-4` daje efekt zależny od tego, która reguła jest niżej w CSS.
 * tailwind-merge rozstrzyga to za nas — wygrywa klasa podana później.
 */
describe('cn', () => {
	it('łączy klasy', () => {
		expect(cn('flex', 'items-center')).toBe('flex items-center')
	})

	it('pomija wartości fałszywe', () => {
		expect(cn('flex', false && 'hidden', undefined, null, '')).toBe('flex')
	})

	it('obsługuje zapis warunkowy', () => {
		expect(cn('rounded', { 'shadow-md': true, border: false })).toBe('rounded shadow-md')
	})

	it('traktuje flex i hidden jako konflikt, bo obie ustawiają display', () => {
		// Nieoczywiste, ale poprawne: `cn('flex', 'hidden')` NIE daje obu klas.
		// Warunkowe ukrywanie elementu z domyślnym `flex` działa więc od ręki,
		// bez ręcznego usuwania klasy układu.
		expect(cn('flex', 'hidden')).toBe('hidden')
		expect(cn('flex', { hidden: false })).toBe('flex')
	})

	it('rozstrzyga konflikt na rzecz klasy podanej później', () => {
		// To jest właściwy powód istnienia tej funkcji: props `className`
		// z zewnątrz musi umieć nadpisać wartość domyślną komponentu.
		expect(cn('px-2', 'px-4')).toBe('px-4')
		expect(cn('text-sm text-muted-foreground', 'text-lg')).toBe('text-muted-foreground text-lg')
	})

	it('zna rozmiary tekstu spoza skali Tailwinda', () => {
		// Bez rozszerzenia `text-body` uchodziło za kolor i wyrzucało prawdziwy
		// kolor tekstu — biały napis na czerwonym przycisku stawał się szary.
		expect(cn('text-sm text-primary-foreground', 'text-body')).toBe(
			'text-primary-foreground text-body'
		)
		expect(cn('text-muted-foreground', 'text-display-sm')).toBe(
			'text-muted-foreground text-display-sm'
		)
	})

	it('nie miesza klas z różnych grup', () => {
		expect(cn('px-2', 'py-4')).toBe('px-2 py-4')
	})

	it('rozumie warianty responsywne i stanowe jako osobne grupy', () => {
		expect(cn('px-2', 'md:px-4')).toBe('px-2 md:px-4')
		expect(cn('bg-white', 'hover:bg-black')).toBe('bg-white hover:bg-black')
	})
})
