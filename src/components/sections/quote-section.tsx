import { useTranslations } from 'next-intl'

import { QuoteForm } from '@/components/forms/quote-form'
import { QuoteNextSteps } from '@/components/sections/quote-next-steps'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'

export interface QuoteSectionProps {
	/** Etykieta z numerem sekcji — „07 · Wycena". */
	eyebrow: string
	/** Na stronie miasta miejscowość wypełnia się sama (docs/teksty.md). */
	city?: string
}

/**
 * Sekcja wyceny na końcu stron (Paper: „Formularz") — nagłówek, „co dalej po
 * wysłaniu" w trzech krokach i formularz.
 */
export function QuoteSection({ eyebrow, city }: QuoteSectionProps) {
	const t = useTranslations('quote')

	return (
		<Section
			id='wycena'
			aria-labelledby='quote-section-title'
		>
			<div className='grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20'>
				<div className='flex flex-col gap-10'>
					<SectionHeading
						eyebrow={eyebrow}
						title={t('title')}
						titleId='quote-section-title'
						lead={t('lead')}
					/>

					<QuoteNextSteps />
				</div>

				<QuoteForm
					layout='wide'
					city={city}
					className='lg:pt-14'
				/>
			</div>
		</Section>
	)
}
