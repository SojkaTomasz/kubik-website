import type * as React from 'react'

import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

const statValueVariants = cva('leading-none font-semibold tabular-nums', {
	variants: {
		tone: {
			default: 'text-foreground',
			primary: 'text-primary',
			muted: 'text-muted-foreground',
			/*
			 * Odcienie statusowe biorą parę `-soft-foreground`, nie kolor pełny.
			 * Kolor pełny jest w tym projekcie projektowany jako TŁO — jako duża
			 * liczba na jasnym podłożu daje kontrast rzędu 2:1 i nie przechodzi
			 * progu WCAG AA. Zasada opisana w AGENTS.md przy kolorach.
			 */
			success: 'text-success-soft-foreground',
			warning: 'text-warning-soft-foreground',
			destructive: 'text-destructive',
		},
		size: {
			sm: 'text-2xl',
			default: 'text-3xl',
			lg: 'text-4xl',
		},
	},
	defaultVariants: {
		tone: 'default',
		size: 'default',
	},
})

export interface StatProps
	extends Omit<React.ComponentProps<'div'>, 'children'>, VariantProps<typeof statValueVariants> {
	label: string
	value: React.ReactNode
	/** Doprecyzowanie pod liczbą — np. „w tym miesiącu". */
	hint?: string
}

/**
 * Kafelek z jedną liczbą — wskaźnik na stronie marketingowej albo w panelu.
 *
 * `tabular-nums` nie jest ozdobnikiem. Bez niego cyfry mają różne szerokości,
 * więc licznik odświeżany na żywo drga przy każdej zmianie wartości, a kolumna
 * kafelków przestaje się równać.
 */
export function Stat({ className, label, value, hint, tone, size, ...props }: StatProps) {
	return (
		<div
			data-slot='stat'
			className={cn(
				'flex flex-col gap-1.5 rounded-(--card-radius) border bg-card p-4',
				className
			)}
			{...props}
		>
			<span
				data-slot='stat-label'
				className='text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase'
			>
				{label}
			</span>
			<span
				data-slot='stat-value'
				className={cn(statValueVariants({ tone, size }))}
			>
				{value}
			</span>
			{hint && (
				<span
					data-slot='stat-hint'
					className='text-xs text-muted-foreground'
				>
					{hint}
				</span>
			)}
		</div>
	)
}

/** Siatka kafelków — zawija się sama, bez ustawiania kolumn w każdym widoku. */
export function StatGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='stat-group'
			className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}
			{...props}
		/>
	)
}

export { statValueVariants }
