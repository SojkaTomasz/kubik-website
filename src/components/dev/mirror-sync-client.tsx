'use client'

import isElement from 'lodash/isElement'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import {
	ACTIONABLE_SELECTOR,
	DEFAULT_MIRROR_PORT,
	findActionTarget,
	getClickSignature,
	type MirrorMessage,
	scrollRatio,
} from '@/lib/mirror-sync'

/*
 * Po odebraniu zdarzenia nie odsyłamy własnych — inaczej urządzenia odbijałyby
 * je w kółko. Dwa osobne okna, bo mają inną długość:
 * - przewinięcie: płynne przewijanie trwa kilkaset milisekund, a przez cały ten
 *   czas przeglądarka zgłasza `scroll`. Przy wspólnym 200 ms telefon odsyłał
 *   przewinięcie, komputer wyciszał się na kolejne 200 ms i — przy wspólnym
 *   oknie — gubił także kliknięcie w menu (sprawdzone dwoma urządzeniami),
 * - kliknięcie: tylko echo samego kliknięcia, krótko.
 *
 * Okno przewinięcia WYDŁUŻA się, dopóki odebrane przewinięcie jeszcze trwa:
 * każde zdarzenie `scroll` w oknie przesuwa jego koniec o `SCROLL_SETTLE_MS`.
 * Długie płynne przewinięcie trwa dłużej niż 800 ms i przy sztywnym oknie
 * ostatnie klatki wracały do nadawcy (zmierzone w Chromium: 7 wiadomości echa).
 */
const SCROLL_SUPPRESS_MS = 800
const SCROLL_SETTLE_MS = 150
const CLICK_SUPPRESS_MS = 200

export interface MirrorSyncClientProps {
	/** Port serwera przekaźnika z `scripts/dev-mobile.mjs`. */
	port?: number
}

/**
 * Narzędzie deweloperskie (`pnpm dev:mobile`): powtarza przewinięcie
 * i kliknięcia na każdej karcie podłączonej do tego samego przekaźnika —
 * przewijasz i klikasz na komputerze, telefon w tej samej sieci robi to samo.
 *
 * Renderowane WYŁĄCZNIE, gdy `dev:mobile` ustawi `NEXT_PUBLIC_DEV_MIRROR_PORT`.
 * Przy zwykłym `pnpm dev` i w testach e2e nieudane połączenie WebSocket
 * zostawiałoby błąd w konsoli, a kontrola konsoli traktuje go jak usterkę.
 *
 * Przenosi kliknięcia semantycznie, nie po współrzędnych — patrz
 * `lib/mirror-sync.ts`. Nie ma tu proxy przed `next dev`: proxy psuje
 * WebSocket HMR Turbopacka i React w ogóle się nie hydratuje (AGENTS.md).
 */
export function MirrorSyncClient({ port = DEFAULT_MIRROR_PORT }: MirrorSyncClientProps) {
	const suppressScrollUntil = useRef(0)
	const suppressClickUntil = useRef(0)
	const router = useRouter()

	useEffect(() => {
		const socket = new WebSocket(`ws://${window.location.hostname}:${port}`)

		/*
		 * StrictMode w trybie deweloperskim montuje efekt dwa razy, więc pierwsze
		 * gniazdo jest zamykane jeszcze w trakcie łączenia — i zgłasza `error`.
		 * Bez tej flagi każde wejście na stronę dawało fałszywe ostrzeżenie.
		 */
		let closedByUs = false

		socket.onopen = () => console.warn('[mirror] połączono z przekaźnikiem')
		socket.onerror = () => {
			if (closedByUs) return
			console.warn('[mirror] brak połączenia z przekaźnikiem — uruchom `pnpm dev:mobile`')
		}

		socket.onmessage = event => {
			const message = JSON.parse(String(event.data)) as MirrorMessage

			if (message.type === 'scroll') {
				suppressScrollUntil.current = Date.now() + SCROLL_SUPPRESS_MS
				const max = document.documentElement.scrollHeight - window.innerHeight
				window.scrollTo({ top: message.ratio * max, behavior: 'smooth' })
				return
			}

			suppressClickUntil.current = Date.now() + CLICK_SUPPRESS_MS
			const { signature } = message
			if (signature.kind === 'nav') {
				router.push(signature.href)
				return
			}

			const match = findActionTarget(
				signature,
				Array.from(document.querySelectorAll<HTMLElement>(ACTIONABLE_SELECTOR))
			)
			if (match) {
				showPingAt(match)
				match.click()
			}
		}

		function send(message: MirrorMessage) {
			if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message))
		}

		const onClick = (event: MouseEvent) => {
			if (Date.now() < suppressClickUntil.current) return
			if (!isElement(event.target)) return
			const signature = getClickSignature(event.target as Element)
			if (signature) send({ type: 'click', signature })
		}

		/*
		 * Jedno wysłanie na klatkę animacji przez flagę — NIE `cancelAnimationFrame`
		 * z ponownym planowaniem przy każdym zdarzeniu. Tamto działa jak debounce:
		 * przy ciągłym szybkim przewijaniu nic nie wychodzi, a na końcu jest skok.
		 */
		let ticking = false
		const onScroll = () => {
			const now = Date.now()
			if (now < suppressScrollUntil.current) {
				suppressScrollUntil.current = Math.max(
					suppressScrollUntil.current,
					now + SCROLL_SETTLE_MS
				)
				return
			}
			if (ticking) return
			ticking = true
			requestAnimationFrame(() => {
				ticking = false
				send({
					type: 'scroll',
					ratio: scrollRatio(
						window.scrollY,
						document.documentElement.scrollHeight,
						window.innerHeight
					),
				})
			})
		}

		window.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('click', onClick)

		return () => {
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('click', onClick)
			closedByUs = true
			socket.close()
		}
	}, [port, router])

	return null
}

/** Krótki błysk w miejscu powtórzonego kliknięcia — widać, co zrobiło drugie urządzenie. */
function showPingAt(element: HTMLElement) {
	const rect = element.getBoundingClientRect()
	const ping = document.createElement('div')
	ping.style.cssText = `position:fixed;left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;width:24px;height:24px;margin:-12px;border-radius:9999px;background:oklch(0.7 0.2 25 / 0.5);pointer-events:none;z-index:99999;transition:transform 400ms ease-out,opacity 400ms ease-out;`
	document.body.appendChild(ping)
	requestAnimationFrame(() => {
		ping.style.transform = 'scale(2.5)'
		ping.style.opacity = '0'
	})
	setTimeout(() => ping.remove(), 450)
}
