import { useTranslations } from 'next-intl'

import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { SpecList, SpecListItem } from '@/components/ui/spec-list'
import { Typography } from '@/components/ui/typography'
import type { City } from '@/data/cities'

/**
 * „Kraków i okolice" (Paper: strona miasta, sekcja 01) — treść pisana dla
 * miasta osobno i fakty lokalne obok: dojazd, typowa wylewka, okoliczne
 * miejscowości. To ta sekcja odróżnia stronę miasta od kopii usługi.
 */
export function CityLocal({ eyebrow, city }: { eyebrow: string; city: City }) {
	const t = useTranslations('city.facts')

	return (
		<Section aria-labelledby='city-local-title'>
			<div className='grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20'>
				<div className='flex flex-col gap-8'>
					<SectionHeading
						eyebrow={eyebrow}
						title={city.localTitle}
						titleId='city-local-title'
					/>
					<Typography
						variant='lead'
						tone='muted'
					>
						{city.localBody}
					</Typography>
				</div>

				<SpecList className='self-end'>
					<SpecListItem
						label={t('travel')}
						value={city.travel}
					/>
					<SpecListItem
						label={t('screed')}
						value={city.screed}
					/>
					<SpecListItem
						label={t('nearby')}
						value={city.nearby.join(', ')}
					/>
				</SpecList>
			</div>
		</Section>
	)
}
