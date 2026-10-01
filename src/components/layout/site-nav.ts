/**
 * Pozycje nawigacji — wspólne dla nagłówka, menu na telefonie i stopki
 * (docs/zakres.md: Usługa, Realizacje, Kontakt).
 *
 * `matchNested`: strony miast leżą pod adresem usługi, a realizacje pod listą,
 * więc pozycja menu zostaje oznaczona jako bieżąca także tam. Kontakt jest liściem.
 */
export const SITE_NAV_LINKS = [
	{ href: '/frezowanie-pod-ogrzewanie-podlogowe', key: 'service', matchNested: true },
	{ href: '/realizacje', key: 'projects', matchNested: true },
	{ href: '/kontakt', key: 'contact', matchNested: false },
] as const
