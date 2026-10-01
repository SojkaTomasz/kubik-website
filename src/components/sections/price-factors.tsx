import { useLocale, useTranslations } from 'next-intl'

import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Typography } from '@/components/ui/typography'
import { serviceContent } from '@/data/service'
import type { Locale } from '@/site.config'

/**
 * „Od czego zależy cena" (Paper: „PriceFactors") — bez stawek, tylko trzy
 * czynniki (docs/zakres.md). Jednostka „m² / cm / km" to ozdoba w kolorze
 * dekoru; czytnik dostaje sam tytuł i opis.
 */
export function PriceFactors({ eyebrow }: { eyebrow: string }) {
	const t = useTranslations('service')
	const locale = useLocale() as Locale
	const { priceFactors } = serviceContent[locale]

	return (
		<Section
			deferLayout
			aria-labelledby='price-factors-title'
		>
			<div className='grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20'>
				<SectionHeading
					eyebrow={eyebrow}
					title={t('priceTitle')}
					titleId='price-factors-title'
				/>

				<ul className='grid gap-8 md:grid-cols-3 md:gap-6'>
					{priceFactors.map(factor => (
						<li
							key={factor.title}
							className='flex items-baseline gap-4 md:flex-col md:gap-3'
						>
							<Typography
								as='span'
								aria-hidden
								// Ozdoba jak w Paperze — kolor linii celowo poniżej progu kontrastu,
								// a treść (nazwa czynnika) stoi obok pełnym kolorem.
								data-decorative
								className='min-w-21 font-heading text-[2.125rem] leading-none font-extrabold tracking-[-0.04em] text-input md:text-5xl'
							>
								{factor.unit}
							</Typography>
							<span className='flex flex-col gap-1'>
								<Typography
									as='h3'
									variant='h4'
								>
									{factor.title}
								</Typography>
								<Typography
									variant='body'
									tone='muted'
								>
									{factor.description}
								</Typography>
							</span>
						</li>
					))}
				</ul>
			</div>
		</Section>
	)
}
