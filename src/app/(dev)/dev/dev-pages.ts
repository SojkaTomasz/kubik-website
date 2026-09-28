/**
 * Spis stron deweloperskich — zasila nawigację i stronę indeksu.
 *
 * W biletNet takiego spisu nie było i do styleguide'u trzeba było trafiać
 * z pamięci, wpisując adres ręcznie. Jedna tablica rozwiązuje oba miejsca.
 */
export interface DevPage {
	href: string
	title: string
	description: string
}

export const devPages: DevPage[] = [
	{
		href: '/dev/styleguide',
		title: 'Styleguide',
		description:
			'Fundamenty systemu: kolory, typografia, odstępy, cienie, promienie, stany interaktywne i ikonografia — z wartościami czytanymi na żywo z CSS.',
	},
	{
		href: '/dev/components',
		title: 'Komponenty',
		description:
			'Wszystkie komponenty z components/ui z pełnymi matrycami wariantów. Miejsce, w którym ustawiasz wygląd zanim zaczniesz budować widoki.',
	},
]
