import { MDXContent } from '@content-collections/mdx/react'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Prose } from '@/components/ui/prose'
import { Section } from '@/components/ui/section'
import { Typography } from '@/components/ui/typography'
import { postBySlug, postPath, postsFor } from '@/lib/content/posts'
import { formatIsoDate } from '@/lib/date'
import {
	articleJsonLd,
	breadcrumbJsonLd,
	buildPageMetadata,
	JsonLd,
	jsonLdGraph,
	webPageJsonLd,
} from '@/lib/seo'
import { type Locale, locales } from '@/site.config'

/**
 * Pojedynczy wpis bloga.
 *
 * Wszystkie wpisy są prerenderowane — `generateStaticParams` wylicza je dla
 * każdego języka. Dzięki temu strona wpisu nie dotyka dysku ani bazy w czasie
 * działania, a nieistniejący slug daje 404 zamiast pustej strony.
 */

export function generateStaticParams() {
	return locales.flatMap(locale => postsFor(locale).map(post => ({ locale, slug: post.slug })))
}

export async function generateMetadata({
	params,
}: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
	const { locale, slug } = await params
	const post = postBySlug(locale as Locale, slug)

	if (!post) return {}

	return buildPageMetadata({
		title: post.title,
		description: post.description,
		path: postPath(post.slug),
		locale: locale as Locale,
		image: post.cover,
		// Szkic widoczny lokalnie nie może zostać przypadkiem zaindeksowany,
		// gdyby ktoś zbudował stronę z włączonymi szkicami.
		noIndex: post.draft,
	})
}

export default async function PostPage({ params }: PageProps<'/[locale]/blog/[slug]'>) {
	const { locale, slug } = await params
	const post = postBySlug(locale as Locale, slug)

	// Slug pochodzi z adresu, więc może być czymkolwiek. Bez tej kontroli
	// /blog/cokolwiek renderowałoby pustą stronę zamiast 404.
	if (!post) notFound()

	const t = await getTranslations('blog')
	const path = postPath(post.slug)

	return (
		<>
			<JsonLd
				data={jsonLdGraph(
					webPageJsonLd({ path, name: post.title, description: post.description, locale }),
					articleJsonLd({
						path,
						headline: post.title,
						description: post.description,
						image: post.cover,
						datePublished: post.publishedAt,
						dateModified: post.updatedAt,
						locale,
						keywords: post.tags,
					}),
					breadcrumbJsonLd(
						[
							{ name: t('title'), path: '/blog' },
							{ name: post.title, path },
						],
						path
					)
				)}
			/>

			<Section>
				<article className='flex flex-col gap-8'>
					<div className='flex flex-col gap-4'>
						<Button
							href='/blog'
							variant='ghost'
							size='sm'
							icon={<ArrowLeft />}
							className='self-start'
						>
							{t('backToList')}
						</Button>

						<Typography
							as='h1'
							variant='h1'
						>
							{post.title}
						</Typography>

						{/*
							Metryczka wpisu jako grupa z nazwą: bez niej czytnik podaje
							ciąg luźnych fragmentów między tytułem a treścią i nie wiadomo,
							czym one są. Daty przechodzą przez `formatIsoDate` — surowe
							`2026-09-01` synteza mowy czyta jako działanie arytmetyczne.
						*/}
						<div
							role='group'
							aria-label={t('metaLabel')}
							className='flex flex-wrap items-center gap-2'
						>
							<Typography
								variant='caption'
								tone='muted'
								as='time'
								dateTime={post.publishedAt}
							>
								{t('published')}: {formatIsoDate(post.publishedAt, locale)}
							</Typography>
							{post.updatedAt && (
								<Typography
									variant='caption'
									tone='muted'
									as='time'
									dateTime={post.updatedAt}
								>
									{/* Kropka rozdzielająca jest ozdobą — czytniki wymawiają
									    ją jako „kropka środkowa". */}
									<span aria-hidden='true'>· </span>
									{t('updated')}: {formatIsoDate(post.updatedAt, locale)}
								</Typography>
							)}
							<Typography
								variant='caption'
								tone='muted'
							>
								<span aria-hidden='true'>· </span>
								{t('readingTime', { minutes: post.readingTime })}
							</Typography>
							{post.draft && <Badge variant='warning'>{t('draft')}</Badge>}
						</div>

						{post.tags.length > 0 && (
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
						)}
					</div>

					{/*
						Treść wpisu w `Prose` — to jedyne miejsce opisujące wygląd
						Markdowna. MDXContent oddaje surowe znaczniki bez klas.
					*/}
					<Prose>
						<MDXContent code={post.mdx} />
					</Prose>
				</article>
			</Section>
		</>
	)
}
