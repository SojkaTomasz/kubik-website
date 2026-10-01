'use client'

import { useTranslations } from 'next-intl'

import { companyConfig } from '@/company.config'
import { QuoteForm } from '@/components/forms/quote-form'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Rating } from '@/components/ui/rating'
import { Typography } from '@/components/ui/typography'

export interface QuoteDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Okienko wyceny (Paper: „Popup wyceny") — dwa pola zamiast trzech,
 * ocena jako dowód i „Nie teraz" zamiast samego krzyżyka. Na telefonie
 * wysuwa się od dołu (wygląd z `dialog.tsx`).
 *
 * Ładowane leniwie przez `QuotePopup` — AGENTS.md, „Okna modalne".
 */
export function QuoteDialog({ open, onOpenChange }: QuoteDialogProps) {
	const t = useTranslations('quote')
	const rating = useTranslations('rating')

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='sm:max-w-[35rem]'>
				<DialogHeader>
					<Typography
						variant='overline'
						tone='primary'
					>
						{t('dialogEyebrow')}
					</Typography>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('dialogLead')}</DialogDescription>
				</DialogHeader>

				<QuoteForm
					layout='compact'
					onSuccess={() => onOpenChange(false)}
				/>

				<div className='flex items-center justify-between gap-4 border-t pt-5'>
					{companyConfig.rating && (
						<Rating
							size='sm'
							value={companyConfig.rating.value}
							label={rating('long', { count: companyConfig.rating.count })}
						/>
					)}
					<DialogClose
						render={
							<Button
								variant='link'
								size='none'
								className='ml-auto'
							/>
						}
					>
						{t('notNow')}
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	)
}
