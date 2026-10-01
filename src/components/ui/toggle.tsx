'use client'

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { cva, type VariantProps } from '@/lib/cva'

import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: zaokrąglenie z tokenu
 * `--button-radius`, wariant `chip` (filtry realizacji) i rozmiar `lg` pod niego.
 * `shadcn add --overwrite` to skasuje. Pełna lista: AGENTS.md.
 */

const toggleVariants = cva(
	"group/toggle inline-flex cursor-pointer items-center justify-center gap-1 rounded-(--button-radius) text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: 'bg-transparent',
				outline: 'border border-input bg-transparent hover:bg-muted',
				/**
				 * Filtr listy realizacji („Wszystkie", „Dom", „Mieszkanie"). Wybrany
				 * odwraca kolory: jasne tło, ciemny tekst. Z `size='lg'`.
				 */
				chip: 'border border-border bg-transparent text-foreground hover:border-muted-foreground hover:bg-transparent aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:font-semibold aria-pressed:text-background',
			},
			size: {
				default:
					'h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				sm: "h-7 min-w-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				/** 38 px — filtry realizacji (Paper: odstępy 10 / 16 px, tekst 15 px). */
				lg: 'h-9.5 min-w-9 px-4 text-[0.9375rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

function Toggle({
	className,
	variant = 'default',
	size = 'default',
	...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
	return (
		<TogglePrimitive
			data-slot='toggle'
			className={cn(toggleVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

export { Toggle, toggleVariants }
