'use client'

import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'

import { separatorVariants } from '@/components/ui/separator.variants'
import type { VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: oś `variant` z kreską rury
 * (`pipe`), definicja w `separator.variants.ts`.
 * `shadcn add --overwrite` to skasuje. Pełna lista: AGENTS.md.
 */

function Separator({
	className,
	orientation = 'horizontal',
	variant,
	...props
}: SeparatorPrimitive.Props & VariantProps<typeof separatorVariants>) {
	return (
		<SeparatorPrimitive
			data-slot='separator'
			orientation={orientation}
			className={cn(separatorVariants({ variant }), className)}
			{...props}
		/>
	)
}

export { Separator }
