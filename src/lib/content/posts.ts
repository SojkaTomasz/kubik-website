import { allPosts, type Post } from 'content-collections'

import { env } from '@/env'
import type { Locale } from '@/site.config'

/**
 * JEDYNE miejsce, przez które widoki sięgają po wpisy. Filtrowanie po swojemu
 * prędzej czy później opublikuje szkic.
 */

export type { Post }

/** Wpis okrojony do tego, co potrzebne na liście — bez skompilowanego MDX. */
export type PostSummary = Omit<Post, 'mdx' | 'content'>

/** Szkice widoczne WYŁĄCZNIE w trybie deweloperskim. */
function isVisible(post: Post): boolean {
	return !post.draft || env.NODE_ENV === 'development'
}

/** Najnowsze najpierw. Przy równych datach decyduje tytuł, żeby kolejność była stabilna. */
function byNewest(a: Post, b: Post): number {
	return b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title)
}

/** Wszystkie widoczne wpisy w danym języku, od najnowszego. */
export function postsFor(locale: Locale): Post[] {
	return allPosts.filter(post => post.locale === locale && isVisible(post)).sort(byNewest)
}

/** Pojedynczy wpis albo `undefined`, gdy nie istnieje lub jest szkicem w produkcji. */
export function postBySlug(locale: Locale, slug: string): Post | undefined {
	return postsFor(locale).find(post => post.slug === slug)
}

/** Wpisy do `generateStaticParams` i sitemapy — te same reguły co w widokach. */
export function publishedPostPaths(locale: Locale): { slug: string; updatedAt: string }[] {
	return postsFor(locale)
		.filter(post => !post.draft)
		.map(post => ({ slug: post.slug, updatedAt: post.updatedAt ?? post.publishedAt }))
}

/** Adres wpisu bez prefiksu języka — prefiks dokłada `Link` albo `localizedPath`. */
export function postPath(slug: string): string {
	return `/blog/${slug}`
}
