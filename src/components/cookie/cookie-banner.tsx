'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { CONSENT_PENDING_CLASS } from '@/lib/analytics/consent'

export interface CookieBannerProps {
	/** Decyzja podjęta w tej wizycie. Otwarte okno NIE chowa banera — warstwy się nakładają. */
	hidden?: boolean
	onAcceptAll: () => void
	onOpenSettings: () => void
	/** Otwiera politykę w oknie — baner blokuje serwis, więc przejście na stronę nie ma sensu. */
	onOpenPrivacy: () => void
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Czy baner jest FAKTYCZNIE widoczny.
 *
 * Renderuje się zawsze, także po decyzji — chowa go klasa na `<html>` zdejmowana
 * przed pierwszym malowaniem. Nie ma więc innego sposobu, żeby React się o tym
 * dowiedział, niż zapytać o tę klasę.
 */
function isPending(): boolean {
	return document.documentElement.classList.contains(CONSENT_PENDING_CLASS)
}

/** Klasa odpalająca pulsowanie. Definicja animacji: `app/theme/consent.css`. */
const PULSE_CLASS = 'consent-pulse'

/**
 * Baner zgody — modal blokujący stronę do czasu decyzji.
 *
 * ⚠️ Nie ma przycisku odrzucenia w pierwszym kroku; odmowa idzie przez
 * „Ustawienia". To decyzja właściciela strony z ryzykiem prawnym (EROD, UODO:
 * odmowa ma być tak samo łatwa jak zgoda). Przywrócenie równorzędnej odmowy to
 * jeden `Button` z `onRejectAll`.
 *
 * Baner jest w HTML-u z serwera ZAWSZE, a o widoczności decyduje klasa na
 * `<html>` zdejmowana przed pierwszym malowaniem. Powód i pomiary:
 * `docs/consent-layer.md`.
 */
export function CookieBanner({
	hidden,
	onAcceptAll,
	onOpenSettings,
	onOpenPrivacy,
}: CookieBannerProps) {
	const t = useTranslations('cookies')
	const dialogRef = useRef<HTMLDivElement>(null)
	const messageId = useId()
	/**
	 * Treść obszaru `aria-live` odpowiadającego na próbę ominięcia banera.
	 *
	 * Pulsowanie karty jest odpowiedzią WYŁĄCZNIE wzrokową: kto nie widzi, ten po
	 * naciśnięciu Escape albo kliknięciu w tło nie dowiaduje się niczego i ma
	 * prawo sądzić, że strona zawisła. Napis jest `sr-only`, więc wygląd zostaje
	 * bez zmian.
	 */
	const [liveMessage, setLiveMessage] = useState('')
	/** Uchwyt `requestAnimationFrame` z `pulse()` — do anulowania przy odmontowaniu. */
	const announceFrameRef = useRef(0)

	useEffect(() => () => cancelAnimationFrame(announceFrameRef.current), [])

	// Warunek sprawdza klasę na `<html>`, bo o widoczności decyduje CSS —
	// React nie ma innego sposobu, żeby się dowiedzieć, czy baner widać.
	useEffect(() => {
		if (hidden) return
		if (!isPending()) return

		dialogRef.current?.focus({ preventScroll: true })
	}, [hidden])

	/*
	 * Odcięcie tła od czytnika ekranu.
	 *
	 * `aria-modal` deklaruje, że pod oknem nic nie ma, ale czytniki traktują tę
	 * deklarację różnie — NVDA w trybie przeglądania potrafi zjechać strzałkami na
	 * nagłówek i treść pod banerem. Osoba niewidoma czyta wtedy stronę, której
	 * baner miał nie wypuszczać, i nie ma powodu przypuszczać, że gdziekolwiek
	 * czeka na nią decyzja. `inert` wyjmuje gałąź z drzewa dostępności I odbiera
	 * jej fokus, więc zamyka jedno i drugie naraz.
	 *
	 * Trzy rzeczy, bez których to się psuje:
	 *
	 * 1. Ten sam warunek `isPending()` co przy fokusie. Bez niego powracający
	 *    użytkownik — u którego baner jest w HTML-u, ale ukryty CSS-em — dostaje
	 *    CAŁĄ stronę martwą.
	 * 2. Lista rodzeństwa zdejmowana RAZ, przy wejściu. Okna zgód portalują się
	 *    później do `<body>`, więc nie trafiają na tę listę i działają normalnie.
	 * 3. `inert` nie wpływa na układ, więc nie łamie reguły „nic nie pojawia się
	 *    po hydracji" — nie ma tu czego przesunąć ani domalować.
	 */
	useEffect(() => {
		// `() => {}` zamiast gołego `return`: efekt oddaje funkcję czyszczącą
		// w jednej gałęzi, więc musi ją oddawać w każdej (eslint consistent-return).
		if (hidden) return () => {}
		if (!isPending()) return () => {}

		const banner = dialogRef.current?.closest('[data-slot="cookie-banner"]')
		if (!banner) return () => {}

		const siblings = [...document.body.children].filter(
			(element): element is HTMLElement => element !== banner && element instanceof HTMLElement
		)

		for (const element of siblings) element.inert = true

		return () => {
			for (const element of siblings) element.inert = false
		}
	}, [hidden])

	/**
	 * Odpowiedź na próbę ominięcia banera.
	 *
	 * Klasa zakładana imperatywnie: animacja startuje raz, w momencie założenia,
	 * więc trzymana w stanie nie odpaliłaby się PONOWNIE. Odczyt `offsetWidth`
	 * wymusza przeliczenie układu — bez niego zdjęcie i założenie klasy w jednej
	 * klatce znoszą się nawzajem.
	 */
	const pulse = () => {
		const dialog = dialogRef.current
		if (!dialog) return

		dialog.classList.remove(PULSE_CLASS)
		void dialog.offsetWidth
		dialog.classList.add(PULSE_CLASS)

		/*
		 * Obszar `aria-live` ogłasza ZMIANĘ treści, więc ustawienie tego samego
		 * zdania po raz drugi jest dla czytnika ciszą. Trzeba go najpierw
		 * wyczyścić — ale w OSOBNYM renderze: React scala oba wywołania w jedno
		 * przejście, więc puste `''` nigdy nie trafiłoby do DOM-u i druga próba
		 * ominięcia banera przeszłaby bez słowa. Stąd druga klatka.
		 */
		setLiveMessage('')
		cancelAnimationFrame(announceFrameRef.current)
		announceFrameRef.current = requestAnimationFrame(() => setLiveMessage(t('decisionRequired')))
	}

	/** `aria-modal` odcina czytnik ekranu, ale nie fokus klawiatury — stąd własna pułapka. */
	const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
		// Escape nie zamyka okna (decyzja jest wymagana), ale musi coś zrobić.
		if (event.key === 'Escape') {
			event.preventDefault()
			pulse()
			return
		}

		if (event.key !== 'Tab') return

		const dialog = dialogRef.current
		if (!dialog) return

		const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)]
		const first = focusable.at(0)
		const last = focusable.at(-1)
		if (!first || !last) return

		// Fokus na kontenerze — stan po wejściu na stronę.
		if (event.target === dialog) {
			event.preventDefault()
			;(event.shiftKey ? last : first).focus()
			return
		}

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault()
			last.focus()
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault()
			first.focus()
		}
	}

	return (
		<div
			data-slot='cookie-banner'
			// `undefined` zamiast `false` — `data-hidden="false"` pasuje do selektora
			// atrybutowego tak samo dobrze jak `data-hidden=""`.
			data-hidden={hidden || undefined}
			/*
			 * ŻADNEJ KLASY DISPLAY NA TYM ELEMENCIE.
			 *
			 * Reguły `display: none` chowające baner siedzą w warstwie `base`, którą
			 * każda utility Tailwinda bije niezależnie od specyficzności. Postawione
			 * tu `flex` sprawiło, że baner przestał znikać. Wyśrodkowanie robi
			 * osobny element w środku.
			 */
			className='fixed inset-0 z-50 overflow-y-auto'
		>
			{/*
				Zasłona. Kolor wpisany na sztywno, nie z tokenu: rampa marki jest
				w motywie ciemnym odwrócona, więc token dałby tam JASNĄ zasłonę.

				To ona niesie kliknięcie obok karty — jest pozycjonowana, więc leży
				nad niepozycjonowaną ramką centrującą, a pod kartą.
			*/}
			<div
				aria-hidden='true'
				onClick={pulse}
				className='fixed inset-0 bg-black/60 supports-backdrop-filter:backdrop-blur-xs'
			/>

			{/* `min-h-full` daje ramce pełną wysokość okna, więc `items-center` ma co centrować. */}
			<div className='flex min-h-full items-center justify-center p-4 sm:p-6'>
				<Card
					ref={dialogRef}
					role='dialog'
					aria-modal='true'
					// Nazwa dostępna z `aria-label`, mimo widocznego nagłówka: nagłówek
					// mówi językiem marketingu, a czytnik ma ogłosić, czego okno dotyczy.
					aria-label={t('regionLabel')}
					// Opis okna, czyli powód, dla którego przesłania stronę. Bez tego
					// czytnik ogłasza nazwę okna i pierwszy przycisk, a zdanie
					// wyjaśniające trafia do użytkownika tylko wtedy, gdy sam po nie
					// przejdzie.
					aria-describedby={messageId}
					tabIndex={-1}
					onKeyDown={trapFocus}
					// Zdjęcie klasy dopiero po animacji — zostawiona blokuje kolejny przebieg.
					onAnimationEnd={() => dialogRef.current?.classList.remove(PULSE_CLASS)}
					className='relative w-full max-w-lg shadow-2xl outline-none'
				>
					{/* `Typography as='h2'`, nie `CardTitle` — ten renderuje `div`, więc tytuł
					    nie trafiłby do listy nagłówków czytnika ekranu. */}
					<CardHeader>
						<Typography
							as='h2'
							variant='h5'
						>
							{t('title')}
						</Typography>
					</CardHeader>

					<CardContent>
						<Typography
							id={messageId}
							variant='bodySm'
							tone='muted'
						>
							{t('message')}{' '}
							{/* Przycisk, nie odnośnik: otwiera warstwę w tym samym dokumencie. */}
							<Button
								variant='link'
								size='none'
								className='underline underline-offset-4'
								onClick={onOpenPrivacy}
							>
								{t('privacyLink')}
							</Button>
							.
						</Typography>
					</CardContent>

					{/*
						Kolumna zostawia zgodę NA DOLE — tam sięga kciuk na telefonie —
						a na szerokim ekranie ten sam porządek DOM-u daje ją na końcu
						ścieżki wzroku. Zgoda jest szersza od ustawień, ale ustawienia
						zostają pełnowymiarowym przyciskiem: to jedyna droga do odmowy.
					*/}
					<CardFooter className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
						<Button
							variant='outline'
							size='lg'
							className='w-full sm:flex-1'
							onClick={onOpenSettings}
						>
							{t('settings')}
						</Button>
						<Button
							size='lg'
							className='w-full sm:flex-3'
							onClick={onAcceptAll}
						>
							{t('accept')}
						</Button>
					</CardFooter>

					{/*
						Obszar jest w drzewie ZAWSZE i puste jest tylko jego wnętrze.
						`aria-live` dostawiony razem z gotowym tekstem bywa pomijany:
						czytnik ogłasza zmiany obszarów, które już obserwował.
					*/}
					<div
						role='status'
						aria-live='polite'
						className='sr-only'
					>
						{liveMessage}
					</div>
				</Card>
			</div>
		</div>
	)
}
