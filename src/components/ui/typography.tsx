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
			/*
			 * Skala ze styleguide'u w Paperze („02 · Typografia"), rozmiary dla
			 * telefonu / tabletu / desktopu. Unbounded z ujemnym trackingiem;
			 * `font-heading` wpisane jawnie, bo wariant bywa renderowany jako `<p>`.
			 */
			/** H1 · hero — 44 / 64 / 96 px, 800. */
			displayXl: 'font-heading text-display-xl font-extrabold text-balance',
			/** Hero podstron — polityka, 404 (40 → 88 px), 800. */
			displayLg: 'font-heading text-display-lg font-extrabold text-balance',
			/** H2 · sekcja — 32 / 44 / 56 px, 700. */
			displayMd: 'font-heading text-display-md font-bold text-balance',
			/** Tytuł okna i formularza — „Ile to kosztuje u Ciebie?" (26 → 36 px), 800. */
			displaySm: 'font-heading text-display-sm font-extrabold text-balance',

			h1: 'font-heading text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance sm:text-5xl',
			h2: 'font-heading text-3xl leading-[1.1] font-bold tracking-[-0.03em] text-balance sm:text-4xl',
			/** H3 · karta, krok — 18 / 20 / 22 px, 700. */
			h3: 'font-heading text-lg leading-snug font-bold tracking-[-0.01em] md:text-xl lg:text-[1.375rem]',
			h4: 'font-heading text-lg leading-snug font-bold tracking-[-0.01em]',
			h5: 'font-heading text-base leading-snug font-bold',
			h6: 'font-heading text-sm leading-snug font-bold',

			/** Lead — 17 / 19 / 20 px, interlinia 1,5. */
			lead: 'text-body leading-normal text-pretty md:text-[1.1875rem] lg:text-xl',
			/** Body — 16 / 17 / 17 px, interlinia ~1,55. */
			body: 'text-base leading-relaxed text-pretty md:text-body',
			bodySm: 'text-sm leading-relaxed text-pretty',
			caption: 'text-xs leading-normal',
			/*
			 * Label · mono — 12 / 12 / 13 px. Etykieta nad nagłówkiem sekcji
			 * („01 · Jak to działa", z `tone='primary'`) i nad polem formularza.
			 */
			overline:
				'font-mono text-xs leading-4 font-medium tracking-[0.12em] uppercase lg:text-[0.8125rem]',
			/** Dane techniczne pod tytułem — „60 m² · cement · 1 dzień", „Mariusz N. · Google". */
			meta: 'font-mono text-[0.8125rem] leading-4 font-medium tracking-[0.04em] text-muted-foreground uppercase',
			/** Cytat z opinii — 22 px, bez kursywy i bez kreski, jak w projekcie. */
			quote: 'text-xl leading-[1.41] font-medium tracking-[-0.01em] text-pretty md:text-[1.375rem]',
			code: 'rounded bg-muted px-[0.4em] py-[0.2em] font-mono text-[0.9em]',
		},
		tone: {
			default: '',
			muted: 'text-muted-foreground',
			/* Czerwień do TEKSTU — kolor pełny daje jako mały napis 4,03:1. */
			primary: 'text-hot-text',
			/** Zimny akcent — „Nie nadaje się", miasto drugiej realizacji. */
			cold: 'text-cold-text',
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
	meta: 'span',
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
