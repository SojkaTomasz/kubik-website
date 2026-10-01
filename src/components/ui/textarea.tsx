import * as React from 'react'

import { fieldControlVariants, fieldPlaceholderClass } from '@/components/ui/field-control.variants'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: wygląd ze wspólnego
 * `field-control.variants.ts`. `shadcn add --overwrite` to skasuje.
 */

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot='textarea'
			className={cn(
				fieldControlVariants({ size: 'auto' }),
				fieldPlaceholderClass,
				'flex field-sizing-content min-h-28 py-4',
				className
			)}
			{...props}
		/>
	)
}

export { Textarea }
