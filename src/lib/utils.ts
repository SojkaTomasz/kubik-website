import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge zna wyłącznie skalę domyślną Tailwinda. Rozmiar spoza niej
 * (`text-body`, `text-display-*` z theme/typography.css) bierze za KOLOR — i przy
 * zderzeniu z prawdziwym kolorem po cichu wyrzuca jedno z dwóch. Tak zginął
 * biały tekst przycisku „Akceptuję": `text-body` z rozmiaru `xl` zjadało
 * `text-primary-foreground` z wariantu, a audyt kontrastu łapał 4,06:1.
 *
 * Każdy nowy token `--text-*` dopisz tutaj.
 *
 * `font-inherit` (globals.css) to grubość dziedziczona po rodzicu — rozmiar `none`
 * przycisku. Jako znana grubość ustępuje `font-bold` podanemu w widoku; zapisana
 * jako `[font-weight:inherit]` wygrywała z nim kolejnością w arkuszu.
 */
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': [{ text: ['body', 'display-xl', 'display-lg', 'display-md', 'display-sm'] }],
			'font-weight': ['font-inherit'],
		},
	},
})

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
