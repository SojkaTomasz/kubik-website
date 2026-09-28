/**
 * Warstwa animacji. Bez `'use client'` — skrypt musi być dostępny dla komponentu
 * serwerowego renderującego `<html>`.
 */

/**
 * Klasa w HTML-u OD RAZU, ZDEJMOWANA przez skrypt startowy. Odwrotnie niż
 * podpowiada intuicja: awaria skryptu ma zostawić treść widoczną, nie ukrytą.
 * Reguła: `app/theme/motion.css`.
 */
export const NO_JS_CLASS = 'no-js'

/** Synchronicznie w `<head>` — inaczej treść mignie w stanie końcowym animacji. */
export const enableMotionScript = `document.documentElement.classList.remove(${JSON.stringify(
	NO_JS_CLASS
)})`

/** Wspólny rytm animacji wejścia — rozjazd o 100 ms między blokami wygląda jak usterka. */
export const motionTokens = {
	/** W SEKUNDACH — motion nie liczy w milisekundach. */
	duration: 0.5,
	/** Dystans dojazdu w pikselach. */
	distance: 16,
	/** Odstęp między elementami grupy. */
	stagger: 0.08,
	/** Szybki start, łagodne hamowanie — ruch ma dojeżdżać, nie rozpędzać się. */
	ease: [0.22, 1, 0.36, 1],
} as const
