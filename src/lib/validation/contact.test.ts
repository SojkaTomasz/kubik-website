import { describe, expect, it } from 'vitest'

import { contactSchema } from '@/lib/validation/contact'
import { LIMITS } from '@/lib/validation/fields'

/**
 * Schemat formularza kontaktowego.
 *
 * Ten sam schemat działa w przeglądarce i w akcji serwerowej, więc jego błąd
 * przechodzi przez obie warstwy naraz — nie ma tu drugiej linii obrony.
 *
 * Komunikaty są KLUCZAMI tłumaczeń, nie zdaniami. Asercje sprawdzają właśnie
 * klucze: rozjazd między schematem a plikami messages/*.json objawiłby się
 * inaczej — jako surowy klucz wyświetlony użytkownikowi zamiast zdania.
 */

/** Poprawne zgłoszenie — punkt wyjścia dla testów pojedynczych pól. */
const VALID = {
	name: 'Jan Kowalski',
	email: 'jan@example.com',
	phone: '',
	subject: 'Pytanie o ofertę',
	message: 'Dzień dobry, chciałbym poznać szczegóły współpracy.',
	consent: true,
	website: '',
} as const

/** Zwraca klucz błędu przypisany do wskazanego pola. */
function fieldError(input: Record<string, unknown>, field: string): string | undefined {
	const result = contactSchema.safeParse(input)
	if (result.success) return undefined

	return result.error.issues.find(issue => issue.path[0] === field)?.message
}

describe('poprawne zgłoszenie', () => {
	it('przechodzi walidację', () => {
		expect(contactSchema.safeParse(VALID).success).toBe(true)
	})

	it('przycina białe znaki wokół wartości', () => {
		const result = contactSchema.safeParse({ ...VALID, name: '  Jan Kowalski  ' })

		expect(result.success && result.data.name).toBe('Jan Kowalski')
	})
})

describe('imię i nazwisko', () => {
	it('jest wymagane', () => {
		expect(fieldError({ ...VALID, name: '' }, 'name')).toBe('tooShort')
	})

	it('odrzuca wartość złożoną z samych spacji', () => {
		// Bez przycięcia przed sprawdzeniem długości takie field przeszłoby
		// walidację i trafiło do skrzynki jako pusty wiersz.
		expect(fieldError({ ...VALID, name: '     ' }, 'name')).toBe('tooShort')
	})

	it('ma górny limit długości', () => {
		expect(fieldError({ ...VALID, name: 'a'.repeat(LIMITS.name + 1) }, 'name')).toBe('tooLong')
	})
})

describe('adres e-mail', () => {
	it('jest wymagany', () => {
		expect(fieldError({ ...VALID, email: '' }, 'email')).toBe('required')
	})

	it.each(['jan', 'jan@', '@example.com', 'jan example.com', 'jan@example'])(
		'odrzuca „%s"',
		wartosc => {
			expect(fieldError({ ...VALID, email: wartosc }, 'email')).toBe('email')
		}
	)

	it.each(['jan@example.com', 'jan.kowalski+tag@sub.example.co.uk'])('przyjmuje „%s"', wartosc => {
		expect(fieldError({ ...VALID, email: wartosc }, 'email')).toBeUndefined()
	})
})

describe('telefon', () => {
	it('jest opcjonalny', () => {
		expect(fieldError({ ...VALID, phone: '' }, 'phone')).toBeUndefined()
	})

	it.each(['+48 123 456 789', '123456789', '(22) 123-45-67'])(
		'przyjmuje zapis swobodny „%s"',
		wartosc => {
			// Numery zapisuje się na kilkanaście sposobów. Formularz kontaktowy
			// nie jest miejscem na naukę „poprawnego" formatu.
			expect(fieldError({ ...VALID, phone: wartosc }, 'phone')).toBeUndefined()
		}
	)

	it('odrzuca wartość, która nie wygląda na numer', () => {
		expect(fieldError({ ...VALID, phone: 'zadzwoń do mnie' }, 'phone')).toBe('phone')
	})
})

describe('wiadomość', () => {
	it('wymaga treści dłuższej niż kilka znaków', () => {
		expect(fieldError({ ...VALID, message: 'cześć' }, 'message')).toBe('messageTooShort')
	})

	it('ma górny limit długości', () => {
		expect(fieldError({ ...VALID, message: 'a'.repeat(LIMITS.message + 1) }, 'message')).toBe(
			'tooLong'
		)
	})
})

describe('zgoda na przetwarzanie danych', () => {
	it('jest wymagana', () => {
		// `z.literal(true)`, nie `z.boolean()`: field odznaczone musi dać błąd,
		// a nie przejść dalej z wartością false.
		expect(fieldError({ ...VALID, consent: false }, 'consent')).toBe('consent')
	})

	it('brak pola też jest błędem', () => {
		const { consent: _omitted, ...withoutConsent } = VALID

		expect(fieldError(withoutConsent, 'consent')).toBe('consent')
	})
})

describe('pola techniczne', () => {
	it('field-pułapka jest opcjonalne', () => {
		// Musi być opcjonalne, inaczej przeglądarka użytkownika dostałaby błąd
		// walidacji za niewypełnienie pola, którego nie widzi.
		const { website: _omitted, ...withoutHoneypot } = VALID

		expect(contactSchema.safeParse(withoutHoneypot).success).toBe(true)
	})

	it('wypełniona pułapka nie blokuje walidacji', () => {
		// Odsiewaniem zajmuje się akcja serwerowa, nie schemat — dzięki temu
		// automat nie dowiaduje się z odpowiedzi, które field go zdradziło.
		expect(contactSchema.safeParse({ ...VALID, website: 'spam' }).success).toBe(true)
	})

	it('znacznik czasu przychodzi jako tekst i jest zamieniany na liczbę', () => {
		const result = contactSchema.safeParse({ ...VALID, renderedAt: '1700000000000' })

		expect(result.success && result.data.renderedAt).toBe(1_700_000_000_000)
	})
})
