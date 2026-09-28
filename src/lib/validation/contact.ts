import { z } from 'zod'

import {
	consentField,
	emailField,
	honeypotField,
	LIMITS,
	longTextField,
	optionalPhoneField,
	renderedAtField,
	shortTextField,
} from '@/lib/validation/fields'

/**
 * Schemat używany DWUKROTNIE: w przeglądarce (wygoda) i w akcji serwerowej
 * (prawda). Serwer nigdy nie ufa temu, co dostał — formularz da się ominąć.
 */
export const contactSchema = z.object({
	name: shortTextField(LIMITS.name),
	email: emailField,
	phone: optionalPhoneField,
	subject: shortTextField(LIMITS.subject),
	message: longTextField(LIMITS.message),
	consent: consentField,

	// Pola techniczne w tym samym schemacie, żeby akcja dostała je zwalidowane.
	website: honeypotField,
	renderedAt: renderedAtField,
})

/** Kształt danych PRZED walidacją — tego używa formularz w przeglądarce. */
export type ContactInput = z.input<typeof contactSchema>

/** Kształt danych PO walidacji — tego używa akcja serwerowa. */
export type ContactData = z.output<typeof contactSchema>

/** `consent: false` mimo wymogu `true` — zgoda zaznaczona domyślnie nie jest zgodą (RODO). */
export const contactDefaults = {
	name: '',
	email: '',
	phone: '',
	subject: '',
	message: '',
	consent: false as unknown as true,
	website: '',
} satisfies Partial<ContactInput>
