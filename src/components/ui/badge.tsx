import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from '@/lib/cva'

import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn.
 * Dodane: warianty statusowe (success, warning, info, outlineDestructive),
 * warianty licznikowe (counter, index), etykieta mono (label) oraz oś `rounded`.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

const badgeVariants = cva(
	'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
				secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
				destructive:
					'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
				outline:
					'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
				ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
				link: 'text-primary underline-offset-4 hover:underline',
				success: 'bg-success-soft text-success-soft-foreground [a]:hover:bg-success-soft/80',
				warning: 'bg-warning-soft text-warning-soft-foreground [a]:hover:bg-warning-soft/80',
				info: 'bg-info-soft text-info-soft-foreground [a]:hover:bg-info-soft/80',
				outlineDestructive: 'border-destructive/50 bg-transparent text-destructive',
				/** Licznik nieprzeczytanych — kwadratowy kształt, wyśrodkowana cyfra. */
				counter:
					'size-5 min-w-5 justify-center bg-primary p-0 text-primary-foreground tabular-nums',
				/** Numer porządkowy kroku lub pozycji na liście. */
				index: 'size-6 justify-center bg-muted p-0 text-muted-foreground tabular-nums',
				/** Etykieta mono — „Zawsze aktywne" przy kategorii cookies. */
				label: 'h-auto bg-secondary px-1.5 py-[3px] font-mono text-[0.6875rem] leading-3.5 font-normal tracking-[0.08em] text-muted-foreground uppercase',
				/**
				 * Tag z gradientem rury — „Rowki" / „Rury" na porównaniu zdjęć,
				 * miasto nad zdjęciem. Półprzezroczysty, z rozmyciem tła.
				 */
				pipe: 'h-auto border-border bg-pipe-glass px-2.5 py-1.5 font-mono text-[0.6875rem] leading-3.5 font-semibold tracking-[0.1em] text-foreground uppercase',
				/** Tag na zdjęciu w karuzeli realizacji — miasto na ciemnym tle. */
				photo: 'h-auto bg-background/80 px-2.5 py-1.5 font-mono text-[0.6875rem] leading-3.5 font-semibold tracking-[0.1em] text-foreground uppercase',
			},
			rounded: {
				/* Z tokenu `--badge-radius` (theme/components.css) — w projekcie 0. */
				default: 'rounded-(--badge-radius)',
				none: 'rounded-none',
				md: 'rounded-md',
				full: 'rounded-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			rounded: 'default',
		},
	}
)

function Badge({
	className,
	variant = 'default',
	rounded = 'default',
	render,
	...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
	return useRender({
		defaultTagName: 'span',
		props: mergeProps<'span'>(
			{
				className: cn(badgeVariants({ variant, rounded }), className),
			},
			props
		),
		render,
		state: {
			slot: 'badge',
			variant,
		},
	})
}

export { Badge, badgeVariants }
