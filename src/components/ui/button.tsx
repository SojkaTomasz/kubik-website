'use client'

import { Button as ButtonPrimitive } from '@base-ui/react/button'
import NextLink from 'next/link'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { isUnlocalizedPath } from '@/lib/routes'
import type * as React from 'react'

import type { VariantProps } from '@/lib/cva'

import {
	type ButtonIconEffect,
	buttonVariants,
	iconEffectClasses,
} from '@/components/ui/button.variants'
import { Spinner } from '@/components/ui/spinner'
import { scrollToAnchor } from '@/lib/scroll'
import { cn } from '@/lib/utils'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: `href`, `icon`/`iconPosition`/
 * `iconEffect`, `isLoading`, oś `radius`, rozmiary `xl` i `none`,
 * zapowiedź nowej karty dla czytnika ekranu.
 * `shadcn add button --overwrite` to skasuje. Pełna lista: AGENTS.md.
 */

export interface ButtonExtraProps {
	/**
	 * Adres docelowy. Jego obecność zmienia element wynikowy:
	 *   /o-nas     → next/link, z prefetchem i nawigacją klientową
	 *   #kontakt   → kotwica z płynnym przewijaniem pod przyklejoną nawigację
	 *   https://…  → <a target="_blank"> z rel zabezpieczającym okno źródłowe
	 * Rozpoznawane jako zewnętrzne są też `mailto:` i `tel:`.
	 */
	href?: string
	/** Wymuszenie zachowania zewnętrznego, gdy heurystyka po `href` nie wystarcza. */
	external?: boolean
	target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target']
	rel?: string
	/** Ikona obok tekstu. Rozmiar dobiera się sam do rozmiaru przycisku. */
	icon?: React.ReactNode
	iconPosition?: 'left' | 'right'
	iconEffect?: ButtonIconEffect
	/** Blokuje przycisk, ustawia `aria-busy`, podmienia ikonę na spinner. Szerokość nie skacze. */
	isLoading?: boolean
	/**
	 * Zapowiedź „otwiera się w nowej karcie" dopisywana dla czytnika ekranu.
	 *
	 * Ustaw `false` tylko wtedy, gdy widoczny tekst przycisku już to mówi —
	 * inaczej czytnik powtórzy informację dwa razy. Na ekranie nie zmienia nic:
	 * napis jest `sr-only`.
	 */
	announceNewTab?: boolean
}

/**
 * Zapowiedź nowej karty. OSOBNY komponent, nie `useTranslations` w `Button` —
 * `global-error.tsx` renderuje `Button` bez kontekstu next-intl (ginie razem
 * z root layoutem), więc hook wywołany bezwarunkowo wywracałby ostatnią granicę
 * błędu w aplikacji. Tutaj hook uruchamia się dopiero wtedy, gdy zapowiedź
 * faktycznie wchodzi do drzewa.
 */
function NewTabHint() {
	const t = useTranslations('a11y')

	return <span className='sr-only'>{` (${t('opensInNewTab')})`}</span>
}

export type ButtonProps = ButtonPrimitive.Props &
	VariantProps<typeof buttonVariants> &
	ButtonExtraProps

function ButtonContent({
	icon,
	iconPosition,
	iconEffect,
	isLoading,
	children,
}: Required<Pick<ButtonExtraProps, 'iconPosition' | 'iconEffect' | 'isLoading'>> &
	Pick<ButtonExtraProps, 'icon'> & { children?: React.ReactNode }) {
	const effect = iconEffectClasses[iconEffect]
	const renderedIcon = isLoading ? <Spinner /> : icon

	return (
		<>
			{renderedIcon && iconPosition === 'left' && (
				<span
					data-icon='inline-start'
					className={cn('inline-flex items-center', effect)}
				>
					{renderedIcon}
				</span>
			)}
			{children}
			{renderedIcon && iconPosition === 'right' && (
				<span
					data-icon='inline-end'
					className={cn('inline-flex items-center', effect)}
				>
					{renderedIcon}
				</span>
			)}
		</>
	)
}

