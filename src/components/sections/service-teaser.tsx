import padStart from 'lodash/padStart'
import { ArrowRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Typography } from '@/components/ui/typography'
import { SERVICE_PATH, serviceContent } from '@/data/service'
import { anim } from '@/lib/animations/attributes'
import type { Locale } from '@/site.config'

/**
 * Zapowiedź usługi na stronie głównej (Paper: „Usługa teaser") — tytuł
 * z odnośnikiem i same nazwy kroków. Opisy kroków są na stronie usługi; tu
 * mają tylko pokazać, że to cztery proste etapy.
 */
export function ServiceTeaser({ eyebrow }: { eyebrow: string }) {
	const t = useTranslations('home')
	const locale = useLocale() as Locale
	const { steps } = serviceContent[locale]
	const colors = ['text-hot-text', 'text-hot-text', 'text-pipe-mid-text', 'text-cold-text']

	return (
		<Section
			deferLayout
			background='card'
			aria-labelledby='service-teaser-title'
		>
			<div className='grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20'>
				<div className='flex flex-col items-start gap-8'>
					<SectionHeading
						eyebrow={eyebrow}
						title={t('serviceTitle')}
						titleId='service-teaser-title'
					/>
					<Button
						href={SERVICE_PATH}
						variant='outline'
						size='xl'
						icon={<ArrowRight />}
						iconPosition='right'
						iconEffect='shiftRight'
						className='w-full sm:w-auto sm:min-w-72'
					>
						{t('serviceLink')}
					</Button>
				</div>

				<ol
					className='flex flex-col'
					{...anim('stagger')}
				>
					{steps.map((step, index) => (
						<li
							key={step.title}
							className='flex items-baseline gap-6 border-t py-5 last:border-b'
						>
							<Typography
								as='span'
								variant='meta'
								aria-hidden
								className={colors[index]}
							>
								{padStart(String(index + 1), 2, '0')}
							</Typography>
							<Typography
								as='span'
								variant='h3'
							>
								{step.title}
							</Typography>
						</li>
					))}
				</ol>
			</div>
		</Section>
	)
}
