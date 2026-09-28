'use client'

import { useId } from 'react'

import { PrivacyPolicy } from '@/components/legal/privacy-policy'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export interface PrivacyPolicyDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Polityka w oknie modalnym, otwierana z banera — przejście na stronę pokazałoby
 * dokument pod tym samym banerem. Treść z `PrivacyPolicy`, więc nie ma czego
 * synchronizować.
 *
 * Nazwa dostępna przez `aria-labelledby` na nagłówku treści, nie przez
 * `DialogTitle`: ten byłby drugą kopią tego samego napisu.
 */
export function PrivacyPolicyDialog({ open, onOpenChange }: PrivacyPolicyDialogProps) {
	const titleId = useId()

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			{/* DUŻE, bo to dokument do czytania. `85dvh`, nie `vh` — pasek adresu na telefonie. */}
			<DialogContent
				aria-labelledby={titleId}
				className='max-h-[85dvh] sm:max-w-3xl'
			>
				{/* Przewija się TREŚĆ, nie okno — krzyżyk zostaje na widoku. `min-h-0`
					jest konieczne: bez niego dziecko siatki nie skurczy się i `max-h`
					nie zadziała wcale. */}
				<div className='min-h-0 overflow-y-auto pt-2 pr-2'>
					<PrivacyPolicy
						titleAs='h2'
						titleId={titleId}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}
