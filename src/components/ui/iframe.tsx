import type * as React from 'react'

import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK DODANY — nasz kompozyt, nie ma go w rejestrze shadcn.
 * Pełna lista zmian rejestru: AGENTS.md.
 */

const iframeVariants = cva('border-0', {
	variants: {
		/** Zaokrąglenie z tokenu `--embed-radius` w theme/components.css. */
		radius: {
			default: 'rounded-(--embed-radius)',
			none: 'rounded-none',
			lg: 'rounded-lg',
			xl: 'rounded-xl',
		},
	},
	defaultVariants: {
		radius: 'default',
	},
})

export interface IframeProps
	extends React.ComponentProps<'iframe'>, VariantProps<typeof iframeVariants> {
	src: string
	/**
	 * Nazwa dostępna ramki. **Wymagana**, dlatego typ zawęża ją do `string`:
	 * bez niej czytnik ekranu ogłasza ramkę bez nazwy i nie da się jej świadomie
	 * pominąć. Audyt axe zgłasza to jako `frame-title`.
	 */
	title: string
	/**
	 * Ramka wypełnia rodzica zamiast mieć własne wymiary. Wysokość zadaje wtedy
	 * `containerClassName` — `<iframe>` sam z siebie jej nie ma.
	 */
	fill?: boolean
	containerClassName?: string
}

/**
 * Treść osadzona z obcej domeny. Dwie domyślne to decyzja: `loading='lazy'`
 * (osadzenie potrafi podwoić wagę strony) i `referrerPolicy`, bez którego
 * dostawca mapy widzi pełną ścieżkę podstrony.
 */
export function Iframe({
	className,
	containerClassName,
	radius,
	fill = false,
	loading = 'lazy',
	referrerPolicy = 'strict-origin-when-cross-origin',
	title,
	...props
}: IframeProps) {
	const frame = (
		<iframe
			data-slot='iframe'
			title={title}
			loading={loading}
			referrerPolicy={referrerPolicy}
			className={cn(
				iframeVariants({ radius }),
				fill ? 'absolute inset-0 size-full' : 'w-full',
				className
			)}
			{...props}
		/>
	)

	if (!fill) return frame

	return (
		<div
			data-slot='iframe-wrapper'
			className={cn(
				'relative isolate overflow-hidden',
				iframeVariants({ radius }),
				containerClassName
			)}
		>
			{frame}
		</div>
	)
}

export { iframeVariants }
