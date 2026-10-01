import { z } from 'zod'

/**
 * Pola ochrony przed automatami, wspólne dla formularzy. Komunikaty walidacji
 * są KLUCZAMI tłumaczeń (przestrzeń `validation`), nie tekstem: schemat jest
 * wspólny dla przeglądarki i serwera, więc nie zna języka żądania.
 */

/** Pułapka na roboty: wypełnione = odrzucamy. Musi zostać opcjonalne, żeby człowiek nie dostał błędu. */
export const honeypotField = z.string().optional()

/**
 * Znacznik czasu wyświetlenia formularza — do wykrywania automatów po czasie.
 * Wartość jest liczbą milisekund, ale przez formularz przechodzi jako tekst.
 */
export const renderedAtField = z.coerce.number().optional()
