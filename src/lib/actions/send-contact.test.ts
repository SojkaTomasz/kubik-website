import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Akcja serwerowa formularza kontaktowego.
 *
 * Testy sprawdzają przede wszystkim ŚCIEŻKI ODMOWY — to one decydują, czy
 * skrzynka zostanie zalana i czy użytkownik dostanie zrozumiały komunikat.
 * Sama wysyłka jest tu najprostszym przypadkiem.
 *
 * Każdy przypadek używa własnego adresu IP, bo limiter żyje w module i jego
 * stan przechodzi między testami. To celowe: alternatywa (przeładowywanie
 * modułu) ukryłaby fakt, że limiter jest stanowy.
 */

const requestHeaders = vi.hoisted(() => ({ values: new Map<string, string>() }))
const send = vi.hoisted(() => vi.fn())
const envValues = vi.hoisted(() => ({
	values: {
		NODE_ENV: 'test',
		RESEND_API_KEY: 're_test',
		MAIL_FROM: 'no-reply@example.com',
		MAIL_FROM_NAME: 'Starter',
		MAIL_TO: 'kontakt@example.com',
		NEXT_PUBLIC_SITE_URL: 'https://example.com',
		NEXT_PUBLIC_CONTACT_EMAIL: 'kontakt@example.com',
		NEXT_PUBLIC_CONTACT_PHONE: '+48123456789',
		NEXT_PUBLIC_GTM_ID: '',
		NEXT_PUBLIC_ENABLE_DEV_PAGES: false,
		NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS: false,
	} as Record<string, unknown>,
}))

vi.mock('next/headers', () => ({
	headers: async () => ({ get: (key: string) => requestHeaders.values.get(key) ?? null }),
}))

vi.mock('resend', () => ({
	Resend: class {
		emails = { send: send }
	},
}))

vi.mock('@/env', () => ({ env: envValues.values }))

const { sendContactMessage } = await import('@/lib/actions/send-contact')

/** Zgłoszenie wypełnione poprawnie, wysłane w realistycznym czasie. */
function submission(overrides: Record<string, unknown> = {}) {
	return {
		name: 'Jan Kowalski',
		email: 'jan@example.com',
		phone: '',
		subject: 'Pytanie o ofertę',
		message: 'Dzień dobry, chciałbym poznać szczegóły współpracy.',
		consent: true,
		website: '',
		renderedAt: Date.now() - 30_000,
		...overrides,
	}
}

/** Ustawia adres IP nadawcy — każdy test używa własnego, żeby nie dzielić limitu. */
function withIp(ip: string) {
	requestHeaders.values.set('x-forwarded-for', ip)
}

beforeEach(() => {
	requestHeaders.values.clear()
	send.mockReset()
	send.mockResolvedValue({ data: { id: 'msg_1' }, error: null })
	envValues.values.RESEND_API_KEY = 're_test'
	envValues.values.MAIL_FROM = 'no-reply@example.com'
	envValues.values.MAIL_TO = 'kontakt@example.com'
	vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('wysyłka', () => {
	it('przy poprawnych danych zwraca powodzenie', async () => {
		withIp('10.0.0.1')

		await expect(sendContactMessage(submission())).resolves.toEqual({ status: 'ok' })
		expect(send).toHaveBeenCalledOnce()
	})

	it('ustawia nadawcę, odbiorcę i adres do odpowiedzi', async () => {
		withIp('10.0.0.2')

		await sendContactMessage(submission())

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				from: 'Starter <no-reply@example.com>',
				to: 'kontakt@example.com',
				replyTo: 'jan@example.com',
			})
		)
	})

	it('wysyła obie wersje treści', async () => {
		withIp('10.0.0.3')

		await sendContactMessage(submission())

		const args = send.mock.calls[0]?.[0] as { html: string; text: string }

		expect(args.html).toContain('<!doctype html>')
		expect(args.text).toContain('Jan Kowalski')
	})
})

describe('walidacja po stronie serwera', () => {
	it('odrzuca dane niespełniające schematu', async () => {
		withIp('10.0.1.1')

		// Serwer nie ufa przeglądarce: żądanie da się wysłać z pominięciem
		// formularza, więc walidacja klienta jest wyłącznie wygodą.
		const result = await sendContactMessage({ name: 'x' })

		expect(result).toMatchObject({ status: 'error', code: 'validation' })
		expect(send).not.toHaveBeenCalled()
	})

	it('zwraca błędy przypisane do pól', async () => {
		withIp('10.0.1.2')

		const result = await sendContactMessage(submission({ email: 'niepoprawny', name: 'a' }))

		expect(result).toMatchObject({
			status: 'error',
			code: 'validation',
			fieldErrors: { email: 'email', name: 'tooShort' },
		})
	})

	it('nie wysyła wiadomości bez zgody na przetwarzanie danych', async () => {
		withIp('10.0.1.3')

		const result = await sendContactMessage(submission({ consent: false }))

		expect(result).toMatchObject({ code: 'validation' })
		expect(send).not.toHaveBeenCalled()
	})
})

