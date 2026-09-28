import { escapeHtml, escapeHtmlWithBreaks } from '@/lib/html'
import { siteConfig } from '@/site.config'
import type { ContactData } from '@/lib/validation/contact'

/**
 * Powiadomienie o zgłoszeniu z formularza. Bez biblioteki do maili — klienty
 * pocztowe obsługują ułamek CSS-a, więc i tak nie dałoby się pisać jak na stronie.
 *
 * Wersja tekstowa NIE jest ozdobnikiem: sam HTML jest gorzej oceniany przez
 * filtry antyspamowe.
 */

export interface ContactEmail {
	subject: string
	html: string
	text: string
	/** Adres do odpowiedzi — pozwala odpisać wprost z klienta pocztowego. */
	replyTo: string
}

/** Wiersz tabeli w wersji HTML. Wartości są escapowane przez wywołującego. */
function row(label: string, value: string): string {
	return `
		<tr>
			<td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;color:#666;font-size:13px;vertical-align:top;white-space:nowrap">${label}</td>
			<td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;font-size:14px">${value}</td>
		</tr>`
}

export function buildContactEmail(data: ContactData): ContactEmail {
	const sentAt = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })

	const fields: [string, string][] = [
		['Imię i nazwisko', data.name],
		['E-mail', data.email],
		...(data.phone ? ([['Telefon', data.phone]] as [string, string][]) : []),
		['Temat', data.subject],
	]

	const html = `<!doctype html>
<html lang="pl">
	<body style="margin:0;padding:24px;background:#f7f7f7;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111">
		<div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden">
			<div style="padding:16px 20px;border-bottom:1px solid #e5e5e5">
				<strong style="font-size:15px">Nowa wiadomość z formularza kontaktowego</strong>
				<div style="color:#666;font-size:12px;margin-top:4px">${escapeHtml(siteConfig.name)} · ${escapeHtml(sentAt)}</div>
			</div>
			<table style="width:100%;border-collapse:collapse">
				${fields.map(([label, value]) => row(escapeHtml(label), escapeHtml(value))).join('')}
			</table>
			<div style="padding:16px 20px">
				<div style="color:#666;font-size:13px;margin-bottom:8px">Treść wiadomości</div>
				<div style="font-size:14px;line-height:1.6">${escapeHtmlWithBreaks(data.message)}</div>
			</div>
			<div style="padding:12px 20px;border-top:1px solid #e5e5e5;color:#666;font-size:12px">
				Odpowiedz na tę wiadomość, żeby napisać bezpośrednio do nadawcy.
			</div>
		</div>
	</body>
</html>`

	const text = [
		'Nowa wiadomość z formularza kontaktowego',
		`${siteConfig.name} · ${sentAt}`,
		'',
		...fields.map(([label, value]) => `${label}: ${value}`),
		'',
		'Treść wiadomości:',
		data.message,
		'',
		'Odpowiedz na tę wiadomość, żeby napisać bezpośrednio do nadawcy.',
	].join('\n')

	return {
		// Temat zawiera nazwę strony, bo jedna skrzynka często obsługuje kilka
		// serwisów — bez tego nie wiadomo, skąd przyszło zgłoszenie.
		subject: `[${siteConfig.name}] ${data.subject}`,
		html,
		text,
		replyTo: data.email,
	}
}
