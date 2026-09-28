'use client'

import * as React from 'react'
import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area'

import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn.
 * Dodane tabIndex={0} na obszarze przewijania — patrz komentarz niżej.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

function ScrollArea({ className, children, ...props }: ScrollAreaPrimitive.Root.Props) {
	return (
		<ScrollAreaPrimitive.Root
			data-slot='scroll-area'
			className={cn('relative', className)}
			{...props}
		>
			{/* ⚠️ ZMIANA WZGLĘDEM REJESTRU. Base UI daje tu `tabIndex={-1}`, więc
				użytkownik klawiatury nie dosięga treści poniżej krawędzi (axe:
				`scrollable-region-focusable`). Wejście w kolejność Tab jest zamierzone. */}
			<ScrollAreaPrimitive.Viewport
				tabIndex={0}
				data-slot='scroll-area-viewport'
				className='size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1'
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			<ScrollBar />
			<ScrollAreaPrimitive.Corner />
		</ScrollAreaPrimitive.Root>
	)
}

function ScrollBar({
	className,
	orientation = 'vertical',
	...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
	return (
		<ScrollAreaPrimitive.Scrollbar
			data-slot='scroll-area-scrollbar'
			data-orientation={orientation}
			orientation={orientation}
			className={cn(
				'flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent',
				className
			)}
			{...props}
		>
			<ScrollAreaPrimitive.Thumb
				data-slot='scroll-area-thumb'
				className='relative flex-1 rounded-full bg-border'
			/>
		</ScrollAreaPrimitive.Scrollbar>
	)
}

export { ScrollArea, ScrollBar }
