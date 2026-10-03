/**
 * Postęp czytania jako rura u góry ekranu — gradient z ciepłego w zimny, rosnący
 * z przewijaniem.
 *
 * Czysty CSS (`animation-timeline: scroll()`, reguły w `app/theme/motion.css`): zero
 * JavaScriptu i zero pracy na wątku głównym, bo przewijanie napędza animację
 * w kompozytorze. Przeglądarka bez scroll-driven animations (dziś Firefox) pasek po
 * prostu chowa — to ozdobnik, nie informacja.
 */
export function ScrollProgress() {
	return (
		<div
			aria-hidden
			data-slot='scroll-progress'
			className='bg-pipe'
		/>
	)
}
