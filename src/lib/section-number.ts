import padStart from 'lodash/padStart'

/**
 * Numer sekcji w etykiecie „01 · Kim jesteśmy" — dwie cyfry, jak w projekcie.
 * Numeracja idzie w kolejności sekcji na stronie, więc liczy ją strona.
 */
export function sectionNumber(position: number): string {
	return padStart(String(position), 2, '0')
}
