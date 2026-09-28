/**
 * Limiter częstotliwości w pamięci procesu.
 *
 * ⚠️ ŚWIADOME OGRANICZENIE: na Vercelu każda instancja ma własny licznik (realny
 * limit = limit × liczba instancji), a uśpienie instancji go zeruje. Dla
 * formularza kontaktowego wystarcza. Przy większym ruchu podmień na licznik
 * współdzielony (Upstash Redis, Vercel KV) zachowując ten interfejs.
 */

export interface RateLimitResult {
	allowed: boolean
	/** Ile sekund zostało do zwolnienia limitu. Zero, gdy limit nie obowiązuje. */
	retryAfterSeconds: number
}

export interface RateLimiterOptions {
	/** Ile żądań mieści się w oknie. */
	limit: number
	/** Długość okna w milisekundach. */
	windowMs: number
}

/** Okno PRZESUWNE: przy stałym da się wysłać podwójny limit na styku dwóch okien. */
export function createRateLimiter({ limit, windowMs }: RateLimiterOptions) {
	const history = new Map<string, number[]>()

	return function check(key: string, now: number = Date.now()): RateLimitResult {
		const windowStart = now - windowMs
		const entries = (history.get(key) ?? []).filter(time => time > windowStart)

		if (entries.length >= limit) {
			const oldest = entries[0] ?? now
			history.set(key, entries)

			return {
				allowed: false,
				retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
			}
		}

		entries.push(now)
		history.set(key, entries)

		// Sprzątanie przy okazji zapisu, rzadko — inaczej mapa rośnie z liczbą
		// unikalnych adresów IP, ale przebieg po całej mapie przy każdym żądaniu
		// byłby zbyt drogi.
		if (history.size > 1000) {
			for (const [entryKey, timestamps] of history) {
				if (timestamps.every(time => time <= windowStart)) history.delete(entryKey)
			}
		}

		return { allowed: true, retryAfterSeconds: 0 }
	}
}
