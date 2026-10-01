import { escapeHtml } from '@/lib/html'
import type { QuoteData } from '@/lib/validation/quote'
import { siteConfig } from '@/site.config'

/**
 * Powiadomienie o zapytaniu o wycenę — trafia do właściciela, który oddzwania.
 * Bez biblioteki do maili: klienty pocztowe obsługują ułamek CSS-a.
 *
 * Numer jest w temacie i jako odnośnik `tel:` — wiadomość czyta się zwykle na
 * telefonie, w przerwie na budowie, i ma dać się oddzwonić jednym dotknięciem.
 * Wersja tekstowa nie jest ozdobnikiem: sam HTML gorzej przechodzi filtry.
 */

export interface QuoteEmail {
	subject: string
	html: string
	text: string
}

function row(label: string, value: string): string {
	return `
		<tr>
			<td style="padding:10px 14px;border-bottom:1px solid #e5e5e5;color:#666;font-size:13px;white-space:nowrap">${label}</td>
			<td style="padding:10px 14px;border-bottom:1px solid #e5e5e5;font-size:15px">${value}</td>
		</tr>`
}

export function buildQuoteEmail(data: QuoteData): QuoteEmail {
	const sentAt = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })
	const area = `${String(data.area).replace('.', ',')} m²`
	const telHref = `tel:${data.phone.replace(/\s/g, '')}`

	const fields: [string, string][] = [
		['Metraż', area],
		['Telefon', data.phone],
		...(data.city ? ([['Miejscowość', data.city]] as [string, string][]) : []),
		...(data.page ? ([['Strona', data.page]] as [string, string][]) : []),
	]

	const html = `<!doctype html>
<html lang="pl">
	<body style="margin:0;padding:24px;background:#f7f7f7;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111">
		<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;overflow:hidden">
			<div style="height:4px;background:linear-gradient(90deg,#e5202e,#2f6bea)"></div>
			<div style="padding:16px 20px;border-bottom:1px solid #e5e5e5">
				<strong style="font-size:16px">Nowe zapytanie o wycenę</strong>
				<div style="color:#666;font-size:12px;margin-top:4px">${escapeHtml(siteConfig.name)} · ${escapeHtml(sentAt)}</div>
			</div>
			<table style="width:100%;border-collapse:collapse">
				${fields.map(([label, value]) => row(escapeHtml(label), escapeHtml(value))).join('')}
			</table>
			<div style="padding:20px">
				<a href="${escapeHtml(telHref)}" style="display:inline-block;padding:14px 22px;background:#e5202e;color:#fff;font-weight:700;text-decoration:none">Zadzwoń: ${escapeHtml(data.phone)}</a>
			</div>
		</div>
	</body>
</html>`

	const text = [
		'Nowe zapytanie o wycenę',
		`${siteConfig.name} · ${sentAt}`,
		'',
		...fields.map(([label, value]) => `${label}: ${value}`),
	].join('\n')

	return {
		// Metraż i miasto w temacie — da się ocenić zapytanie bez otwierania maila.
		subject: `[${siteConfig.name}] Wycena: ${area}${data.city ? `, ${data.city}` : ''} · ${data.phone}`,
		html,
		text,
	}
}
