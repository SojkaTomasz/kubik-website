import type * as React from 'react'

import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

const specListVariants = cva('flex flex-col', {
	variants: {
		appearance: {
			/**
			 * Karta techniczna — etykieta mono z lewej, wartość pogrubiona z prawej:
			 * „TYPOWA WYLEWKA — cementowa, 5–7 cm" (strona miasta).
			 */
			spec: '[&_[data-slot=spec-list-term]]:font-mono [&_[data-slot=spec-list-term]]:text-xs [&_[data-slot=spec-list-term]]:leading-4 [&_[data-slot=spec-list-term]]:tracking-[0.08em] [&_[data-slot=spec-list-term]]:text-muted-foreground [&_[data-slot=spec-list-term]]:uppercase [&_[data-slot=spec-list-value]]:text-base [&_[data-slot=spec-list-value]]:leading-5 [&_[data-slot=spec-list-value]]:font-semibold',
			/**
			 * Lista cech — tekst z lewej, dopisek mono z prawej: „Pod pompę ciepła —
			 * niska temp." (sekcja „Nadaje się"). Wartość jest opcjonalna.
			 */
			feature:
				'[&_[data-slot=spec-list-term]]:text-body [&_[data-slot=spec-list-term]]:leading-snug [&_[data-slot=spec-list-value]]:font-mono [&_[data-slot=spec-list-value]]:text-[0.8125rem] [&_[data-slot=spec-list-value]]:leading-4 [&_[data-slot=spec-list-value]]:text-muted-foreground',
		},
		tone: {
			default: '',
			/** Cała lista przygaszona — „Nie nadaje się". */
			muted: '[&_[data-slot=spec-list-term]]:text-muted-foreground',
		},
	},
	defaultVariants: {
		appearance: 'spec',
		tone: 'default',
	},
})

/**
 * Lista par „etykieta — wartość" oddzielonych liniami.
 *
 * `<dl>`, nie układ z `div`ów: czytnik ekranu ogłasza parę jako termin i jego
 * opis, więc „Typowa wylewka: cementowa" nie rozpada się na dwa luźne napisy.
 */
function SpecList({
	className,
	appearance,
	tone,
	...props
}: React.ComponentProps<'dl'> & VariantProps<typeof specListVariants>) {
	return (
		<dl
			data-slot='spec-list'
			className={cn(specListVariants({ appearance, tone }), className)}
			{...props}
		/>
	)
}

export interface SpecListItemProps extends Omit<React.ComponentProps<'div'>, 'children'> {
	label: React.ReactNode
	/** Bez wartości wiersz pokazuje sam termin — „Podłoga drewniana na legarach". */
	value?: React.ReactNode
}

function SpecListItem({ className, label, value, ...props }: SpecListItemProps) {
	return (
		<div
			data-slot='spec-list-item'
			className={cn(
				'flex items-center justify-between gap-4 border-t py-4 last:border-b',
				className
			)}
			{...props}
		>
			<dt data-slot='spec-list-term'>{label}</dt>
			{value !== undefined && (
				<dd
					data-slot='spec-list-value'
					className='shrink-0 text-right'
				>
					{value}
				</dd>
			)}
		</div>
	)
}

export { SpecList, SpecListItem, specListVariants }
