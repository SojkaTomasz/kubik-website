/**
 * Pozycje nawigacji — wspólne dla nagłówka, menu na telefonie i stopki.
 *
 * Wyłącznie trasy, które istnieją. Usługa i Realizacje z projektu w Paperze
 * dojdą tutaj razem ze swoimi stronami — wpisane wcześniej prowadziłyby do 404.
 *
 * `matchNested` dla bloga: wpis leży pod `/blog/<slug>`, więc pozycja menu ma
 * zostać oznaczona jako bieżąca także tam. Pozostałe trasy są liśćmi.
 */
export const SITE_NAV_LINKS = [
	{ href: '/blog', key: 'blog', matchNested: true },
	{ href: '/kontakt', key: 'contact', matchNested: false },
] as const
