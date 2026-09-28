'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/*
 * Etykiety są KLUCZAMI tłumaczeń, nie gotowym tekstem. Wcześniej stały tu
 * polskie napisy i menu zostawało po polsku również na `/en` — mimo że komplet
 * tłumaczeń leżał w messages/*.json nieużywany.
 */
const OPTIONS = [
	{ value: 'light', key: 'light', icon: Sun },
	{ value: 'dark', key: 'dark', icon: Moon },
	{ value: 'system', key: 'system', icon: Monitor },
] as const

/**
 * Przełącznik motywu.
 *
 * Obie ikony są renderowane jednocześnie i przełączane wariantem `dark:` — dzięki
 * temu przycisk wygląda poprawnie już w pierwszej klatce SSR, bez czekania aż
 * `useTheme()` pozna motyw po stronie klienta (co dawałoby mignięcie złej ikony).
 *
 * Pozycje są przyciskami radiowymi, nie zwykłymi pozycjami menu. Powód jest
 * wyłącznie dostępnościowy: wybrany motyw widać po podświetleniu, a czytnik
 * ekranu nie ma z czego go odczytać. `menuitemradio` niesie stan zaznaczenia,
 * więc ogłasza „Ciemny, zaznaczony" i mówi wprost, co jest ustawione.
 */
export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const t = useTranslations('theme')

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant='ghost'
						size='icon'
						aria-label={t('label')}
					>
						<Sun className='size-5 dark:hidden' />
						<Moon className='hidden size-5 dark:block' />
					</Button>
				}
			/>
			<DropdownMenuContent align='end'>
				{/*
					`theme` jest bezpieczne dla hydracji: `useSyncExternalStore` oddaje
					serwerowi wartość domyślną, a prawdziwy wybór dochodzi dopiero po
					hydracji — czyli przed pierwszym otwarciem menu.
				*/}
				<DropdownMenuRadioGroup
					value={theme}
					aria-label={t('group')}
					onValueChange={value => setTheme(value as (typeof OPTIONS)[number]['value'])}
				>
					{OPTIONS.map(({ value, key, icon: Icon }) => (
						<DropdownMenuRadioItem
							key={value}
							value={value}
							// `closeOnClick` jawnie: pozycje radiowe Base UI domyślnie
							// ZOSTAWIAJĄ menu otwarte, bo służą zwykle do przestawiania
							// kilku opcji naraz. Tu wybór jest jeden i kończy sprawę.
							closeOnClick
						>
							<Icon className='size-4' />
							{t(key)}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