function Button({
	className,
	variant = 'default',
	size = 'default',
	radius = 'theme',
	href,
	external,
	target,
	rel,
	icon,
	iconPosition = 'left',
	iconEffect = 'none',
	isLoading = false,
	announceNewTab = true,
	children,
	...props
}: ButtonProps) {
	const classes = cn(buttonVariants({ variant, size, radius, className }))

	const content = (
		<ButtonContent
			icon={icon}
			iconPosition={iconPosition}
			iconEffect={iconEffect}
			isLoading={isLoading}
		>
			{children}
		</ButtonContent>
	)

	if (href) {
		const isAnchor = href.startsWith('#')
		const isExternal = external ?? /^(https?:|\/\/|mailto:|tel:)/.test(href)
		// `mailto:` i `tel:` przejmuje program pocztowy albo dialer, a otwarta dla
		// nich karta zostaje pusta. Adres http nadal idzie do nowej karty, bo
		// wyprowadza z serwisu.
		const handOffToSystem = /^(mailto:|tel:|sms:)/.test(href)

		// Linki BEZ prymitywu Base UI: ten dokłada `role="button"` i własną obsługę
		// klawiatury, więc czytnik ogłasza „przycisk", choć element nawiguje.
		// `<a>` ma już wszystko; bierzemy stąd tylko klasy wyglądu.
		const linkProps = {
			'data-slot': 'button',
			className: classes,
			...(isLoading && { 'aria-busy': true, 'aria-disabled': true }),
			...(props as React.ComponentPropsWithoutRef<'a'>),
		}

		if (isExternal) {
			const resolvedTarget = target ?? (handOffToSystem ? undefined : '_blank')

			return (
				<a
					href={href}
					target={resolvedTarget}
					// Bez noopener otwarta strona dostaje uchwyt do naszego okna
					// przez window.opener i może je przekierować.
					rel={rel ?? 'noopener noreferrer'}
					{...linkProps}
				>
					{content}
					{/*
						Nowa karta bez zapowiedzi to zmiana kontekstu bez ostrzeżenia
						(WCAG 3.2.5, technika G201). Osoba widząca zauważy nową kartę
						sama, czytnik ekranu nie powie o niej nic.
					*/}
					{resolvedTarget === '_blank' && announceNewTab && <NewTabHint />}
				</a>
			)
		}

		if (isAnchor) {
			return (
				<a
					href={href}
					onClick={event => {
						// Przewijamy sami, żeby ominąć nagłówek przyklejony do góry
						// strony i nie dopisywać kotwicy do historii przeglądarki.
						if (scrollToAnchor(href)) event.preventDefault()
					}}
					{...linkProps}
				>
					{content}
				</a>
			)
		}

		/*
		 * Trasy spoza routingu językowego (`/dev`, `/api`) dostają zwykły
		 * `next/link` — doklejenie im prefiksu dałoby nieistniejące `/en/dev`.
		 */
		if (isUnlocalizedPath(href)) {
			return (
				<NextLink
					href={href}
					target={target}
					rel={rel}
					{...linkProps}
				>
					{content}
				</NextLink>
			)
		}

		/*
		 * `Link` z `@/i18n/navigation`, nie z `next/link`: ten drugi wyrzuca
		 * użytkownika oglądającego `/en` z powrotem na wersję polską — cicho, bo
		 * adres istnieje. Wymaga kontekstu next-intl, dlatego opakowuje w niego
		 * drzewo także root layout stron `/dev`.
		 */
		return (
			<Link
				href={href}
				target={target}
				rel={rel}
				{...linkProps}
			>
				{content}
			</Link>
		)
	}

	return (
		<ButtonPrimitive
			data-slot='button'
			className={classes}
			disabled={isLoading || props.disabled}
			aria-busy={isLoading || undefined}
			{...props}
		>
			{content}
		</ButtonPrimitive>
	)
}

export { Button }
export type { ButtonIconEffect }
