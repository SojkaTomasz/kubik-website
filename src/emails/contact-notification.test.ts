import { describe, expect, it } from 'vitest'

import { buildContactEmail } from '@/emails/contact-notification'
import { escapeHtml, escapeHtmlWithBreaks } from '@/lib/html'
import { siteConfig } from '@/site.config'
import type { ContactData } from '@/lib/validation/contact'

/**
 * Szablon powiadomienia o nowej wiadomości.
 *
 * Najważniejsza część testów dotyczy escapowania. Klient pocztowy renderuje
 * HTML, więc treść z formularza jest tam dokładnie tak samo niebezpieczna jak
 * na stronie — z tą różnicą, że nie ma tu Reacta, który zrobiłby to za nas.
 */

const SUBMISSION: ContactData = {
	name: 'Jan Kowalski',
	email: 'jan@example.com',
	phone: '',
	subject: 'Pytanie o ofertę',
	message: 'Pierwszy wiersz.\nDrugi wiersz.',
	consent: true,
	website: '',
	renderedAt: undefined,
}

describe('escapowanie', () => {
	it('zamienia znaki składniowe HTML-a na encje', () => {
		expect(escapeHtml('<b>a & b</b>')).toBe('&lt;b&gt;a &amp; b&lt;/b&gt;')
	})

	it('escapuje cudzysłowy — używane w atrybutach', () => {
		expect(escapeHtml(`"x" 'y'`)).toBe('&quot;x&quot; &#39;y&#39;')
	})

	it('zamienia nowe linie na <br> PO escapowaniu, nie przed', () => {
		// Odwrotna kolejność zamieniłaby wstawiony znacznik na tekst
		// i w mailu widoczne byłoby dosłowne „&lt;br&gt;".
		expect(escapeHtmlWithBreaks('a\nb')).toBe('a<br>b')
		expect(escapeHtmlWithBreaks('<i>\n')).toBe('&lt;i&gt;<br>')
	})
})

describe('treść wiadomości', () => {
	it('temat zawiera nazwę strony i temat z formularza', () => {
		// Jedna skrzynka często obsługuje kilka serwisów — bez nazwy nie wiadomo,
		// skąd przyszło zgłoszenie.
		const mail = buildContactEmail(SUBMISSION)

		expect(mail.subject).toContain(siteConfig.name)
		expect(mail.subject).toContain('Pytanie o ofertę')
	})

	it('adres do odpowiedzi wskazuje nadawcę', () => {
		// Dzięki temu odpowiedź z klienta pocztowego trafia wprost do nadawcy,
		// bez kopiowania adresu z treści.
		expect(buildContactEmail(SUBMISSION).replyTo).toBe('jan@example.com')
	})

	it('zawiera wersję tekstową obok HTML-a', () => {
		// Wiadomość wyłącznie w HTML-u jest gorzej oceniana przez filtry
		// antyspamowe, a część klientów pocztowych pokazuje tylko tekst.
		const mail = buildContactEmail(SUBMISSION)

		expect(mail.text).toContain('Jan Kowalski')
		expect(mail.text).toContain('Pierwszy wiersz.')
		expect(mail.html).toContain('<!doctype html>')
	})

	it('pomija telefon, gdy nie został podany', () => {
		const mail = buildContactEmail(SUBMISSION)

		expect(mail.text).not.toContain('Telefon:')
	})

	it('dołącza telefon, gdy został podany', () => {
		const mail = buildContactEmail({ ...SUBMISSION, phone: '+48 123 456 789' })

		expect(mail.text).toContain('+48 123 456 789')
		expect(mail.html).toContain('+48 123 456 789')
	})

	it('zachowuje podział na wiersze w treści', () => {
		const mail = buildContactEmail(SUBMISSION)

		expect(mail.html).toContain('Pierwszy wiersz.<br>Drugi wiersz.')
	})
})

describe('odporność na wstrzyknięcie kodu', () => {
	const MALICIOUS: ContactData = {
		...SUBMISSION,
		name: '<script>alert(1)</script>',
		subject: '</td><img src=x onerror=alert(1)>',
		message: '<b>pogrubione</b> & spójnik',
	}

	it('nie przepuszcza znacznika script do HTML-a', () => {
		const mail = buildContactEmail(MALICIOUS)

		expect(mail.html).not.toContain('<script>')
		expect(mail.html).toContain('&lt;script&gt;')
	})

	it('nie pozwala wyjść z komórki tabeli', () => {
		// Bez escapowania treść zamknęłaby komórkę i wstrzyknęła własny znacznik
		// do struktury wiadomości.
		const mail = buildContactEmail(MALICIOUS)

		expect(mail.html).not.toContain('<img src=x')
	})

	it('escapuje treść wiadomości, zachowując czytelność', () => {
		const mail = buildContactEmail(MALICIOUS)

		expect(mail.html).toContain('&lt;b&gt;pogrubione&lt;/b&gt; &amp; spójnik')
	})

	it('wersja tekstowa nie wymaga escapowania i zostaje dosłowna', () => {
		// Wersja tekstowa nie jest renderowana jako HTML, więc encje byłyby tam
		// szumem — użytkownik zobaczyłby „&lt;b&gt;" zamiast tego, co napisał.
		const mail = buildContactEmail(MALICIOUS)

		expect(mail.text).toContain('<b>pogrubione</b> & spójnik')
	})
})
