import { useTranslations } from 'next-intl'

import { companyConfig } from '@/company.config'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel'
import { CarouselProgress } from '@/components/ui/carousel-progress'
import { Rating } from '@/components/ui/rating'
import { Section } from '@/components/ui/section'
import { Typography } from '@/components/ui/typography'
import { reviews } from '@/data/reviews'

/**
 * Opinie (Paper: „ReviewsCarousel") — duża ocena z jednego źródła i karuzela
 * cytatów z wizytówki Google.
 *
 * Ocena i liczba opinii z `company.config.ts`: ta sama liczba stoi w nagłówku
 * i hero, więc nie może się rozjechać między miejscami.
 */
export function ReviewsSection({ eyebrow }: { eyebrow: string }) {
	const t = useTranslations('sections')
	const rating = useTranslations('rating')

	return (
		<Section
			deferLayout
			aria-labelledby='reviews-title'
		>
			<div className='grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20'>
				<div className='flex flex-col gap-6'>
					<Typography
						as='p'
						variant='overline'
						tone='cold'
					>
						{eyebrow}
					</Typography>
					{/* Nagłówek sekcji dla czytnika ekranu — na ekranie mówi za niego ocena. */}
					<Typography
						as='h2'
						id='reviews-title'
						className='sr-only'
					>
						{t('reviewsTitle')}
					</Typography>
					{companyConfig.rating && (
						<Rating
							size='lg'
							value={companyConfig.rating.value}
							label={rating('long', { count: companyConfig.rating.count })}
						/>
					)}
					<Typography
						variant='body'
						tone='muted'
						className='max-w-sm'
					>
						{t('reviewsClaim')}
					</Typography>
				</div>

				<Carousel
					opts={{ loop: true }}
					className='flex flex-col gap-8 border-t pt-8 lg:border-t-0 lg:pt-0'
				>
					<CarouselContent>
						{reviews.map(review => (
							<CarouselItem key={review.author}>
								<figure className='flex flex-col gap-6'>
									<blockquote>
										<Typography variant='quote'>„{review.text}”</Typography>
									</blockquote>
									<Typography
										as='figcaption'
										variant='meta'
									>
										{review.author} · {t('reviewsSource')}
									</Typography>
								</figure>
							</CarouselItem>
						))}
					</CarouselContent>

					<div className='flex items-center justify-between gap-6'>
						<CarouselProgress total={reviews.length} />
						<div className='flex gap-2'>
							<CarouselPrevious className='static my-0' />
							<CarouselNext className='static my-0' />
						</div>
					</div>
				</Carousel>
			</div>
		</Section>
	)
}
