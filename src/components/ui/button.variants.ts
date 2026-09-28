/**
 * Warianty w osobnym module BEZ 'use client': eksporty modułu klienckiego docierają
 * na serwer jako puste skorupy bez `variantsConfig`, więc strony /dev dostawałyby
 * pustą listę — bez żadnego błędu. Stosuj to przy każdym kliencie z wariantami.
 */
import { cva } from '@/lib/cva'

const buttonVariants = cva(
	"group/button inline-flex shrink-0 cursor-pointer items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80',
				outline:
					'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
				destructive:
					'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default:
					'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				/** Wysokość dla przycisków wiodących na stronach marketingowych. */
				xl: 'h-11 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
				icon: 'size-8',
				'icon-xs':
					"size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
				'icon-sm':
					'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
				'icon-lg': 'size-9',
				/** Bez własnych wymiarów — przycisk zachowuje się jak zwykły tekst. */
				none: 'h-auto gap-1.5 p-0',
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
