import { ArrowRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { companyConfig } from '@/company.config'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Image } from '@/components/ui/image'
import { Rating } from '@/components/ui/rating'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { localizedProjects } from '@/data/projects'
import { reviewsByLocale } from '@/data/reviews'
import type { Locale } from '@/site.config'

/**
 * Pasek dowodu pod hero (Paper: „Pasek dowodu") — ocena, jedna krótka opinia
 * i miniatury realizacji z odnośnikiem do listy.
 *
 * Na telefonie zostaje ocena i opinia — miniatury przy 390 px byłyby za małe,
 * żeby cokolwiek pokazać.
 */
export function ProofBar() {
	const t = useTranslations('sections')
	const rating = useTranslations('rating')
	const locale = useLocale() as Locale
	const projects = localizedProjects(locale)
	const reviews = reviewsByLocale[locale]
	// Najkrótsza opinia — pasek ma się mieścić w jednej, dwóch liniach.
	const review = reviews[1]
	const thumbnails = projects.slice(0, 3)

	return (
		<section
			aria-label={t('reviewsTitle')}
			className='border-y bg-card py-7 lg:py-9'
		>
			<Container className='flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12'>
				{companyConfig.rating && (
					<Rating
						value={companyConfig.rating.value}
						label={rating('long', { count: companyConfig.rating.count })}
						className='shrink-0'
					/>
				)}

				<Separator
					orientation='vertical'
					className='hidden lg:block data-vertical:h-14 data-vertical:self-center'
				/>

				{review && (
					<figure className='flex flex-1 flex-col gap-1.5'>
						<blockquote>
							<Typography
								variant='body'
								className='font-medium md:text-lg'
							>
								{t('reviewQuote', { text: review.text })}
							</Typography>
						</blockquote>
						<Typography
							as='figcaption'
							variant='meta'
						>
							{review.author} · {t('proofQuoteSource')}
						</Typography>
					</figure>
				)}

				<div className='hidden shrink-0 items-center gap-2 md:flex'>
					{thumbnails.map(project =>
						project.photos[0] ? (
							<Image
								key={project.slug}
								src={project.photos[0]}
								alt=''
								ratio='square'
								sizes='72px'
								className='size-[4.5rem]'
							/>
						) : null
					)}
					<Button
						href='/realizacje'
						variant='link'
						size='none'
						icon={<ArrowRight className='size-[1.125rem]' />}
						iconPosition='right'
						iconEffect='shiftRight'
						className='pl-3 font-semibold text-foreground no-underline'
					>
						{t('proofProjects', { count: projects.length })}
					</Button>
				</div>
			</Container>
		</section>
	)
}
