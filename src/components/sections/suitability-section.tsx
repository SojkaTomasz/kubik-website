import { useLocale, useTranslations } from 'next-intl'

import { companyConfig } from '@/company.config'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { SpecList, SpecListItem } from '@/components/ui/spec-list'
import { Typography } from '@/components/ui/typography'
import { serviceContent } from '@/data/service'
import { anim } from '@/lib/animations/attributes'
import { phoneLinks } from '@/lib/phone'
import type { Locale } from '@/site.config'

/**
 * „Czy u mnie się da?" (Paper: „SuitabilityList") — dwie listy: co się nadaje
 * (czerwona etykieta, dopisek mono) i co nie (niebieska, przygaszona), plus
 * zachęta do wysłania zdjęcia wylewki.
 */
export function SuitabilitySection({ eyebrow }: { eyebrow: string }) {
	const t = useTranslations('service')
	const locale = useLocale() as Locale
	const { suitableFor, notSuitableFor } = serviceContent[locale]
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone).display : ''

	return (
		<Section
			deferLayout
			background='card'
			aria-labelledby='suitability-title'
		>
			<div className='flex flex-col gap-12'>
				<SectionHeading
					eyebrow={eyebrow}
					title={t('fitTitle')}
					titleId='suitability-title'
					className='[&_h2]:max-w-none'
				/>

				<div className='grid gap-12 lg:grid-cols-2 lg:gap-20'>
					<div className='flex flex-col gap-3'>
						<Typography
							as='h3'
							variant='overline'
							tone='primary'
							{...anim('eyebrow')}
						>
							{t('fitYes')}
						</Typography>
						<SpecList
							appearance='feature'
							{...anim('stagger')}
						>
							{suitableFor.map(item => (
								<SpecListItem
									key={item.label}
									label={item.label}
									value={item.note}
								/>
							))}
						</SpecList>
					</div>

					<div className='flex flex-col gap-3'>
						<Typography
							as='h3'
							variant='overline'
							tone='cold'
							{...anim('eyebrow')}
						>
							{t('fitNo')}
						</Typography>
						<SpecList
							appearance='feature'
							tone='muted'
							{...anim('stagger')}
						>
							{notSuitableFor.map(item => (
								<SpecListItem
									key={item}
									label={item}
								/>
							))}
						</SpecList>
						<Typography
							variant='bodySm'
							tone='muted'
							className='pt-2 text-[0.9375rem]'
						>
							{t('fitNote', { phone })}
						</Typography>
					</div>
				</div>
			</div>
		</Section>
	)
}
