import { z } from 'zod'

/**
 * Prymitywy walidacji. Komunikaty są KLUCZAMI tłumaczeń (przestrzeń `validation`),
 * nie tekstem: schemat jest wspólny dla przeglądarki i serwera, więc nie zna
 * języka żądania. Tekst dobiera komponent przez `t(error.message)`.
 */

/** Maksymalna długość pól tekstowych — chroni przed zapychaniem skrzynki. */
export const LIMITS = {
	name: 100,
	subject: 150,
	message: 2000,
} as const

export const emailField = z
	.string({ error: 'required' })
	.trim()
	.min(1, { error: 'required' })
	.pipe(z.email({ error: 'email' }))

/** `trim()` przed długością: bez niego pole z samych spacji przechodzi walidację. */
export function shortTextField(max: number = LIMITS.name) {
	return z
		.string({ error: 'required' })
		.trim()
		.min(2, { error: 'tooShort' })
		.max(max, { error: 'tooLong' })
}

export function longTextField(max: number = LIMITS.message) {
	return z
		.string({ error: 'required' })
		.trim()
		.min(10, { error: 'messageTooShort' })
		.max(max, { error: 'tooLong' })
}

/** `z.literal(true)`, nie `z.boolean()`: odznaczone pole ma dać błąd, nie przejść z `false`. */
export const consentField = z.literal(true, { error: 'consent' })

/** Świadomie bez ścisłego wzorca — formularz nie jest miejscem na naukę „poprawnego" zapisu numeru. */
export const optionalPhoneField = z
	.string()
	.trim()
	.regex(/^[\d\s+()-]{6,20}$/, { error: 'phone' })
	.optional()
	.or(z.literal(''))

/** Pułapka na roboty: wypełnione = odrzucamy. Musi zostać opcjonalne, żeby człowiek nie dostał błędu. */
export const honeypotField = z.string().optional()

/**
 * Znacznik czasu wyświetlenia formularza — do wykrywania automatów po czasie.
 * Wartość jest liczbą milisekund, ale przez formularz przechodzi jako tekst.
 */
export const renderedAtField = z.coerce.number().optional()
