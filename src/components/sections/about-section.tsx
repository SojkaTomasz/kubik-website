import { useTranslations } from 'next-intl'

import bus from '@/assets/photos/bus.jpg'
import { Badge } from '@/components/ui/badge'
import { Image } from '@/components/ui/image'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { Stat, StatGroup } from '@/components/ui/stat'
import { Typography } from '@/components/ui/typography'
import { companyStats } from '@/data/service'

/**
 * „Kim jesteśmy" na stronie głównej — tekst, liczby od klienta i zdjęcie busa,
 * po którym ekipę rozpoznaje się pod domem.
 */
export function AboutSection({ eyebrow }: { eyebrow: string }) {
	const t = useTranslations('home')

	return (
		<Section
			deferLayout
			aria-labelledby='about-title'
		>
			<div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-20'>
				<div className='flex flex-col gap-10'>
					<SectionHeading
						eyebrow={eyebrow}
						title={t('aboutTitle')}
						titleId='about-title'
					/>
					<Typography
						variant='lead'
						tone='muted'
					>
						{t('aboutBody')}
					</Typography>
					<StatGroup className='border-t pt-8'>
						{companyStats.map(stat => (
							<Stat
								key={stat.label}
								label={stat.label}
								value={stat.value}
							/>
						))}
					</StatGroup>
				</div>

				<div className='relative'>
					<Image
						src={bus}
						alt={t('busAlt')}
						ratio='portrait'
						sizes='(min-width: 1024px) 45vw, 100vw'
						placeholder='blur'
						className='lg:aspect-[4/5]'
					/>
					<Badge
						variant='pipe'
						className='absolute bottom-4 left-4 px-3.5 py-2.5 text-[0.8125rem] md:bottom-6 md:left-6'
					>
						{t('busBadge')}
					</Badge>
				</div>
			</div>
		</Section>
	)
}
