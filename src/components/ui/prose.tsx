import type * as React from 'react'

import { cva, type VariantProps } from '@/lib/cva'
import { cn } from '@/lib/utils'

/**
 * ⚠️ PLIK DODANY — nasz kompozyt, nie pochodzi z rejestru shadcn.
 *
 * Skala typograficzna dla surowego HTML-a z MDX-a. JEDYNE miejsce opisujące
 * wygląd treści. Świadomie BEZ `@tailwindcss/typography`: ta wtyczka przynosi
 * własną skalę, rozjeżdżającą się ze skalą z `typography.tsx`.
 */
export const proseVariants = cva(
	[
		// --- blok ---
		'max-w-prose text-base leading-relaxed text-pretty',

		// --- nagłówki ---
		'[&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:scroll-mt-navbar [&_h2]:text-2xl [&_h2]:leading-snug [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-balance sm:[&_h2]:text-3xl',
		'[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-navbar [&_h3]:text-xl [&_h3]:leading-snug [&_h3]:font-semibold [&_h3]:tracking-tight sm:[&_h3]:text-2xl',
		'[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:scroll-mt-navbar [&_h4]:text-lg [&_h4]:font-semibold',

		// --- tekst ---
		'[&_p]:my-4',
		'[&_strong]:font-semibold',
		'[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-primary',

		// --- listy ---
		'[&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6',
		'[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6',
		'[&_li]:my-1 [&_li]:ps-1',

		// --- cytat ---
		'[&_blockquote]:my-6 [&_blockquote]:border-s-2 [&_blockquote]:ps-6 [&_blockquote]:text-lg [&_blockquote]:text-muted-foreground [&_blockquote]:italic',

		// --- kod --- `:not(pre)>code` zawęża do kodu w akapicie; bez tego tło
		// dublowałoby się z tłem bloku kodu.
		'[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-[0.4em] [&_:not(pre)>code]:py-[0.2em] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.9em]',
		// Blok kodu przewija się u siebie — inaczej długa linia rozpycha stronę.
		'[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm',

		// --- tabela ---
		// Opakowana w kontener z przewijaniem w komponencie widoku, jeśli szeroka.
		'[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
		'[&_th]:border-b [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_th]:font-semibold',
		'[&_td]:border-b [&_td]:px-3 [&_td]:py-2',

		// --- pozostałe ---
		'[&_hr]:my-10 [&_hr]:border-border',
		'[&_img]:my-6 [&_img]:rounded-lg',
	],
	{
		variants: {
			size: {
				default: '',
				sm: 'text-sm [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h3]:text-lg sm:[&_h3]:text-xl',
				lg: 'text-lg [&_p]:my-5',
			},
			/** Szerokość bloku tekstu. `prose` trzyma wiersz w czytelnej długości. */
			width: {
				prose: 'max-w-prose',
				full: 'max-w-none',
			},
		},
		defaultVariants: {
			size: 'default',
			width: 'prose',
		},
	}
)

export interface ProseProps
	extends React.ComponentProps<'div'>, VariantProps<typeof proseVariants> {}

export function Prose({ className, size, width, ...props }: ProseProps) {
	return (
		<div
			data-slot='prose'
			className={cn(proseVariants({ size, width }), className)}
			{...props}
		/>
	)
}
