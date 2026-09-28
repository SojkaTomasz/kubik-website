import type * as React from 'react'

import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/**
 * Jedno miejsce, w którym zapada decyzja „jak wygląda tekst".
 *
 * Wariant niesie wygląd, a nie znaczenie — dlatego `as` jest osobnym propsem.
 * Nagłówek sekcji, który wizualnie ma być mały, to `<Typography as='h2'
 * variant='h4'>`, a nie `<h4>`: kolejność nagłówków w dokumencie zostaje
 * poprawna dla czytników ekranu niezależnie od tego, co widzi oko.
 */
const typographyVariants = cva('', {
	variants: {
		variant: {
			displayXl: 'text-display-xl font-semibold text-balance',
			displayLg: 'text-display-lg font-semibold text-balance',
			displayMd: 'text-display-md font-semibold text-balance',
			displaySm: 'text-display-sm font-semibold text-balance',

			h1: 'text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl',
			h2: 'text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl',
			h3: 'text-2xl leading-snug font-semibold tracking-tight sm:text-3xl',
			h4: 'text-xl leading-snug font-semibold tracking-tight sm:text-2xl',
			h5: 'text-lg leading-snug font-semibold sm:text-xl',
			h6: 'text-base leading-snug font-semibold sm:text-lg',

			lead: 'text-lg leading-relaxed text-pretty sm:text-xl',
			body: 'text-base leading-relaxed text-pretty',
			bodySm: 'text-sm leading-relaxed text-pretty',
			caption: 'text-xs leading-normal',
			overline: 'text-xs font-medium tracking-[0.14em] uppercase',
			quote: 'border-l-2 pl-6 text-lg italic',
			code: 'rounded bg-muted px-[0.4em] py-[0.2em] font-mono text-[0.9em]',
		},
		tone: {
			default: '',
			muted: 'text-muted-foreground',
			primary: 'text-primary',
			/*
			 * Odcienie statusowe używają wariantu -soft-foreground, a nie koloru
			 * pełnego. Kolor pełny jest projektowany jako TŁO — jako tekst na bieli
			 * daje kontrast rzędu 2:1 (zmierzone dla --warning: 2,27:1).
			 */
			destructive: 'text-destructive-soft-foreground',
			success: 'text-success-soft-foreground',
			warning: 'text-warning-soft-foreground',
			info: 'text-info-soft-foreground',
		},
		font: {
			inherit: '',
			body: 'font-sans',
			display: 'font-display',
			serif: 'font-serif',
			mono: 'font-mono',
		},
	},
	defaultVariants: {
		variant: 'body',
		tone: 'default',
		font: 'inherit',
	},
})

/**
 * Domyślny tag HTML dla wariantu — używany, gdy nie podano `as`.
 * Trzyma sensowną semantykę bez zmuszania do jej powtarzania przy każdym użyciu.
 */
const defaultElement = {
	displayXl: 'h1',
	displayLg: 'h1',
	displayMd: 'h2',
	displaySm: 'h2',
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
	lead: 'p',
	body: 'p',
	bodySm: 'p',
	caption: 'span',
	overline: 'span',
	quote: 'blockquote',
	code: 'code',
} as const

type TypographyVariant = keyof typeof defaultElement

export interface TypographyProps
	extends Omit<React.ComponentProps<'p'>, 'color'>, VariantProps<typeof typographyVariants> {
	/** Nadpisuje tag wynikający z wariantu. Ustaw, gdy wygląd rozjeżdża się z semantyką. */
	as?: React.ElementType
	// Kształt propsów pochodzi od `<p>`, więc bez tego `as='time'` nie przyjmuje
	// `dateTime`. Celowo wąskie: nie rozluźnia typów już istniejących propsów.
	dateTime?: string
	datetime?: never
}

export function Typography({ className, variant, tone, font, as, ...props }: TypographyProps) {
	const Component = as ?? defaultElement[(variant ?? 'body') as TypographyVariant]

	return (
		<Component
			data-slot='typography'
			className={cn(typographyVariants({ variant, tone, font }), className)}
			{...props}
		/>
	)
}

export { defaultElement as typographyElements, typographyVariants }
