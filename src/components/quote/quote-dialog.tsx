'use client'

import dynamic from 'next/dynamic'
import { useLocale, useTranslations } from 'next-intl'

import { companyConfig } from '@/company.config'
import { QuoteForm } from '@/components/forms/quote-form'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Rating } from '@/components/ui/rating'
import { Typography } from '@/components/ui/typography'
import { cityPath, localizedCities } from '@/data/cities'
import { useIsOpen } from '@/hooks/use-is-open'
import { usePathname } from '@/i18n/navigation'
import type { Locale } from '@/site.config'

const PrivacyPolicyDialog = dynamic(() =>
	import('@/components/legal/privacy-policy-dialog').then(module => module.PrivacyPolicyDialog)
)

export interface QuoteDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Okienko wyceny (Paper: „Popup wyceny") — ocena jako dowód i „Nie teraz"
 * zamiast samego krzyżyka. Na telefonie wysuwa się od dołu (wygląd z `dialog.tsx`).
 *
 * Miejscowość: na stronie miasta podstawiona z adresu, wszędzie indziej pole
 * do wpisania. Miasto rozpoznaje sam, po adresie — dane miast wchodzą wtedy
 * dopiero z tym leniwym modułem, a nie z `QuoteLayer` obecnym na każdej stronie.
 *
 * Polityka prywatności otwiera się jako okno NA okienku — zasada „warstwy się
 * nakładają, nie podmieniają" z AGENTS.md. Przejście na stronę zostawiało
 * okienko na wierzchu, a zamknięte nie wracało już w tej wizycie.
 *
 * Ładowane leniwie przez `QuoteLayer` — AGENTS.md, „Okna modalne".
 */
export function QuoteDialog({ open, onOpenChange }: QuoteDialogProps) {
	const t = useTranslations('quote')
	const rating = useTranslations('rating')
	const locale = useLocale() as Locale
	const privacy = useIsOpen()
	const pathname = usePathname()
	const city = localizedCities(locale).find(item => cityPath(item) === pathname)?.name

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
					city={city}
					onSuccess={() => onOpenChange(false)}
					onPrivacyClick={privacy.handleOpen}
				/>

				<div className='flex items-center justify-between gap-4 border-t pt-5'>
					{companyConfig.rating && (
						<Rating
							size='sm'
							value={companyConfig.rating.value}
							label={rating('long', { count: companyConfig.rating.count })}
						/>
					)}
					{/* Ta sama droga co Escape i kliknięcie w tło — `onOpenChange`. */}
					<Button
						variant='link'
						size='none'
						className='ml-auto'
						onClick={() => onOpenChange(false)}
					>
						{t('notNow')}
					</Button>
				</div>

				{/* W drzewie okienka, więc Base UI traktuje je jako okno zagnieżdżone:
				    Escape zamyka tylko politykę, okienko wyceny zostaje pod spodem. */}
				{privacy.isOpen && (
					<PrivacyPolicyDialog
						open={privacy.isOpen}
						onOpenChange={privacy.handleOpenChange}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
