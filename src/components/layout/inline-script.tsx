'use client'

/**
 * Skrypt wykonywany synchronicznie przy parsowaniu HTML-a — dla wszystkiego, co
 * musi zadziać się PRZED pierwszym malowaniem. Wzorzec z dokumentacji Next.js
 * („How to prevent flash before hydration").
 *
 * Sztuczka z `type` obchodzi ostrzeżenie Reacta o skryptach w drzewie: na
 * serwerze `text/javascript` (wykonuje się), na kliencie `text/plain` (martwy
 * tekst). Ani zwykły `<script>`, ani `next/script` tego nie załatwiają.
 *
 * `'use client'` jest WARUNKIEM DZIAŁANIA: bez niej `typeof window` liczy się
 * tylko na serwerze i przy nawigacji klienckiej ostrzeżenie wraca.
 */
export function InlineScript({ html }: { html: string }) {
	return (
		<script
			type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
			suppressHydrationWarning
			// React nie renderuje tekstu wewnątrz <script>. `html` musi pochodzić
			// z kodu, nigdy z danych użytkownika.
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}
