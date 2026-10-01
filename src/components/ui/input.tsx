import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'

import { fieldControlVariants, fieldPlaceholderClass } from '@/components/ui/field-control.variants'
import type { VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: wygląd ze wspólnego
 * `field-control.variants.ts` i oś `appearance` (liczba krojem nagłówkowym).
 * `shadcn add --overwrite` to skasuje. Pełna lista: AGENTS.md.
 */

function Input({
	className,
	type,
	appearance,
	...props
}: React.ComponentProps<'input'> & Pick<VariantProps<typeof fieldControlVariants>, 'appearance'>) {
	return (
		<InputPrimitive
			type={type}
			data-slot='input'
			className={cn(
				fieldControlVariants({ appearance }),
				fieldPlaceholderClass,
				'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
				className
			)}
			{...props}
		/>
	)
}

export { Input }
