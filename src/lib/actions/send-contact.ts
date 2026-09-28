'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'

import { buildContactEmail } from '@/emails/contact-notification'
import { env } from '@/env'
import { createRateLimiter } from '@/lib/rate-limit'
import { contactSchema } from '@/lib/validation/contact'

/**
 * Wysyłka formularza kontaktowego. Trzy zasady:
 *
 * 1. Akcja NIGDY nie rzuca — zwraca dyskryminowany wynik. Wyjątek dociera do
 *    przeglądarki jako ogólna ściana zamiast informacji, co poszło nie tak.
 * 2. Serwer nie ufa przeglądarce: walidacja jeszcze raz, tym samym schematem.
 * 3. Komunikaty to klucze tłumaczeń — akcja nie zna języka widoku.
 */

/** Kod błędu — zarazem klucz w przestrzeni `contact.errors` plików tłumaczeń. */
export type ContactErrorCode =
	'validation' | 'rateLimit' | 'notConfigured' | 'sendFailed' | 'rejected'

export type ContactResult =
	| { status: 'ok' }
	| {
			status: 'error'
			code: ContactErrorCode
			/** Błędy przypisane do pól — klucze z przestrzeni `validation`. */
			fieldErrors?: Partial<Record<string, string>>
			/** Ile sekund do ponowienia. Wyłącznie przy `rateLimit`. */
			retryAfterSeconds?: number
	  }

/** Poniżej tego progu formularz wypełnił automat. Zapas na autouzupełnianie i wklejenie. */
const MIN_FILL_TIME_MS = 3000

/** Najwyżej tyle zgłoszeń z jednego adresu IP w podanym oknie. */
const limiter = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 })

/** Po tylu milisekundach przestajemy czekać na odpowiedź dostawcy poczty. */
const SEND_TIMEOUT_MS = 10_000

/** Bez limitu zawieszone połączenie z dostawcą trzyma żądanie aż do limitu platformy. */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
	let timer: ReturnType<typeof setTimeout> | undefined

	try {
		return await Promise.race([
			promise,
			new Promise<null>(resolve => {
				timer = setTimeout(() => resolve(null), ms)
			}),
		])
	} finally {
		if (timer) clearTimeout(timer)
	}
}

/**
 * IP nadawcy do limitowania. `x-forwarded-for` bywa listą — pierwszy jest klient.
 * Bez nagłówka (lokalnie) limit obowiązuje globalnie.
 */
async function readClientIp(): Promise<string> {
	const headerList = await headers()
	const forwarded = headerList.get('x-forwarded-for')

	return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'nieznany'
}

export async function sendContactMessage(input: unknown): Promise<ContactResult> {
	const parsed = contactSchema.safeParse(input)

	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {}

		for (const issue of parsed.error.issues) {
			const field = issue.path[0]
			if (typeof field === 'string' && !fieldErrors[field]) fieldErrors[field] = issue.message
		}

		return { status: 'error', code: 'validation', fieldErrors }
	}

	const data = parsed.data

	// Odrzucenia „po cichu": automat dostaje ten sam komunikat co człowiek,
	// żeby nie dowiedział się, która pułapka zadziałała.
	if (data.website) {
		return { status: 'error', code: 'rejected' }
	}

	if (data.renderedAt && Date.now() - data.renderedAt < MIN_FILL_TIME_MS) {
		return { status: 'error', code: 'rejected' }
	}

	const limit = limiter(await readClientIp())

	if (!limit.allowed) {
		return {
			status: 'error',
			code: 'rateLimit',
			retryAfterSeconds: limit.retryAfterSeconds,
		}
	}

	if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) {
		// Błąd wdrożenia, nie użytkownika — szczegóły do logów, nie na ekran.
		console.error(
			'Formularz kontaktowy: brak RESEND_API_KEY, MAIL_FROM lub MAIL_TO. ' +
				'Uzupełnij .env.local — wzór w .env.example.'
		)
		return { status: 'error', code: 'notConfigured' }
	}

	const emailMessage = buildContactEmail(data)
	const resend = new Resend(env.RESEND_API_KEY)

	try {
		const response = await withTimeout(
			resend.emails.send({
				from: env.MAIL_FROM_NAME ? `${env.MAIL_FROM_NAME} <${env.MAIL_FROM}>` : env.MAIL_FROM,
				to: env.MAIL_TO,
				replyTo: emailMessage.replyTo,
				subject: emailMessage.subject,
				html: emailMessage.html,
				text: emailMessage.text,
			}),
			SEND_TIMEOUT_MS
		)

		if (response === null) {
			console.error('Formularz kontaktowy: przekroczono czas oczekiwania na Resend.')
			return { status: 'error', code: 'sendFailed' }
		}

		// Resend NIE rzuca przy błędzie — zwraca `{ data: null, error }`. Bez tego
		// niewysłana wiadomość dostałaby potwierdzenie.
		if (response.error) {
			console.error('Formularz kontaktowy: Resend odrzucił wysyłkę.', response.error)
			return { status: 'error', code: 'sendFailed' }
		}

		return { status: 'ok' }
	} catch (error) {
		// Szczegóły zostają w logach — użytkownikowi nic nie mówią, a mogą
		// zdradzać konfigurację.
		console.error('Formularz kontaktowy: nieoczekiwany błąd wysyłki.', error)
		return { status: 'error', code: 'sendFailed' }
	}
}