describe('zabezpieczenia przed automatami', () => {
	it('odrzuca zgłoszenie z wypełnionym polem-pułapką', async () => {
		withIp('10.0.2.1')

		const result = await sendContactMessage(submission({ website: 'https://spam.example' }))

		expect(result).toMatchObject({ status: 'error', code: 'rejected' })
		expect(send).not.toHaveBeenCalled()
	})

	it('odrzuca formularz wypełniony nierealnie szybko', async () => {
		withIp('10.0.2.2')

		const result = await sendContactMessage(submission({ renderedAt: Date.now() - 200 }))

		expect(result).toMatchObject({ status: 'error', code: 'rejected' })
		expect(send).not.toHaveBeenCalled()
	})

	it('nie zdradza automatowi, która pułapka zadziałała', async () => {
		withIp('10.0.2.3')
		const fromHoneypot = await sendContactMessage(submission({ website: 'spam' }))

		withIp('10.0.2.4')
		const fromTiming = await sendContactMessage(submission({ renderedAt: Date.now() }))

		// Ten sam kod dla obu przypadków: różne komunikaty pozwoliłyby dobrać
		// się do mechanizmu metodą prób i błędów.
		expect(fromHoneypot).toEqual(fromTiming)
	})

	it('przepuszcza zgłoszenie bez znacznika czasu', async () => {
		withIp('10.0.2.5')

		// Znacznik ustawia JavaScript po stronie klienta. Jego brak nie może
		// blokować wysyłki — inaczej odcinamy osoby z wyłączonym skryptem.
		const result = await sendContactMessage(submission({ renderedAt: undefined }))

		expect(result).toEqual({ status: 'ok' })
	})
})

describe('ograniczenie częstotliwości', () => {
	it('blokuje po przekroczeniu limitu z jednego adresu', async () => {
		withIp('10.0.3.1')

		await sendContactMessage(submission())
		await sendContactMessage(submission())
		await sendContactMessage(submission())
		const fourth = await sendContactMessage(submission())

		expect(fourth).toMatchObject({ status: 'error', code: 'rateLimit' })
		expect(fourth).toHaveProperty('retryAfterSeconds')
	})

	it('nie dotyka innych adresów', async () => {
		withIp('10.0.3.2')
		await sendContactMessage(submission())
		await sendContactMessage(submission())
		await sendContactMessage(submission())
		await sendContactMessage(submission())

		withIp('10.0.3.3')

		await expect(sendContactMessage(submission())).resolves.toEqual({ status: 'ok' })
	})

	it('bierze pierwszy adres z listy x-forwarded-for', async () => {
		// Nagłówek bywa listą: klient, potem serwery pośredniczące. Wzięcie
		// ostatniego limitowałoby ruch per serwer pośredniczący, czyli wspólnie
		// dla wszystkich użytkowników za tym samym proxy.
		requestHeaders.values.set('x-forwarded-for', '10.0.4.1, 172.16.0.1, 192.168.0.1')

		await sendContactMessage(submission())
		await sendContactMessage(submission())
		await sendContactMessage(submission())

		requestHeaders.values.set('x-forwarded-for', '10.0.4.1, 172.16.9.9')

		expect(await sendContactMessage(submission())).toMatchObject({ code: 'rateLimit' })
	})
})

describe('awarie po stronie serwera', () => {
	it('zgłasza brak konfiguracji poczty', async () => {
		withIp('10.0.5.1')
		envValues.values.RESEND_API_KEY = undefined

		const result = await sendContactMessage(submission())

		expect(result).toMatchObject({ status: 'error', code: 'notConfigured' })
		expect(send).not.toHaveBeenCalled()
	})

	it('wykrywa odrzucenie przez dostawcę poczty', async () => {
		withIp('10.0.5.2')
		// Resend NIE rzuca przy błędzie — zwraca { data: null, error }.
		// Sprawdzanie samego braku wyjątku pokazałoby użytkownikowi
		// potwierdzenie wysyłki, która nie nastąpiła.
		send.mockResolvedValue({ data: null, error: { message: 'Domain not verified' } })

		const result = await sendContactMessage(submission())

		expect(result).toMatchObject({ status: 'error', code: 'sendFailed' })
	})

	it('nie rzuca przy błędzie sieci', async () => {
		withIp('10.0.5.3')
		send.mockRejectedValue(new Error('ECONNRESET'))

		// Wyjątek z akcji serwerowej dociera do przeglądarki jako ogólny błąd
		// i pokazuje użytkownikowi ścianę zamiast informacji.
		await expect(sendContactMessage(submission())).resolves.toMatchObject({
			status: 'error',
			code: 'sendFailed',
		})
	})

	it('nie przekazuje szczegółów awarii do przeglądarki', async () => {
		withIp('10.0.5.4')
		send.mockRejectedValue(new Error('Invalid API key re_abc123'))

		const result = await sendContactMessage(submission())

		// Szczegóły zostają w logach serwera — mogą zdradzać konfigurację.
		expect(JSON.stringify(result)).not.toContain('re_abc123')
	})
})
