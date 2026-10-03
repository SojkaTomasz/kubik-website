import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from '@/lib/cva'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: warianty `line` i `rail`,
 * rozmiar `flush`. `shadcn add --overwrite` to skasuje. Pełna lista: AGENTS.md.
 */

function ItemGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			role='list'
			data-slot='item-group'
			className={cn(
				'group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2',
				className
			)}
			{...props}
		/>
	)
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-slot='item-separator'
			orientation='horizontal'
			className={cn('my-2', className)}
			{...props}
		/>
	)
}

const itemVariants = cva(
	'group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:cursor-pointer [a]:transition-colors [a]:hover:bg-muted',
	{
		variants: {
			variant: {
				default: 'border-transparent',
				outline: 'border-border',
				muted: 'border-transparent bg-muted/50',
				/**
				 * Wiersz listy oddzielony linią — skróty na 404, tabela danych
				 * w polityce. Ostatni wiersz domyka listę linią od dołu. Z `size='flush'`.
				 */
				line: 'rounded-none border-0 border-t border-border last:border-b [&_[data-slot=item-title]]:text-body [&_[data-slot=item-title]]:font-semibold [a]:hover:bg-transparent [a]:hover:text-hot-text',
				/**
				 * Pozycja spisu treści — pionowa szyna z lewej, czerwienieje pod
				 * kursorem i przy bieżącej sekcji (`aria-current`). Z `size='sm'`.
				 */
				rail: 'rounded-none border-0 border-l-2 border-border text-muted-foreground transition-colors aria-[current=true]:border-hot aria-[current=true]:text-foreground [a]:hover:border-hot [a]:hover:bg-transparent [a]:hover:text-foreground',
			},
			size: {
				default: 'gap-2.5 px-3 py-2.5',
				/** Bez odstępów bocznych — wiersz równy z krawędzią treści. */
				flush: 'gap-x-6 gap-y-1 px-0 py-4',
				sm: 'gap-2.5 px-3 py-2.5',
				xs: 'gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

function Item({
	className,
	variant = 'default',
	size = 'default',
	render,
	...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof itemVariants>) {
	return useRender({
		defaultTagName: 'div',
		props: mergeProps<'div'>(
			{
				className: cn(itemVariants({ variant, size, className })),
			},
			props
		),
		render,
		state: {
			slot: 'item',
			variant,
			size,
		},
	})
}

const itemMediaVariants = cva(
	'flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none',
	{
		variants: {
			variant: {
				default: 'bg-transparent',
				icon: "[&_svg:not([class*='size-'])]:size-4",
				image: 'size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
)

function ItemMedia({
	className,
	variant = 'default',
	...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) {
	return (
		<div
			data-slot='item-media'
			data-variant={variant}
			className={cn(itemMediaVariants({ variant, className }))}
			{...props}
		/>
	)
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='item-content'
			className={cn(
				'flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none',
				className
			)}
			{...props}
		/>
	)
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='item-title'
			className={cn(
				'line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4',
				className
			)}
			{...props}
		/>
	)
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			data-slot='item-description'
			className={cn(
				'line-clamp-2 text-left text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
				className
			)}
			{...props}
		/>
	)
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='item-actions'
			className={cn('flex items-center gap-2', className)}
			{...props}
		/>
	)
}

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='item-header'
			className={cn('flex basis-full items-center justify-between gap-2', className)}
			{...props}
		/>
	)
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='item-footer'
			className={cn('flex basis-full items-center justify-between gap-2', className)}
			{...props}
		/>
	)
}

export {
	Item,
	ItemMedia,
	ItemContent,
	ItemActions,
	ItemGroup,
	ItemSeparator,
	ItemTitle,
	ItemDescription,
	ItemHeader,
	ItemFooter,
}
