import { useLocale, useTranslations } from 'next-intl'

import machine from '@/assets/photos/20240212_125915.jpg'
import { Badge } from '@/components/ui/badge'
import { Image } from '@/components/ui/image'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Steps } from '@/components/ui/steps'
import { serviceContent } from '@/data/service'
import type { Locale } from '@/site.config'

/**
 * „Jak to działa" (Paper: usługa, sekcja 01) — tytuł z leadem obok, cztery
 * kroki na rurze i zdjęcie frezarki z odkurzaczem, czyli dowód „bez kurzu".
 */
export function HowItWorks({ eyebrow }: { eyebrow: string }) {
	const t = useTranslations('service')
	const locale = useLocale() as Locale
	const { steps } = serviceContent[locale]

	return (
		<Section aria-labelledby='how-it-works-title'>
			<div className='flex flex-col gap-14 lg:gap-20'>
				<SectionHeading
					layout='split'
					eyebrow={eyebrow}
					title={t('howTitle')}
					titleId='how-it-works-title'
					lead={t('howBody')}
				/>

				<Steps items={steps} />

				<div className='relative'>
					<Image
						src={machine}
						alt={t('howPhotoAlt')}
						ratio='video'
						sizes='(min-width: 1440px) 1280px, 100vw'
						placeholder='blur'
						className='aspect-[4/3] md:aspect-[21/9]'
						style={{ objectPosition: '50% 40%' }}
					/>
					<Badge
						variant='pipe'
						className='absolute bottom-4 left-4 px-3.5 py-2.5 text-[0.8125rem] md:bottom-6 md:left-6'
					>
						{t('howBadge')}
					</Badge>
				</div>
			</div>
		</Section>
	)
}
