import { cva } from '@/lib/cva'

/*
 * Definicja wariantów poza modułem `'use client'` — strona `/dev` czyta ją
 * z komponentu serwerowego (AGENTS.md, „Warianty komponentów").
 */
export const separatorVariants = cva(
	'shrink-0 data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
	{
		variants: {
			variant: {
				/** Zwykła linia w kolorze obramowań. */
				default: 'bg-border data-horizontal:h-px',
				/** Rura z ciepłego w zimne, 2 px — pod nagłówkiem „Obszar działania". */
				pipe: 'bg-pipe-line data-horizontal:h-0.5',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
)
