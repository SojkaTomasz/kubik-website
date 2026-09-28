import { notFound } from 'next/navigation'

import { env } from '@/env'

/**
 * Odcina strony /dev na produkcji. Sam `NODE_ENV` nie wystarcza: preview deploy
 * na Vercelu jest budowany produkcyjnie, a styleguide przydaje się tam
 * najbardziej — stąd flaga `NEXT_PUBLIC_ENABLE_DEV_PAGES`.
 */
export function assertDevPagesEnabled(): void {
	const enabled = env.NODE_ENV !== 'production' || env.NEXT_PUBLIC_ENABLE_DEV_PAGES

	if (!enabled) notFound()
}
