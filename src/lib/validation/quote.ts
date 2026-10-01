import { z } from 'zod'

import { honeypotField, renderedAtField } from '@/lib/validation/fields'

/**
 * Zapytanie o wycenę — metraż, telefon, miejscowość (docs/teksty.md, „Wspólne").
 * Bez imienia i bez e-maila: im mniej pól, tym więcej osób zostawia numer.
 *
 * Schemat używany DWUKROTNIE: w przeglądarce (wygoda) i w akcji serwerowej
 * (prawda). Komunikaty to klucze przestrzeni `validation`.
 */

/** Rozsądne granice metrażu — chronią przed literówką „8000" zamiast „80". */
export const AREA_LIMITS = { min: 5, max: 2000 } as const

export const quoteSchema = z.object({
	// `coerce`: pole tekstowe w formularzu, liczba w akcji. Przecinek dziesiętny
	// zamieniamy na kropkę — „42,5" to w Polsce normalny zapis.
	area: z.preprocess(
		value => (typeof value === 'string' ? value.replace(',', '.').trim() : value),
		z.coerce
			.number({ error: 'area' })
			.min(AREA_LIMITS.min, { error: 'area' })
			.max(AREA_LIMITS.max, { error: 'area' })
	),
	phone: z
		.string({ error: 'required' })
		.trim()
		.min(1, { error: 'required' })
		// Bez ścisłego wzorca: formularz nie jest miejscem na naukę „poprawnego"
		// zapisu numeru. Dziewięć cyfr to minimum polskiego numeru.
		.regex(/^[\d\s+()-]{9,20}$/, { error: 'phone' }),
	city: z.string().trim().max(80, { error: 'tooLong' }).optional().or(z.literal('')),
	/** Podstrona, z której przyszło zapytanie — właściciel widzi ją w mailu. */
	page: z.string().max(200).optional(),

	website: honeypotField,
	renderedAt: renderedAtField,
})

/** Kształt danych PRZED walidacją — tego używa formularz w przeglądarce. */
export type QuoteInput = z.input<typeof quoteSchema>

/** Kształt danych PO walidacji — tego używa akcja serwerowa. */
export type QuoteData = z.output<typeof quoteSchema>

export const quoteDefaults = {
	area: '',
	phone: '',
	city: '',
	website: '',
} satisfies Partial<QuoteInput>
