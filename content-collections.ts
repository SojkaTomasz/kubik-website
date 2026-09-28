import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { z } from 'zod'

/**
 * Warstwa treści — wpisy bloga w plikach MDX.
 *
 * Pliki leżą w `content/blog/<język>/<slug>.mdx`. Katalog decyduje o języku,
 * nazwa pliku o adresie. Dzięki temu wersje językowe mogą mieć różne slugi
 * (`/blog/jak-zaczac` i `/blog/getting-started`), co jest normą — tłumaczenie
 * adresu to element SEO, a nie techniczny szczegół.
 *
 * Schemat jest sprawdzany PRZY BUDOWANIU. Literówka w nazwie pola albo
 * brakująca data wywraca build z nazwą pliku w komunikacie, zamiast dawać
 * pustą stronę na produkcji.
 */

const frontmatter = z.object({
	title: z.string().min(1),
	/** Trafia do `<meta name="description">` i na kartę wpisu. */
	description: z.string().min(1).max(300),
	/** Data publikacji w formacie ISO: `2026-09-01`. */
	publishedAt: z.iso.date(),
	/** Data ostatniej istotnej zmiany — Google używa jej w wynikach. */
	updatedAt: z.iso.date().optional(),
	tags: z.array(z.string()).default([]),
	/**
	 * Szkic nie trafia do produkcyjnego builda ani do sitemapy, ale jest
	 * widoczny w trybie deweloperskim — można go obejrzeć przed publikacją.
	 */
	draft: z.boolean().default(false),
	/** Ścieżka do obrazu w `public/`, np. `/blog/okladka.jpg`. */
	cover: z.string().optional(),

	/*
	 * Treść wpisu poniżej frontmatteru.
	 *
	 * Deklarowana JAWNIE — content-collections dokładał ją kiedyś samo, ale to
	 * zachowanie jest wycofywane. Bez tego pola build wypisuje ostrzeżenie
	 * o deprecjacji, a w przyszłej wersji `document.content` byłoby puste.
	 */
	content: z.string(),
})

const posts = defineCollection({
	name: 'posts',
	directory: 'content/blog',
	include: '**/*.mdx',
	schema: frontmatter,
	transform: async (document, context) => {
		/*
		 * `_meta.path` to ścieżka względem katalogu kolekcji bez rozszerzenia,
		 * czyli `pl/jak-zaczac`. Pierwszy segment jest językiem, reszta slugiem.
		 *
		 * Rozdzielamy po OBU rodzajach ukośnika: na Windowsie `_meta.path` ma
		 * postać `pl\jak-zaczac`, więc podział wyłącznie po `/` zwracał całą
		 * ścieżkę jako język, a slug wychodził pusty.
		 */
		const [locale, ...rest] = document._meta.path.split(/[\\/]/)
		const slug = rest.join('/')

		if (!locale || !slug) {
			throw new Error(
				`Wpis "${document._meta.filePath}" leży bezpośrednio w content/blog. ` +
					'Oczekiwana struktura to content/blog/<język>/<slug>.mdx.'
			)
		}

		/*
		 * `remark-gfm` NIE jest ozdobnikiem.
		 *
		 * Bez niego MDX obsługuje wyłącznie podstawowy Markdown — tabela zapisana
		 * pionowymi kreskami renderuje się jako akapit z kreskami, a nie jako
		 * `<table>`. Tak samo listy zadań, przekreślenia i automatyczne linki.
		 * To wersja Markdowna, której ludzie faktycznie używają, więc pisząc wpis
		 * nikt nie spodziewa się, że tabela nie zadziała. Sprawdzone: bez tej
		 * wtyczki tabela z przykładowego wpisu nie pojawiała się w HTML-u.
		 *
		 * `rehype-slug` dokłada `id` do nagłówków, więc da się linkować do sekcji
		 * wpisu (`/blog/wpis#co-podmienic-na-start`). Prose ma na nagłówkach
		 * `scroll-mt-navbar`, żeby przyklejony nagłówek strony ich nie zasłaniał.
		 */
		const mdx = await compileMDX(context, document, {
			remarkPlugins: [remarkGfm],
			rehypePlugins: [rehypeSlug],
		})

		return {
			...document,
			locale,
			slug,
			mdx,
			/** Minuty czytania — 200 słów na minutę, zaokrąglone w górę. */
			readingTime: Math.max(1, Math.ceil(document.content.split(/\s+/).length / 200)),
		}
	},
})

export default defineConfig({
	// `content`, nie `collections` — ta druga nazwa jest wycofywana.
	content: [posts],
})
