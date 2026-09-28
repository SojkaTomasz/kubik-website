import { describe, expect, it } from 'vitest'

import { createRateLimiter } from '@/lib/rate-limit'

/**
 * Limiter częstotliwości.
 *
 * Testy podają czas jawnie, zamiast przesuwać zegar systemowy. Jest to
 * czytelniejsze i odporne na kolejność wykonania — każdy przypadek opisuje
 * pełną oś czasu, którą sprawdza.
 */

const SECOND = 1000
const MINUTE = 60 * SECOND

describe('okno przesuwne', () => {
	it('przepuszcza żądania do wyczerpania limitu', () => {
		const limiter = createRateLimiter({ limit: 3, windowMs: MINUTE })

		expect(limiter('ip', 0).allowed).toBe(true)
		expect(limiter('ip', 100).allowed).toBe(true)
		expect(limiter('ip', 200).allowed).toBe(true)
	})

	it('blokuje żądanie ponad limit', () => {
		const limiter = createRateLimiter({ limit: 2, windowMs: MINUTE })

		limiter('ip', 0)
		limiter('ip', 100)

		expect(limiter('ip', 200).allowed).toBe(false)
	})

	it('zwalnia limit dopiero po wyjściu najstarszego wpisu poza okno', () => {
		const limiter = createRateLimiter({ limit: 1, windowMs: MINUTE })

		limiter('ip', 0)

		expect(limiter('ip', 30 * SECOND).allowed).toBe(false)
		expect(limiter('ip', MINUTE + 1).allowed).toBe(true)
	})

	it('nie pozwala na podwójną porcję na styku okien', () => {
		/*
		 * To jest powód, dla którego okno jest przesuwne, a nie stałe.
		 * Przy oknie stałym można wysłać cały limit tuż przed jego końcem
		 * i drugi tyle zaraz po — czyli dwukrotność limitu w krótkiej chwili.
		 */
		const limiter = createRateLimiter({ limit: 2, windowMs: MINUTE })

		limiter('ip', 59 * SECOND)
		limiter('ip', 59.5 * SECOND)

		expect(limiter('ip', 60 * SECOND).allowed).toBe(false)
		expect(limiter('ip', 61 * SECOND).allowed).toBe(false)
	})
})

describe('czas do ponowienia', () => {
	it('jest zerowy, gdy limit nie obowiązuje', () => {
		const limiter = createRateLimiter({ limit: 2, windowMs: MINUTE })

		expect(limiter('ip', 0).retryAfterSeconds).toBe(0)
	})

	it('mówi, ile zostało do zwolnienia najstarszego wpisu', () => {
		const limiter = createRateLimiter({ limit: 1, windowMs: MINUTE })

		limiter('ip', 0)

		expect(limiter('ip', 20 * SECOND).retryAfterSeconds).toBe(40)
	})

	it('nigdy nie zwraca zera przy blokadzie', () => {
		// Zero znaczyłoby „spróbuj teraz", a próba i tak zostałaby odrzucona.
		const limiter = createRateLimiter({ limit: 1, windowMs: MINUTE })

		limiter('ip', 0)

		expect(limiter('ip', MINUTE - 1).retryAfterSeconds).toBeGreaterThanOrEqual(1)
	})
})

describe('rozdzielność kluczy', () => {
	it('każdy adres ma własną pulę', () => {
		const limiter = createRateLimiter({ limit: 1, windowMs: MINUTE })

		limiter('pierwszy', 0)

		expect(limiter('drugi', 0).allowed).toBe(true)
		expect(limiter('pierwszy', 0).allowed).toBe(false)
	})
})
