'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'

import { buildQuoteEmail } from '@/emails/quote-notification'
import { env } from '@/env'
import { createRateLimiter } from '@/lib/rate-limit'
import { quoteSchema } from '@/lib/validation/quote'

/**
 * Wysyłka zapytania o wycenę. Te same trzy zasady co w formularzu kontaktowym:
 * akcja NIGDY nie rzuca, serwer waliduje jeszcze raz tym samym schematem,
 * komunikaty to klucze tłumaczeń (przestrzeń `quote.errors`).
 *
 * ⚠️ SMS do właściciela (docs/zakres.md, „Formularz") jeszcze nie działa —
 * czeka na operatora SMS i zarejestrowane pole nadawcy. Dziś idzie sam e-mail.
 */

export type QuoteErrorCode =
	'validation' | 'rateLimit' | 'notConfigured' | 'sendFailed' | 'rejected'

export type QuoteResult =
	| { status: 'ok' }
	| {
			status: 'error'
			code: QuoteErrorCode
			fieldErrors?: Partial<Record<string, string>>
			retryAfterSeconds?: number
	  }

/** Formularz ma dwa–trzy pola, więc człowiek wypełnia go szybciej niż kontaktowy. */
const MIN_FILL_TIME_MS = 2000

/** Najwyżej tyle zapytań z jednego adresu IP w podanym oknie. */
const limiter = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 })

const SEND_TIMEOUT_MS = 10_000

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

async function readClientIp(): Promise<string> {
	const headerList = await headers()
	const forwarded = headerList.get('x-forwarded-for')

	return forwarded?.split(',')[0]?.trim() || headerList.get('x-real-ip') || 'nieznany'
}

export async function sendQuoteRequest(input: unknown): Promise<QuoteResult> {
	const parsed = quoteSchema.safeParse(input)

	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {}

		for (const issue of parsed.error.issues) {
			const field = issue.path[0]
			if (typeof field === 'string' && !fieldErrors[field]) fieldErrors[field] = issue.message
		}

		return { status: 'error', code: 'validation', fieldErrors }
	}

	const data = parsed.data

	// Odrzucenia „po cichu": automat dostaje ten sam komunikat co człowiek.
	if (data.website) return { status: 'error', code: 'rejected' }

	if (data.renderedAt && Date.now() - data.renderedAt < MIN_FILL_TIME_MS) {
		return { status: 'error', code: 'rejected' }
	}

	const limit = limiter(await readClientIp())

	if (!limit.allowed) {
		return { status: 'error', code: 'rateLimit', retryAfterSeconds: limit.retryAfterSeconds }
	}

	if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) {
		console.error(
			'Formularz wyceny: brak RESEND_API_KEY, MAIL_FROM lub MAIL_TO. ' +
				'Uzupełnij .env.local — wzór w .env.example.'
		)
		return { status: 'error', code: 'notConfigured' }
	}

	const emailMessage = buildQuoteEmail(data)
	const resend = new Resend(env.RESEND_API_KEY)

	try {
		const response = await withTimeout(
			resend.emails.send({
				from: env.MAIL_FROM_NAME ? `${env.MAIL_FROM_NAME} <${env.MAIL_FROM}>` : env.MAIL_FROM,
				to: env.MAIL_TO,
				subject: emailMessage.subject,
				html: emailMessage.html,
				text: emailMessage.text,
			}),
			SEND_TIMEOUT_MS
		)

		if (response === null) {
			console.error('Formularz wyceny: przekroczono czas oczekiwania na Resend.')
			return { status: 'error', code: 'sendFailed' }
		}

		// Resend NIE rzuca przy błędzie — zwraca `{ data: null, error }`.
		if (response.error) {
			console.error('Formularz wyceny: Resend odrzucił wysyłkę.', response.error)
			return { status: 'error', code: 'sendFailed' }
		}

		return { status: 'ok' }
	} catch (error) {
		console.error('Formularz wyceny: nieoczekiwany błąd wysyłki.', error)
		return { status: 'error', code: 'sendFailed' }
	}
}
