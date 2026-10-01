'use client'

import { Phone } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { companyConfig } from '@/company.config'
import { Button } from '@/components/ui/button'
import { useIsOpen } from '@/hooks/use-is-open'
import { usePathname } from '@/i18n/navigation'
import { phoneLinks } from '@/lib/phone'

const QuoteDialog = dynamic(() =>
	import('@/components/quote/quote-dialog').then(module => module.QuoteDialog)
)

/** Klucz w sessionStorage — okienko pokazuje się raz na wizytę (docs/zakres.md). */
const SHOWN_KEY = 'quote-popup-shown'

/** Okienko po przewinięciu dwóch trzecich strony. */
const SCROLL_SHARE = 2 / 3

/** Strony, na których formularz jest głównym tematem albo okienko by przeszkadzało. */
const SKIPPED_PATHS = ['/kontakt', '/polityka-prywatnosci']

function wasShown(): boolean {
	try {
		return sessionStorage.getItem(SHOWN_KEY) === '1'
	} catch {
		// Zablokowany storage — lepiej nie pokazać niż pokazywać przy każdej stronie.
		return true
	}
}

function markShown() {
	try {
		sessionStorage.setItem(SHOWN_KEY, '1')
	} catch {
		// Bez storage okienko i tak otworzy się najwyżej raz na tę stronę.
	}
}

/**
 * Czy da się teraz pokazać okienko, nie wchodząc nikomu w drogę: baner zgód
 * czeka na decyzję, inne okno jest otwarte albo formularz wyceny jest już
 * w polu widzenia.
 */
function canInterrupt(): boolean {
	if (document.documentElement.classList.contains('consent-pending')) return false
	if (document.querySelector('[data-slot="dialog-content"]')) return false

	const form = document.getElementById('wycena')?.getBoundingClientRect()
	if (form && form.top < window.innerHeight && form.bottom > 0) return false

	return true
}

/**
 * Warstwa wyceny wspólna dla wszystkich stron (docs/zakres.md):
 *
 * - **przyklejony pasek na telefonie** — „Zadzwoń" i „Darmowa wycena". Jest
 *   w HTML-u z serwera, a chowa go CSS od tabletu, więc nic nie dorysowuje się
 *   po hydracji. „Darmowa wycena" otwiera okienko, a nie kotwicę — działa też
 *   na stronach bez sekcji formularza.
 * - **okienko wyceny** — samo otwiera się raz na wizytę, po przewinięciu dwóch
 *   trzecich strony albo gdy kursor wyjeżdża ku górze okna (zamiar wyjścia).
 *   Otwarcie wynika z ruchu użytkownika, nie ze startu Reacta.
 */
export function QuoteLayer() {
	const t = useTranslations('nav')
	const popup = useIsOpen()
	const phone = companyConfig.phone ? phoneLinks(companyConfig.phone) : undefined
	const pathname = usePathname()
	const isSkipped = SKIPPED_PATHS.includes(pathname)
	const { handleOpen } = popup

	useEffect(() => {
		if (isSkipped || wasShown()) return undefined

		const open = () => {
			if (wasShown() || !canInterrupt()) return
			markShown()
			handleOpen()
			cleanup()
		}

		const handleScroll = () => {
			const { scrollHeight } = document.documentElement
			if (window.scrollY + window.innerHeight >= scrollHeight * SCROLL_SHARE) open()
		}

		const handleMouseOut = (event: MouseEvent) => {
			if (!event.relatedTarget && event.clientY <= 0) open()
		}

		function cleanup() {
			window.removeEventListener('scroll', handleScroll)
			document.removeEventListener('mouseout', handleMouseOut)
		}

		window.addEventListener('scroll', handleScroll, { passive: true })
		document.addEventListener('mouseout', handleMouseOut)

		return cleanup
	}, [isSkipped, handleOpen])

	const openFromBar = () => {
		markShown()
		handleOpen()
	}

	return (
		<>
			<div
				data-slot='sticky-call-bar'
				className='fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden'
			>
				{phone && (
					<Button
						href={phone.href}
						variant='call'
						size='lg'
						icon={<Phone />}
					>
						{t('call')}
					</Button>
				)}
				<Button
					size='lg'
					className={phone ? undefined : 'col-span-2'}
					onClick={openFromBar}
				>
					{t('quote')}
				</Button>
			</div>

			{popup.isOpen && (
				<QuoteDialog
					open={popup.isOpen}
					onOpenChange={popup.handleOpenChange}
				/>
			)}
		</>
	)
}
