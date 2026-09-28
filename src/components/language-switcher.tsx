'use client'

import { Languages } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

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
 * Przełącznik języka zachowujący bieżącą ścieżkę.
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
						size='icon'
						disabled={isPending}
						aria-label={t('label')}
					>
						<Languages className='size-5' />
					</Button>
				}
			/>
			<DropdownMenuContent align='end'>
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
						>
							{t(locale as Locale)}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
