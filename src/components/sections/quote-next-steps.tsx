import { useTranslations } from 'next-intl'

import { Typography } from '@/components/ui/typography'
import { sectionNumber } from '@/lib/section-number'
import { cn } from '@/lib/utils'

/** Kolor numeru kroku przechodzi z ciepłego w zimny, jak rura w Steps. */
const stepTones = ['text-hot-text', 'text-pipe-mid-text', 'text-cold-text']

/**
 * „Co dalej po wysłaniu" — trzy kroki pod formularzem wyceny (sekcja wyceny
 * na końcu stron i karta na stronie kontaktu). Odpowiada na pytanie, które
 * zatrzymuje przed wysłaniem: co się stanie z moim numerem.
 */
export function QuoteNextSteps({ className }: { className?: string }) {
	const t = useTranslations('quote')
	const steps = t.raw('next') as string[]

	return (
		<div className={cn('flex flex-col gap-4 border-t pt-6', className)}>
			<Typography
				as='h3'
				variant='overline'
				tone='muted'
			>
				{t('nextTitle')}
			</Typography>
			<ol className='flex flex-col gap-3'>
				{steps.map((step, index) => (
					<li
						key={step}
						className='flex items-baseline gap-4'
					>
						<Typography
							as='span'
							variant='meta'
							aria-hidden
							className={stepTones[index] ?? stepTones.at(-1)}
						>
							{sectionNumber(index + 1)}
						</Typography>
						<Typography
							as='span'
							variant='body'
						>
							{step}
						</Typography>
					</li>
				))}
			</ol>
		</div>
	)
}
