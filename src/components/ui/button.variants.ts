/**
 * Warianty w osobnym module BEZ 'use client': eksporty modułu klienckiego docierają
 * na serwer jako puste skorupy bez `variantsConfig`, więc strony /dev dostawałyby
 * pustą listę — bez żadnego błędu. Stosuj to przy każdym kliencie z wariantami.
 */
import { cva } from '@/lib/cva'

const buttonVariants = cva(
	"group/button inline-flex shrink-0 cursor-pointer items-center justify-center border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				/*
				 * Warianty ze styleguide'u w Paperze („04 · Przyciski i pola"):
				 * primary · hot, call · cold, dark · na gradiencie, outline, icon · slider.
				 */

				/* Czerwona akcja główna — „Darmowa wycena", „Akceptuję". */
				default:
					'bg-primary font-bold text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),black_14%)]',
				/* Niebieski „Zadzwoń" z ikoną telefonu — pasek na telefonie, menu. */
				call: 'bg-cold font-bold text-cold-foreground hover:bg-[color-mix(in_oklab,var(--cold),black_14%)]',
				/*
				 * Obrys 1 px w kolorze tekstu, strzałka przy prawej krawędzi —
				 * „Jak to wygląda →", „Ustawienia". Aktywna strzałka karuzeli.
				 */
				outline:
					// Zablokowany nie blednie, tylko gaśnie do koloru linii — tak w projekcie
					// wygląda strzałka karuzeli, gdy nie ma już dokąd przewinąć.
					'border-foreground bg-transparent text-foreground hover:bg-foreground/8 disabled:border-border disabled:opacity-100 has-data-[icon=inline-end]:justify-between aria-expanded:bg-foreground/8',
				/*
				 * Obrys w kolorze linii — rzeczy drugiego planu: numer telefonu
				 * w nagłówku, nieaktywna strzałka karuzeli, strzałka karty realizacji.
				 */
				secondary:
					'border-border bg-transparent text-foreground hover:border-muted-foreground aria-expanded:border-muted-foreground',
				/* Ciemny na pasie z gradientem rury — „Darmowa wycena →" w CtaBand. */
				dark: 'border-border bg-background text-foreground hover:bg-card has-data-[icon=inline-end]:justify-between',
				/*
				 * Pozycje nawigacji i ikony bez tła. Wyciszone w spoczynku; pozycja
				 * bieżąca (`aria-current` z NavLink) dostaje pigułkę jak w projekcie.
				 */
				ghost: 'text-muted-foreground hover:bg-foreground/8 hover:text-foreground aria-expanded:bg-foreground/8 aria-expanded:text-foreground aria-[current]:bg-foreground/8 aria-[current]:text-foreground',
				destructive:
					'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
				/* Podkreślony tekst — „Polityka prywatności" w treści, „Nie teraz". */
				link: 'text-muted-foreground underline decoration-1 underline-offset-4 hover:text-foreground',
			},
			size: {
				default:
					'h-10 gap-2 px-4 text-[0.9375rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
				xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 gap-1.5 px-3 text-sm has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
				/** Przycisk w nagłówku strony — „Darmowa wycena" na pasku nawigacji. */
				lg: "h-12 gap-2.5 px-5 text-[0.9375rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-[1.125rem]",
				/** Przycisk wiodący — 56 px na telefonie, 60 px od tabletu (Paper). */
				xl: "h-14 gap-2.5 px-6 text-body has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 md:h-15 md:px-8 [&_svg:not([class*='size-'])]:size-5",
				icon: 'size-10',
				'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-8',
				/** Krzyżyk okna, strzałki opinii i karty realizacji — 44 px, minimalny cel dotykowy. */
				'icon-lg': "size-11 [&_svg:not([class*='size-'])]:size-[1.125rem]",
				/** Strzałki karuzeli realizacji — 56 / 60 px, w parze z `xl`. */
				'icon-xl': "size-14 md:size-15 [&_svg:not([class*='size-'])]:size-[1.125rem]",
				/** Bez własnych wymiarów — przycisk zachowuje się jak zwykły tekst: krój, wielkość i grubość po akapicie, w którym stoi. */
				none: 'h-auto gap-1.5 p-0 text-[length:inherit] leading-[inherit] font-inherit whitespace-normal',
			},
			/**
			 * Zaokrąglenie. Domyślne `theme` bierze wartość z tokenu `--button-radius`
			 * (theme/components.css), więc kanciaste przyciski przy zaokrąglonych kartach
			 * to zmiana jednej linii CSS, a nie przeglądanie klas w widokach.
			 */
			radius: {
				theme: 'rounded-(--button-radius)',
				none: 'rounded-none',
				sm: 'rounded-sm',
				md: 'rounded-md',
				lg: 'rounded-lg',
				xl: 'rounded-xl',
				full: 'rounded-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			radius: 'theme',
		},
	}
)

/**
 * Mikroanimacja ikony przy najechaniu na przycisk.
 *
 * Sterowana klasą `group/button` na przycisku, więc ikona reaguje na hover
 * całego przycisku, a nie tylko na siebie. Wszystkie efekty są wyłącznie
 * transformacjami — nie ruszają układu, więc nic wokół nie drga.
 */
export type ButtonIconEffect =
	'none' | 'scale' | 'shiftRight' | 'shiftLeft' | 'translateY' | 'rotate'

const iconEffectClasses: Record<ButtonIconEffect, string> = {
	none: '',
	scale: 'transition-transform duration-200 ease-out group-hover/button:scale-125',
	shiftRight: 'transition-transform duration-200 ease-out group-hover/button:translate-x-1',
	shiftLeft: 'transition-transform duration-200 ease-out group-hover/button:-translate-x-1',
	translateY: 'transition-transform duration-200 ease-out group-hover/button:-translate-y-0.5',
	rotate: 'transition-transform duration-300 ease-out group-hover/button:rotate-180',
}

export { buttonVariants, iconEffectClasses }
