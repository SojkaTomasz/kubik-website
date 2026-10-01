import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Separator } from '@/components/ui/separator'
import { cityPath, localizedCities } from '@/data/cities'
import type { Locale } from '@/site.config'

/**
 * „Obszar działania" (Paper: Kontakt) — miasta, w których pracujemy
 * najczęściej, każde prowadzi do swojej strony. To jedyna lista miast poza
 * stopką, więc niesie też linkowanie wewnętrzne do stron miast.
 */
export function ServiceArea({ className }: { className?: string }) {
	const t = useTranslations('contactPage')
	const cities = localizedCities(useLocale() as Locale)

	return (
		<Section
			deferLayout
			background='card'
			className={className}
			aria-labelledby='service-area-title'
		>
			<div className='flex flex-col gap-10'>
				<SectionHeading
					layout='split'
					eyebrow={t('areaEyebrow')}
					eyebrowTone='cold'
					title={t('areaTitle')}
					titleId='service-area-title'
					lead={t('areaLead')}
				/>
				<Separator variant='pipe' />
				<ul className='grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4'>
					{cities.map(city => (
						<li key={city.slug}>
							<Button
								href={cityPath(city)}
								variant='link'
								size='none'
								className='font-heading text-xl font-bold text-foreground no-underline hover:text-hot-text md:text-2xl'
							>
								{city.name}
							</Button>
						</li>
					))}
				</ul>
			</div>
		</Section>
	)
}
