'use client'

import toUpper from 'lodash/toUpper'
import { ChevronDown } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { type ReactNode, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from '@/i18n/navigation'
import { isMultilingual, type Locale, locales } from '@/site.config'

/**
 * Flagi jako SVG, nie emoji: Windows nie ma glifów flag i zamiast nich pokazuje
 * same litery „PL", „GB". Angielski to flaga brytyjska — umowny znak języka,
 * nie kraju. Dekoracyjne (`aria-hidden`): nazwę języka niesie tekst obok.
 */
const FLAGS: Record<Locale, ReactNode> = {
	pl: (
		<svg
			viewBox='0 0 16 10'
			className='block size-full'
			preserveAspectRatio='none'
		>
			<rect
				width='16'
				height='5'
				fill='#fff'
			/>
			<rect
				y='5'
				width='16'
				height='5'
				fill='#dc143c'
			/>
		</svg>
	),
	en: (
		<svg
			viewBox='0 0 60 30'
			className='block size-full'
			preserveAspectRatio='xMidYMid slice'
		>
			<rect
				width='60'
				height='30'
				fill='#012169'
			/>
			<path
				d='M0,0 L60,30 M60,0 L0,30'
				stroke='#fff'
				strokeWidth='6'
			/>
			<path
				d='M0,0 L60,30 M60,0 L0,30'
				stroke='#c8102e'
				strokeWidth='2'
			/>
			<path
				d='M30,0 v30 M0,15 h60'
				stroke='#fff'
				strokeWidth='10'
			/>
			<path
				d='M30,0 v30 M0,15 h60'
				stroke='#c8102e'
				strokeWidth='6'
			/>
		</svg>
	),
}

function Flag({ locale }: { locale: Locale }) {
	return (
		<span
			aria-hidden
			className='inline-flex h-3.5 w-5 shrink-0 overflow-hidden ring-1 ring-white/10'
		>
			{FLAGS[locale]}
		</span>
	)
}

/**
 * Przełącznik języka zachowujący bieżącą ścieżkę.
 *
 * Przycisk pokazuje flagę i kod bieżącego języka („PL") zamiast ikony
 * `Languages` — ta była za mała i nieczytelna. Nazwa dostępna zawiera widoczny
 * kod (WCAG 2.5.3, „etykieta w nazwie"): „Zmień język: PL". Menu i flagi są
 * kanciaste jak nagłówek i reszta serwisu.
 *
 * Na stronie jednojęzycznej nie renderuje niczego — menu z jedną pozycją,
 * na dodatek zablokowaną, jest dla użytkownika myleniem, a nie funkcją.
 * Dzięki temu widoki mogą wstawiać go bezwarunkowo.
 *
 * `usePathname` z `@/i18n/navigation` zwraca adres BEZ prefiksu języka, więc
 * `/en/kontakt` widzimy tu jako `/kontakt` i wystarczy podać nowy język. Wersja
 * z `next/navigation` wymagałaby ręcznego obcinania prefiksu — i myliłaby się
 * przy `localePrefix: 'as-needed'`, gdzie język domyślny prefiksu nie ma.
 *
 * Pozycje są przyciskami radiowymi, a bieżący język NIE jest już zablokowany.
 * Jedno i drugie z powodu czytnika ekranu: `disabled` ogłaszało „niedostępny",
 * czyli „coś tu nie działa", zamiast „to jest ustawione teraz". `menuitemradio`
 * mówi wprost „Polski, zaznaczony", a wybór bieżącego języka staje się
 * nieszkodliwą nawigacją pod ten sam adres.
 */
export function LanguageSwitcher() {
	const t = useTranslations('language')
	const activeLocale = useLocale()
	const router = useRouter()
	const pathname = usePathname()
	const [isPending, startTransition] = useTransition()

	// Po hookach, nie przed — wcześniejszy powrót łamałby reguły hooków,
	// nawet gdy warunek jest stałą znaną w czasie kompilacji.
	if (!isMultilingual) return null

	const switchTo = (locale: string) => {
		if (locale === activeLocale) return

		startTransition(() => {
			// `pathname` z @/i18n/navigation ma już wypełnione segmenty dynamiczne,
			// więc wystarczy podać go jako string — zmienia się tylko język.
			router.replace(pathname, { locale })
		})
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant='ghost'
						disabled={isPending}
						className='gap-2 px-2.5 font-heading font-extrabold'
					>
						<Flag locale={activeLocale as Locale} />
						<span className='sr-only'>{t('label')}: </span>
						{/* Na najwęższych telefonach sama flaga — kod zostaje dla czytnika. */}
						<span className='max-[23.75rem]:sr-only'>{toUpper(activeLocale)}</span>
						<ChevronDown className='hidden size-4 text-muted-foreground sm:block' />
					</Button>
				}
			/>
			<DropdownMenuContent
				align='end'
				className='rounded-none'
			>
				<DropdownMenuRadioGroup
					value={activeLocale}
					aria-label={t('group')}
					onValueChange={value => switchTo(value as string)}
				>
					{/*
						Bez `lang` na pozycji: nazwa języka jest przetłumaczona na język
						strony („Angielski"), więc atrybut przełączyłby czytnik na angielską
						syntezę i kazał jej przeczytać polskie słowo. `hrefLang` też nie —
						to pozycja menu, nie odnośnik.
					*/}
					{locales.map(locale => (
						<DropdownMenuRadioItem
							key={locale}
							value={locale}
							// `closeOnClick` jawnie: pozycje radiowe Base UI domyślnie
							// ZOSTAWIAJĄ menu otwarte, bo służą zwykle do przestawiania
							// kilku opcji naraz. Tu wybór jest jeden i kończy sprawę.
							closeOnClick
							className='gap-2.5 rounded-none'
						>
							<Flag locale={locale} />
							{t(locale)}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
