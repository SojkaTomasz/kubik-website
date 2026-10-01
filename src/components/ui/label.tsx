'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: etykieta pola w kroju mono,
 * wersalikami, jak „METRAŻ" / „TELEFON" w formularzu z projektu.
 * `shadcn add --overwrite` to skasuje. Pełna lista: AGENTS.md.
 */

function Label({ className, ...props }: React.ComponentProps<'label'>) {
	return (
		<label
			data-slot='label'
			className={cn(
				'flex cursor-pointer items-center gap-2 font-mono text-xs leading-4 font-medium tracking-[0.08em] text-muted-foreground uppercase select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
				className
			)}
			{...props}
		/>
	)
}

export { Label }
