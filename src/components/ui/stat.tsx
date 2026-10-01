import type * as React from 'react'

import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 *
 * Kubik: liczba krojem nagłówkowym, podpis mono wersalikami, bez kafelka —
 * pozycje oddzielają pionowe linie grupy (`StatGroup`).
 */

const statValueVariants = cva('font-heading leading-none tabular-nums', {
	variants: {
		tone: {
			default: 'text-foreground',
			primary: 'text-hot-text',
			muted: 'text-muted-foreground',
			/*
			 * Odcienie statusowe biorą parę `-soft-foreground`, nie kolor pełny.
			 * Kolor pełny jest w tym projekcie projektowany jako TŁO — jako liczba
			 * daje kontrast poniżej progu WCAG AA. Zasada opisana w AGENTS.md.
			 */
			success: 'text-success-soft-foreground',
			warning: 'text-warning-soft-foreground',
			destructive: 'text-destructive-soft-foreground',
		},
		size: {
			/** Wartość w karcie technicznej — „60 m²", „Cementowa" (20 px). */
			sm: 'text-xl font-bold',
			/** Licznik w pasku dowodu — „1200+", „15" (28 px). */
			default: 'text-[1.75rem] font-extrabold tracking-[-0.04em]',
			/** Duża liczba — ocena „5,0" przy opiniach (44 → 96 px). */
			lg: 'text-display-xl font-extrabold tracking-[-0.05em]',
		},
	},
	defaultVariants: {
		tone: 'default',
		size: 'default',
	},
})

const statVariants = cva('flex gap-1', {
	variants: {
		layout: {
			/** Liczba nad podpisem — „1200+ / ZLECEŃ". */
			figure: 'flex-col-reverse justify-end',
			/** Podpis nad wartością — karta techniczna realizacji „METRAŻ / 60 m²". */
			spec: 'flex-col',
		},
	},
	defaultVariants: {
		layout: 'figure',
	},
})

export interface StatProps
	extends
		Omit<React.ComponentProps<'div'>, 'children'>,
		VariantProps<typeof statValueVariants>,
		VariantProps<typeof statVariants> {
	label: string
	value: React.ReactNode
	/** Doprecyzowanie pod liczbą — np. „w tym miesiącu". */
	hint?: string
}

/**
 * Jedna liczba z podpisem — pasek dowodu na stronie głównej, karta techniczna
 * realizacji.
 *
 * `tabular-nums` nie jest ozdobnikiem. Bez niego cyfry mają różne szerokości,
 * więc licznik animowany od zera drga przy każdej zmianie wartości.
 */
export function Stat({ className, label, value, hint, tone, size, layout, ...props }: StatProps) {
	return (
		<div
			data-slot='stat'
			className={cn(statVariants({ layout }), className)}
			{...props}
		>
			{/* Podpis stoi w DOM-ie przed liczbą w obu układach — czytnik ekranu
			    słyszy „Zleceń: 1200+", kolejność na ekranie ustawia `flex-col-reverse`. */}
			<span
				data-slot='stat-label'
				className='font-mono text-[0.6875rem] leading-3.5 tracking-[0.08em] text-muted-foreground uppercase'
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
					className='order-first text-sm text-muted-foreground'
				>
					{hint}
				</span>
			)}
		</div>
	)
}

const statGroupVariants = cva('w-full', {
	variants: {
		layout: {
			/** Rząd równych kolumn z pionową linią przed każdą kolejną. */
			row: 'flex *:flex-1 *:not-first:border-l *:not-first:pl-4 md:*:not-first:pl-8',
			/** Siatka 2 × n w liniach — karta techniczna realizacji. */
			grid: 'grid grid-cols-2 border-t *:border-b *:py-4 *:even:border-l *:even:pl-4',
		},
	},
	defaultVariants: {
		layout: 'row',
	},
})

/** Grupa liczb — linie między pozycjami rysuje grupa, nie pojedynczy `Stat`. */
export function StatGroup({
	className,
	layout,
	...props
}: React.ComponentProps<'div'> & VariantProps<typeof statGroupVariants>) {
	return (
		<div
			data-slot='stat-group'
			className={cn(statGroupVariants({ layout }), className)}
			{...props}
		/>
	)
}

export { statGroupVariants, statValueVariants, statVariants }
