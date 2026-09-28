import * as React from 'react'
import { cva, type VariantProps } from '@/lib/cva'

import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn.
 * Dodane warianty statusowe: success, warning, info (rejestr ma tylko
 * default i destructive). Pełna lista zmian rejestru: AGENTS.md.
 */

const alertVariants = cva(
	"group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: 'bg-card text-card-foreground',
				destructive:
					'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
				/*
				 * Warianty statusowe korzystają z tła "soft" z theme/brand.css.
				 * Kolor jest nośnikiem znaczenia, więc ikona jest obowiązkowa —
				 * sam odcień tła nie dociera do osób nierozróżniających barw.
				 */
				success:
					'border-success/35 bg-success-soft text-success-soft-foreground *:data-[slot=alert-description]:text-success-soft-foreground',
				warning:
					'border-warning/35 bg-warning-soft text-warning-soft-foreground *:data-[slot=alert-description]:text-warning-soft-foreground',
				info: 'border-info/35 bg-info-soft text-info-soft-foreground *:data-[slot=alert-description]:text-info-soft-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
)

function Alert({
	className,
	variant,
	...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot='alert'
			role='alert'
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	)
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-title'
			className={cn(
				'font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
				className
			)}
			{...props}
		/>
	)
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-description'
			className={cn(
				'text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
				className
			)}
			{...props}
		/>
	)
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-action'
			className={cn('absolute top-2 right-2', className)}
			{...props}
		/>
	)
}

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants }
