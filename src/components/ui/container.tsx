import type * as React from 'react'

import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/**
 * Kontener treści — wyśrodkowanie, maksymalna szerokość i marginesy boczne.
 *
 * Domyślne `size='page'` bierze szerokość z tokenu `--container-max-w`
 * (src/app/theme/components.css), więc zmiana szerokości layoutu w całym
 * projekcie to edycja jednej wartości CSS, nie przeszukiwanie klas w widokach.
 */
const containerVariants = cva('mx-auto w-full', {
	variants: {
		size: {
			page: 'max-w-page',
			prose: 'max-w-prose',
			sm: 'max-w-3xl',
			md: 'max-w-5xl',
			lg: 'max-w-7xl',
			full: 'max-w-none',
		},
		padding: {
			none: 'px-0',
			/** Sterowane tokenami `--container-px` / `--container-px-lg`. */
			default: 'px-(--container-px) lg:px-(--container-px-lg)',
			tight: 'px-4',
			wide: 'px-6 lg:px-12',
		},
	},
	defaultVariants: {
		size: 'page',
		padding: 'default',
	},
})

export interface ContainerProps
	extends React.ComponentProps<'div'>, VariantProps<typeof containerVariants> {
	/**
	 * Element HTML do wyrenderowania. Kontener bywa też `<section>`, `<header>`
	 * czy `<footer>` — semantyka nie powinna wymuszać dodatkowego zagnieżdżenia.
	 */
	as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'nav'
}

export function Container({ className, size, padding, as = 'div', ...props }: ContainerProps) {
	const Component = as

	return (
		<Component
			data-slot='container'
			className={cn(containerVariants({ size, padding }), className)}
			{...props}
		/>
	)
}

export { containerVariants }
