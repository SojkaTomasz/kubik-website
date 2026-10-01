import { Hammer, Sparkles, ThumbsUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

/** Trzy obietnice — kolor obwódki idzie wzdłuż rury: ciepły, środek, zimny. */
const FEATURES = [
	{ key: 'demolition', icon: Hammer, ring: 'border-[var(--pipe-hot)]' },
	{ key: 'dust', icon: Sparkles, ring: 'border-[var(--pipe-mid)]' },
	{ key: 'mess', icon: ThumbsUp, ring: 'border-[var(--pipe-cold)]' },
] as const

/**
 * „Bez skuwania · Bez kurzu · Bez bałaganu" pod leadem hero strony głównej.
 *
 * Lista, nie trzy luźne bloki: czytnik ogłasza „lista, 3 elementy" i czyta
 * „Bez skuwania" jednym ciągiem, bo słowo „Bez" i dopisek stoją w tym samym
 * elemencie.
 */
export function HeroFeatures({ className }: { className?: string }) {
	const t = useTranslations('home')

	return (
		<ul className={cn('flex flex-wrap items-center gap-x-6 gap-y-4 pt-2 md:gap-x-8', className)}>
			{FEATURES.map(({ key, icon: Icon, ring }, index) => (
				<li
					key={key}
					className='flex items-center gap-x-6 md:gap-x-8'
				>
					{index > 0 && (
						<Separator
							orientation='vertical'
							className='hidden sm:block data-vertical:h-10'
						/>
					)}
					<span className='flex items-center gap-3.5'>
						<span
							aria-hidden
							className={cn(
								'flex size-11 shrink-0 items-center justify-center rounded-full border-2 md:size-13',
								ring
							)}
						>
							<Icon className='size-5 md:size-6' />
						</span>
						<span className='flex flex-col'>
							<Typography
								as='span'
								className='font-heading text-[0.9375rem] leading-[1.15] font-extrabold tracking-[0.02em] uppercase'
							>
								{t('without')}
							</Typography>
							<Typography
								as='span'
								variant='bodySm'
								tone='muted'
								className='font-medium md:text-base'
							>
								{t(`features.${key}`)}
							</Typography>
						</span>
					</span>
				</li>
			))}
		</ul>
	)
}
