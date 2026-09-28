import { createNavigation } from 'next-intl/navigation'

import { routing } from '@/i18n/routing'

/**
 * Zamienniki API nawigacyjnego Next.js świadome języka.
 *
 * Używaj ICH, nie `next/link` ani `next/navigation` — same dokładają prefiks
 * języka, więc `<Link href='/kontakt'>` prowadzi do `/en/kontakt`, gdy
 * użytkownik ogląda wersję angielską.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
