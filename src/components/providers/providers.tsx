import type * as React from 'react'

import { MotionProvider } from '@/components/providers/motion-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { VercelAnalytics } from '@/components/providers/vercel-analytics'
import { Toaster } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'

/**
 * Wszystkie providery aplikacji w jednym miejscu.
 *
 * Trzymamy je poza `layout.tsx`, żeby layout został komponentem serwerowym —
 * providery mają własną dyrektywę `'use client'` tam, gdzie jej potrzebują,
 * i granica klienta nie rozlewa się na całe drzewo strony.
 */
export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider>
			<MotionProvider>
				<TooltipProvider>
					{children}
					<Toaster />
					<VercelAnalytics />
				</TooltipProvider>
			</MotionProvider>
		</ThemeProvider>
	)
}
