/**
 * Escapowanie dla wiadomości e-mail budowanych z danych użytkownika. Klient
 * pocztowy renderuje HTML, a tutaj nie ma Reacta, który escapowałby za nas.
 */

const ENTITIES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
}

/** Zamienia znaki o znaczeniu składniowym w HTML-u na encje. */
export function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, char => ENTITIES[char] ?? char)
}

/** KOLEJNOŚĆ: najpierw escapowanie, potem `<br>` — odwrotnie znacznik stałby się tekstem. */
export function escapeHtmlWithBreaks(value: string): string {
	return escapeHtml(value).replace(/\r?\n/g, '<br>')
}
