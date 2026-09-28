/**
 * Fonty w CSS (`theme/fonts.css`), nie przez `next/font`: ten nie pozwala przypisać
 * `unicode-range` do pojedynczego pliku, a rozbicie na latin / latin-ext jest
 * konieczne (polskie znaki siedzą w latin-ext).
 *
 * W zamian preload sterujemy ręcznie — patrz niżej.
 */

export interface FontPreload {
	href: string
	/** Subset — wyłącznie do czytelności listy poniżej. */
	subset: 'latin' | 'latin-ext'
}

/**
 * Preload w `<head>` — tylko font `body`, w obu subsetach. Każdy dołożony wpis
 * opóźnia pierwsze malowanie, więc dokładaj wyłącznie fonty nad linią zgięcia.
 */
export const preloadedFonts: FontPreload[] = [
	{ href: '/fonts/inter-latin.woff2', subset: 'latin' },
	{ href: '/fonts/inter-latin-ext.woff2', subset: 'latin-ext' },
]

/**
 * Rodziny dostępne w projekcie — źródło prawdy dla strony /dev/styleguide.
 * `variable` to nazwa zmiennej CSS z `theme/typography.css`.
 */
export const fontFamilies = [
	{
		name: 'Inter',
		role: 'Tekst podstawowy',
		variable: '--font-body',
		weights: '100–900',
		className: 'font-sans',
	},
	{
		name: 'Oswald',
		role: 'Nagłówki / display',
		variable: '--font-display',
		weights: '200–700',
		className: 'font-display',
	},
	{
		name: 'Playfair Display',
		role: 'Szeryfowy akcent',
		variable: '--font-serif',
		weights: '400–900',
		className: 'font-serif',
	},
	{
		name: 'JetBrains Mono',
		role: 'Kod i dane techniczne',
		variable: '--font-code',
		weights: '100–800',
		className: 'font-mono',
	},
] as const
