'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { usePathname } from '@/i18n/navigation'

/**
 * Pozycja nawigacji świadoma tego, gdzie użytkownik właśnie jest.
 *
 * `aria-current` to jedyna informacja o bieżącej stronie, jaką dostaje czytnik
 * ekranu — podświetlenie pozycji widzi wyłącznie oko. Bez tego atrybutu osoba
 * niewidoma przechodząc przez menu nie wie, którą podstronę już czyta, i nie ma
 * jak się tego dowiedzieć inaczej niż z tytułu dokumentu.
 *
 * Komponent kliencki, bo adres bieżącej strony zna tylko router. Warstwą wyglądu
 * zostaje `Button` — tu dochodzi wyłącznie atrybut.
 */
export interface NavLinkProps extends Omit<ButtonProps, 'href'> {
	href: string
	/**
	 * `true` oznacza pozycję prowadzącą do sekcji: `/blog` zostaje oznaczone także
	 * na `/blog/jakis-wpis`. Domyślnie liczy się wyłącznie dokładny adres, bo
	 * `aria-current='page'` na stronie, której się nie czyta, wprowadza w błąd.
	 */
	matchNested?: boolean
	children: React.ReactNode
}

/**
 * `aria-current` dla adresu.
 *
 * Wartości są dwie i różnią się znaczeniem: `page` to TA strona, `true` to
 * pozycja, w której obrębie jesteśmy. Czytniki ogłaszają pierwszą jako „bieżąca
 * strona", drugą jako „bieżący element".
 */
function currentFor(
	pathname: string,
	href: string,
	matchNested: boolean
): 'page' | true | undefined {
	if (pathname === href) return 'page'
	if (matchNested && pathname.startsWith(`${href}/`)) return true
	return undefined
}

export function NavLink({ href, matchNested = false, children, ...props }: NavLinkProps) {
	// `usePathname` z `@/i18n/navigation`, nie z `next/navigation`: ten pierwszy
	// zwraca adres BEZ prefiksu języka, więc porównanie z `href='/blog'` działa
	// tak samo na `/blog` i na `/en/blog`.
	const pathname = usePathname()

	return (
		<Button
			href={href}
			aria-current={currentFor(pathname, href, matchNested)}
			{...props}
		>
			{children}
		</Button>
	)
}
