'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: napisy dla czytnika ekranu idą
 * przez `messages/*.json`, a nie wpisane po angielsku w kod. Wygląd Kubika:
 * arkusz od dołu na telefonie, pasek rury, stopka bez tła.
 * `shadcn add --overwrite` to skasuje. Pełna lista: AGENTS.md.
 */

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
	return (
		<DialogPrimitive.Root
			data-slot='dialog'
			{...props}
		/>
	)
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return (
		<DialogPrimitive.Trigger
			data-slot='dialog-trigger'
			{...props}
		/>
	)
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return (
		<DialogPrimitive.Portal
			data-slot='dialog-portal'
			{...props}
		/>
	)
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
	return (
		<DialogPrimitive.Close
			data-slot='dialog-close'
			{...props}
		/>
	)
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot='dialog-overlay'
			className={cn(
				'fixed inset-0 isolate z-50 bg-overlay duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
				className
			)}
			{...props}
		/>
	)
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: DialogPrimitive.Popup.Props & {
	showCloseButton?: boolean
}) {
	const t = useTranslations('a11y')

	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Popup
				data-slot='dialog-content'
				/*
				 * Na telefonie arkusz od dołu na całą szerokość, od `sm` okno na
				 * środku — jak popup wyceny w Paperze. Pasek rury u góry i cień
				 * z tokenów; odstępy 20 / 40 / 48 px jak karta `size='lg'`.
				 */
				className={cn(
					'pipe-bar fixed right-0 bottom-0 left-0 z-50 grid max-h-[92dvh] w-full gap-6 overflow-hidden rounded-(--dialog-radius) bg-popover px-5 pt-8 pb-7 text-sm text-popover-foreground shadow-modal duration-150 outline-none sm:top-1/2 sm:right-auto sm:bottom-auto sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-10 lg:px-12 lg:pt-11 lg:pb-10 data-open:animate-in data-open:fade-in-0 max-sm:data-open:slide-in-from-bottom-8 sm:data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 sm:data-closed:zoom-out-95',
					className
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close
						data-slot='dialog-close'
						render={
							<Button
								variant='ghost'
								className='absolute top-4 right-3 text-foreground sm:top-6 sm:right-6'
								size='icon-lg'
							/>
						}
					>
						<XIcon />
						<span className='sr-only'>{t('close')}</span>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Popup>
		</DialogPortal>
	)
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='dialog-header'
			className={cn('flex flex-col gap-3', className)}
			{...props}
		/>
	)
}

function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<'div'> & {
	showCloseButton?: boolean
}) {
	const t = useTranslations('a11y')

	return (
		<div
			data-slot='dialog-footer'
			// Przyciski równej szerokości na całą szerokość okna — w projekcie nie
			// ma stopki „przyklejonej" do prawej krawędzi.
			className={cn('grid gap-2.5 sm:auto-cols-fr sm:grid-flow-col', className)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close render={<Button variant='outline' />}>
					{t('close')}
				</DialogPrimitive.Close>
			)}
		</div>
	)
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot='dialog-title'
			// `pr-12` — tytuł nie wjeżdża pod krzyżyk w prawym górnym rogu.
			className={cn('pr-12 font-heading text-display-sm font-extrabold text-balance', className)}
			{...props}
		/>
	)
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			data-slot='dialog-description'
			className={cn(
				'text-body text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
				className
			)}
			{...props}
		/>
	)
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
}
