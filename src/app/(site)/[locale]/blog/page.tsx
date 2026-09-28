import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/reveal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { Typography } from '@/components/ui/typography'
import { Link } from '@/i18n/navigation'
import { postPath, postsFor } from '@/lib/content/posts'
import { formatIsoDate } from '@/lib/date'
import { buildPageMetadata, JsonLd, webPageJsonLd } from '@/lib/seo'
import type { Locale } from '@/site.config'

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
	const { locale } = await params
	const t = await getTranslations({ locale, namespace: 'blog' })

	return buildPageMetadata({
		title: t('title'),
		description: t('description'),
		path: '/blog',
		locale: locale as Locale,
	})
}

export default async function BlogPage({ params }: PageProps<'/[locale]/blog'>) {
	const { locale } = await params
	const t = await getTranslations('blog')
	const posts = postsFor(locale as Locale)

	return (
		<>
			<JsonLd data={webPageJsonLd({ path: '/blog', name: t('title'), locale })} />

			<Section>
				<div className='flex flex-col gap-10'>
					<div className='flex flex-col gap-3'>
						<Typography
							as='h1'
							variant='h1'
						>
							{t('title')}
						</Typography>
						<Typography
							variant='lead'
							tone='muted'
							className='max-w-2xl'
						>
							{t('description')}
						</Typography>
					</div>

					{posts.length === 0 ? (
						<Typography tone='muted'>{t('empty')}</Typography>
					) : (
						<ul
							aria-label={t('postsLabel')}
							className='flex flex-col gap-4'
						>
							{posts.map((post, index) => {
								// Tytuł jest nazwą dostępną linku — patrz komentarz przy
								// `aria-labelledby` niżej.
								const titleId = `post-${post.slug}-title`

								return (
									<li key={post.slug}>
										{/* Kaskada liczona z pozycji, ale wyłącznie dla pierwszych kilku —
										    przy długiej liście dalsze opóźnienia byłyby już irytujące. */}
										<Reveal delay={Math.min(index, 4) * 0.06}>
											<Link
												href={postPath(post.slug)}
												/*
												 * Cała karta jest klikalna, ale nazwę dostępną niesie
												 * WYŁĄCZNIE tytuł — stąd `aria-labelledby`.
												 *
												 * Bez niego nazwa linku powstaje z całej jego treści:
												 * czytnik ogłasza „1 września 2026, 4 min czytania,
												 * Szkic, Jak zacząć, opis wpisu, next, mdx — link",
												 * a na liście linków (popularny sposób przeglądania
												 * strony) wszystkie wpisy wyglądają jak jeden zlepek.
												 * Reszta treści karty zostaje czytana normalnie
												 * w trybie przeglądania.
												 */
												aria-labelledby={titleId}
												className='group block rounded-lg outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring'
											>
												<Card variant='interactive'>
													<CardHeader>
														<div className='flex flex-wrap items-center gap-2'>
															<Typography
																variant='caption'
																tone='muted'
																as='time'
																dateTime={post.publishedAt}
															>
																{/* Etykieta tylko dla czytnika: sama data
																    bez kontekstu to liczba nie wiadomo czego. */}
																<span className='sr-only'>{t('published')}: </span>
																{formatIsoDate(post.publishedAt, locale)}
															</Typography>
															{/* Kropka rozdzielająca jest ozdobą układu.
															    Czytniki wymawiają ją jako „kropka
															    środkowa", więc wypada z drzewa dostępności. */}
															<Typography
																variant='caption'
																tone='muted'
															>
																<span aria-hidden='true'>· </span>
																{t('readingTime', {
																	minutes: post.readingTime,
																})}
															</Typography>
															{post.draft && (
																<Badge variant='warning'>{t('draft')}</Badge>
															)}
														</div>
														<CardTitle
															id={titleId}
															className='transition-colors group-hover:text-primary'
														>
															{post.title}
														</CardTitle>
														<CardDescription>{post.description}</CardDescription>
													</CardHeader>

													{post.tags.length > 0 && (
														<CardContent>
															<ul
																aria-label={t('tagsLabel')}
																className='flex flex-wrap gap-2'
															>
																{post.tags.map(tag => (
																	<li key={tag}>
																		<Badge variant='secondary'>{tag}</Badge>
																	</li>
																))}
															</ul>
														</CardContent>
													)}
												</Card>
											</Link>
										</Reveal>
									</li>
								)
							})}
						</ul>
					)}
				</div>
			</Section>
		</>
	)
}
