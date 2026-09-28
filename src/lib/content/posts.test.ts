import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Warstwa dostępu do wpisów.
 *
 * Najważniejsza reguła sprawdzana tutaj to odsiewanie szkiców. Jej pominięcie
 * nie daje żadnego błędu — po prostu publikuje nieskończony tekst, i to
 * wychodzi na jaw dopiero wtedy, gdy ktoś go zobaczy na produkcji.
 *
 * Kolekcja jest podmieniana, żeby testy nie zależały od przykładowych wpisów
 * w `content/` — te są do skasowania przy pierwszym prawdziwym projekcie.
 */

const POSTS = [
	{
		locale: 'pl',
		slug: 'nowszy',
		title: 'Nowszy wpis',
		description: 'opis',
		publishedAt: '2026-05-10',
		tags: [],
		draft: false,
		mdx: '',
		content: 'słowo '.repeat(400),
		readingTime: 2,
		_meta: { path: 'pl/nowszy' },
	},
	{
		locale: 'pl',
		slug: 'starszy',
		title: 'Starszy wpis',
		description: 'opis',
		publishedAt: '2026-01-02',
		updatedAt: '2026-03-03',
		tags: ['x'],
		draft: false,
		mdx: '',
		content: 'tekst',
		readingTime: 1,
		_meta: { path: 'pl/starszy' },
	},
	{
		locale: 'pl',
		slug: 'szkic',
		title: 'Szkic',
		description: 'opis',
		publishedAt: '2026-06-01',
		tags: [],
		draft: true,
		mdx: '',
		content: 'tekst',
		readingTime: 1,
		_meta: { path: 'pl/szkic' },
	},
	{
		locale: 'en',
		slug: 'english-post',
		title: 'English post',
		description: 'desc',
		publishedAt: '2026-04-04',
		tags: [],
		draft: false,
		mdx: '',
		content: 'text',
		readingTime: 1,
		_meta: { path: 'en/english-post' },
	},
]

vi.mock('content-collections', () => ({ allPosts: POSTS }))

/** Ładuje moduł z ustawionym NODE_ENV — steruje widocznością szkiców. */
async function loadPosts(nodeEnv: 'development' | 'production') {
	vi.resetModules()
	vi.doMock('@/env', () => ({ env: { NODE_ENV: nodeEnv } }))

	return import('@/lib/content/posts')
}

describe('postsFor', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('zwraca wyłącznie wpisy w danym języku', async () => {
		const { postsFor } = await loadPosts('production')

		expect(postsFor('pl').map(post => post.slug)).not.toContain('english-post')
		expect(postsFor('en').map(post => post.slug)).toEqual(['english-post'])
	})

	it('układa wpisy od najnowszego', async () => {
		const { postsFor } = await loadPosts('production')

		expect(postsFor('pl').map(post => post.slug)).toEqual(['nowszy', 'starszy'])
	})

	it('ukrywa szkice w produkcji', async () => {
		const { postsFor } = await loadPosts('production')

		expect(postsFor('pl').map(post => post.slug)).not.toContain('szkic')
	})

	it('pokazuje szkice w trybie deweloperskim', async () => {
		// Szkic ma datę nowszą niż pozostałe, więc trafia na początek listy.
		const { postsFor } = await loadPosts('development')

		expect(postsFor('pl').map(post => post.slug)).toEqual(['szkic', 'nowszy', 'starszy'])
	})
})

describe('postBySlug', () => {
	it('znajduje wpis po slugu w odpowiednim języku', async () => {
		const { postBySlug } = await loadPosts('production')

		expect(postBySlug('pl', 'nowszy')?.title).toBe('Nowszy wpis')
	})

	it('nie znajduje wpisu z innego języka', async () => {
		// Bez tego /blog/english-post działałoby też pod polskim adresem,
		// dając stronę po angielsku z polskim interfejsem.
		const { postBySlug } = await loadPosts('production')

		expect(postBySlug('pl', 'english-post')).toBeUndefined()
	})

	it('nie znajduje szkicu w produkcji', async () => {
		const { postBySlug } = await loadPosts('production')

		expect(postBySlug('pl', 'szkic')).toBeUndefined()
	})

	it('zwraca undefined dla nieistniejącego slugu, zamiast rzucać', async () => {
		const { postBySlug } = await loadPosts('production')

		expect(postBySlug('pl', 'nie-ma-takiego')).toBeUndefined()
	})
})

describe('publishedPostPaths', () => {
	it('pomija szkice NAWET w trybie deweloperskim', async () => {
		/*
		 * To jest cel tej funkcji. `postsFor` w trybie dev pokazuje szkice, żeby
		 * dało się je obejrzeć — ale sitemap i generateStaticParams nie mogą ich
		 * brać, bo lokalny build wygenerowałby adres, który na produkcji zwraca
		 * 404, a Google dostałby go w sitemapie.
		 */
		const { publishedPostPaths } = await loadPosts('development')

		expect(publishedPostPaths('pl').map(entry => entry.slug)).toEqual(['nowszy', 'starszy'])
	})

	it('używa daty aktualizacji, gdy jest podana', async () => {
		// Inaczej Google widzi datę pierwszej publikacji mimo poprawek w treści.
		const { publishedPostPaths } = await loadPosts('production')

		const older = publishedPostPaths('pl').find(entry => entry.slug === 'starszy')

		expect(older?.updatedAt).toBe('2026-03-03')
	})

	it('spada do daty publikacji, gdy aktualizacji nie było', async () => {
		const { publishedPostPaths } = await loadPosts('production')

		const newer = publishedPostPaths('pl').find(entry => entry.slug === 'nowszy')

		expect(newer?.updatedAt).toBe('2026-05-10')
	})
})

describe('postPath', () => {
	it('buduje ścieżkę BEZ prefiksu języka', async () => {
		// Prefiks dokłada Link z @/i18n/navigation. Sklejenie go tutaj dałoby
		// adresy w rodzaju /en/en/blog/....
		const { postPath } = await loadPosts('production')

		expect(postPath('jak-zaczac')).toBe('/blog/jak-zaczac')
	})
})
