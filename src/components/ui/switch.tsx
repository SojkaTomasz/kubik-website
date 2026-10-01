'use client'

import { Switch as SwitchPrimitive } from '@base-ui/react/switch'

import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: kwadratowy przełącznik Kubika
 * (48 × 28 px, zimny akcent). `shadcn add --overwrite` to skasuje. Lista: AGENTS.md.
 */

function Switch({
	className,
	size = 'default',
	...props
}: SwitchPrimitive.Root.Props & {
	size?: 'sm' | 'default'
}) {
	return (
		<SwitchPrimitive.Root
			data-slot='switch'
			data-size={size}
			className={cn(
				/*
				 * Kwadratowy przełącznik z projektu: 48 × 28 px. Wyłączony — ciemne
				 * pole z obrysem i szarym suwakiem; włączony — zimny akcent i biały
				 * suwak. Zablokowany (kategoria niezbędna) — przygaszony.
				 */
				'peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-(--input-radius) border-[1.5px] border-input bg-background transition-colors outline-none group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-7 data-[size=default]:w-12 data-[size=sm]:h-5 data-[size=sm]:w-9 data-checked:border-cold data-checked:bg-cold data-disabled:cursor-not-allowed data-disabled:opacity-60 data-disabled:data-checked:border-input data-disabled:data-checked:bg-input',
				className
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot='switch-thumb'
				className='pointer-events-none block bg-muted-foreground transition-transform group-data-[size=default]/switch:size-[1.1875rem] group-data-[size=sm]/switch:size-[0.8125rem] group-data-disabled/switch:bg-muted-foreground data-checked:bg-cold-foreground group-data-[size=default]/switch:data-checked:translate-x-[1.4375rem] group-data-[size=sm]/switch:data-checked:translate-x-[1.125rem] group-data-[size=default]/switch:data-unchecked:translate-x-[0.1875rem] group-data-[size=sm]/switch:data-unchecked:translate-x-[0.125rem]'
			/>
		</SwitchPrimitive.Root>
	)
}

export { Switch }
