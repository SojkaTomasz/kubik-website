import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

/**
 * Zmienne środowiskowe w jednym miejscu, walidowane przy starcie i buildzie.
 *
 * Nigdy nie sięgaj do `process.env` bezpośrednio — importuj `env` z tego pliku.
 * Dzięki temu literówka w nazwie zmiennej wychodzi w buildzie, a nie na produkcji.
 */

/** '1' | 'true' | 'yes' → true; wszystko inne (w tym brak zmiennej) → false. */
const booleanFlag = z
	.string()
	.optional()
	.transform(value => value === 'true' || value === '1' || value === 'yes')

export const env = createEnv({
	/**
	 * Zmienne po OBU stronach granicy. `NODE_ENV` należy tutaj, nie do sekcji
	 * serwerowej: warstwy współdzielone (filtrowanie szkiców) muszą je odczytać,
	 * a w sekcji serwerowej kończyło się to błędem o dostępie z klienta.
	 */
	shared: {
		NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	},

	server: {
		RESEND_API_KEY: z.string().min(1).optional(),
		MAIL_FROM: z.string().email().optional(),
		MAIL_FROM_NAME: z.string().min(1).optional(),
		MAIL_TO: z.string().email().optional(),
	},

	client: {
		NEXT_PUBLIC_SITE_URL: z.string().url(),
		NEXT_PUBLIC_GTM_ID: z
			.string()
			.regex(/^GTM-[A-Z0-9]+$/, 'Oczekiwano identyfikatora w formacie GTM-XXXXXXX')
			.optional()
			.or(z.literal('')),
		NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS: booleanFlag,
		NEXT_PUBLIC_ENABLE_DEV_PAGES: booleanFlag,
		NEXT_PUBLIC_CONTACT_EMAIL: z.string().email(),
		NEXT_PUBLIC_CONTACT_PHONE: z.string().min(1),
	},

	/**
	 * Next.js podmienia `process.env.NEXT_PUBLIC_*` w kodzie klienta na etapie builda,
	 * więc każdą zmienną trzeba wypisać dosłownie — destrukturyzacja tu nie zadziała.
	 */
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		MAIL_FROM: process.env.MAIL_FROM,
		MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
		MAIL_TO: process.env.MAIL_TO,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
		NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS,
		NEXT_PUBLIC_ENABLE_DEV_PAGES: process.env.NEXT_PUBLIC_ENABLE_DEV_PAGES,
		NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
		NEXT_PUBLIC_CONTACT_PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE,
	},

	/** Pusty string w .env traktujemy jak brak zmiennej, nie jak wartość. */
	emptyStringAsUndefined: true,

	/** W CI walidację można pominąć, gdy build nie ma dostępu do sekretów. */
	skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
})
