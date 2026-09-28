import createMiddleware from 'next-intl/middleware'

import { routing } from '@/i18n/routing'

/**
 * Proxy — w Next.js 16 dawne `middleware.ts`. Zmieniła się nazwa pliku ORAZ
 * eksportowanej funkcji; stara nazwa nie daje błędu buildu, plik po prostu
 * nigdy się nie uruchamia.
 */
export const proxy = createMiddleware(routing)

/**
 * Ścieżki obsługiwane przez proxy. Pomijamy `/api`, `/dev`, zasoby budowane,
 * `/apple-icon` (jedyny plik metadanych BEZ kropki w adresie) i pliki z kropką.
 *
 * ⚠️ Podwójny ukośnik w `\\.` jest KONIECZNY. Pojedynczy to escape literału,
 * więc do wyrażenia trafia „dowolny znak" i z proxy wypada wszystko poza `/`.
 * Objaw jest mylący — strona główna działa, każda podstrona zwraca 404.
 */
export const config = {
	matcher: ['/((?!api|dev|_next|_vercel|apple-icon|.*\\..*).*)'],
}
