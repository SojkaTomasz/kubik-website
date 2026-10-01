import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { MoreHorizontalIcon } from 'lucide-react'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: nazwa punktu orientacyjnego i napis
 * dla czytnika ekranu idą przez `messages/*.json`, a nie wpisane po angielsku.
 * Wygląd Kubika: mono wersalikami, ukośnik w kolorze linii zamiast strzałki.
 * `shadcn add --overwrite` to skasuje. Pełna lista: AGENTS.md.
 */

function Breadcrumb({ className, ...props }: React.ComponentProps<'nav'>) {
	const t = useTranslations('a11y')

	return (
		<nav
			aria-label={t('breadcrumb')}
			data-slot='breadcrumb'
			className={cn(className)}
			{...props}
		/>
	)
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
	return (
		<ol
			data-slot='breadcrumb-list'
			className={cn(
				// Ścieżka w kroju mono wersalikami — „REALIZACJE / RZESZÓW".
				'flex flex-wrap items-center gap-2 font-mono text-xs leading-4 tracking-[0.08em] wrap-break-word text-muted-foreground uppercase',
				className
			)}
			{...props}
		/>
	)
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
	return (
		<li
			data-slot='breadcrumb-item'
			className={cn('inline-flex items-center gap-1', className)}
			{...props}
		/>
	)
}

function BreadcrumbLink({ className, render, ...props }: useRender.ComponentProps<'a'>) {
	return useRender({
		defaultTagName: 'a',
		props: mergeProps<'a'>(
			{
				className: cn('cursor-pointer transition-colors hover:text-foreground', className),
			},
			props
		),
		render,
		state: {
			slot: 'breadcrumb-link',
		},
	})
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			data-slot='breadcrumb-page'
			role='link'
			aria-disabled='true'
			aria-current='page'
			className={cn('font-normal text-foreground', className)}
			{...props}
		/>
	)
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
	return (
		<li
			data-slot='breadcrumb-separator'
			role='presentation'
			aria-hidden='true'
			className={cn('text-border [&>svg]:size-3.5', className)}
			{...props}
		>
			{children ?? '/'}
		</li>
	)
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
	const t = useTranslations('a11y')

	return (
		<span
			data-slot='breadcrumb-ellipsis'
			role='presentation'
			aria-hidden='true'
			className={cn('flex size-5 items-center justify-center [&>svg]:size-4', className)}
			{...props}
		>
			<MoreHorizontalIcon />
			<span className='sr-only'>{t('more')}</span>
		</span>
	)
}

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
}
