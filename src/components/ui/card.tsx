import * as React from 'react'

import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn.
 * Dodana oś `variant` (modal, accent, interactive, flat, framed) i rozmiar `lg` —
 * rejestr ma tylko oś `size` z dwiema wartościami. Stopka bez własnego tła i linii.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

const cardVariants = cva(
	'group/card relative flex flex-col gap-(--card-spacing) overflow-hidden rounded-(--card-radius) bg-card py-(--card-spacing) text-sm text-card-foreground [--card-spacing:--spacing(4)] has-[>img:first-child]:pt-0 data-[size=lg]:[--card-spacing:--spacing(5)] data-[size=sm]:[--card-spacing:--spacing(3)] md:data-[size=lg]:[--card-spacing:--spacing(10)] lg:data-[size=lg]:[--card-spacing:--spacing(12)] *:[img:first-child]:rounded-t-(--card-radius) *:[img:last-child]:rounded-b-(--card-radius)',
	{
		variants: {
			variant: {
				/* Powierzchnia bez obrysu — w projekcie kartę odcina od tła sam kolor. */
				default: '',
				/**
				 * Karta w roli okna (baner zgód): pasek rury u góry i głęboki cień,
				 * jak okna z `dialog.tsx`. Do użycia z `size='lg'`.
				 */
				modal: 'pipe-bar shadow-modal',
				/** Wyróżniony blok w treści — pionowa kreska w zimnym akcencie. */
				accent: 'border-l-3 border-cold',
				/**
				 * Karta jako całość klikalna. Uniesienie na hover sygnalizuje
				 * interaktywność, a widoczny pierścień fokusa jest tu obowiązkowy —
				 * bez niego karta jest nieosiągalna z klawiatury.
				 */
				interactive:
					'cursor-pointer ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
				/** Bez obramowania i cienia — do grupowania treści na jednolitym tle. */
				flat: 'bg-transparent ring-0',
				/**
				 * Karta z paskiem nagłówka na pełną szerokość. Padding wnoszą sekcje
				 * w środku, więc nagłówek może mieć własne tło i linię oddzielającą.
				 */
				framed:
					'gap-0 py-0 ring-1 ring-foreground/10 [&>[data-slot=card-header]]:py-(--card-spacing)',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
)

function Card({
	className,
	size = 'default',
	variant = 'default',
	...props
}: React.ComponentProps<'div'> &
	VariantProps<typeof cardVariants> & {
		/** `lg` — odstępy okna: 20 / 40 / 48 px (telefon / tablet / desktop). */
		size?: 'default' | 'sm' | 'lg'
	}) {
	return (
		<div
			data-slot='card'
			data-size={size}
			className={cn(cardVariants({ variant }), className)}
			{...props}
		/>
	)
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-header'
			className={cn(
				'group/card-header @container/card-header grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)',
				className
			)}
			{...props}
		/>
	)
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-title'
			className={cn(
				'font-heading text-lg leading-snug font-extrabold tracking-[-0.02em] group-data-[size=sm]/card:text-base',
				className
			)}
			{...props}
		/>
	)
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-description'
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	)
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-action'
			className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
			{...props}
		/>
	)
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-content'
			className={cn('px-(--card-spacing)', className)}
			{...props}
		/>
	)
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='card-footer'
			// Bez tła i linii: w projekcie przyciski stoją wprost na karcie.
			className={cn('flex items-center px-(--card-spacing)', className)}
			{...props}
		/>
	)
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
	cardVariants,
}
