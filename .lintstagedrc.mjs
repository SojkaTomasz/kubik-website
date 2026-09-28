/**
 * Konfiguracja lint-staged.
 *
 * Wydzielona z package.json do osobnego pliku, bo potrzebuje logiki, a nie
 * samej listy poleceń — powód poniżej.
 *
 * Windows ma twardy limit 8191 znaków na polecenie. lint-staged domyślnie
 * doklei ścieżkę każdego zmienionego pliku do wywołania ESLinta, więc przy
 * większym commicie (przeniesienie katalogu, `shadcn add --all`, pierwszy
 * commit startera) polecenie przekracza limit i hook pada z komunikatem
 * „The command line is too long" — bez wskazania, co właściwie jest nie tak.
 *
 * Dlatego: przy commicie do PROGU plików sprawdzamy dokładnie te pliki,
 * a powyżej progu przełączamy się na przebieg po całym projekcie. Wolniej,
 * ale zawsze się kończy i nigdy nie blokuje commita z przyczyn technicznych.
 */

import { relative } from 'node:path'

/** Powyżej tylu plików sprawdzamy cały projekt zamiast listy ścieżek. */
const FILE_LIMIT = 30

/**
 * lint-staged podaje ścieżki bezwzględne. Skrócenie ich do względnych daje
 * kilkakrotnie więcej miejsca w limicie i czytelniejsze komunikaty błędów.
 * Cudzysłowy są konieczne — katalogi tras Next.js zawierają nawiasy, np. `(site)`.
 */
const quote = files => files.map(file => `"${relative(process.cwd(), file)}"`).join(' ')

/** @type {import('lint-staged').Configuration} */
const config = {
	'*.{ts,tsx,js,mjs}': files =>
		files.length > FILE_LIMIT
			? ['eslint --fix --max-warnings 0', 'prettier --write .']
			: [`eslint --fix --max-warnings 0 ${quote(files)}`, `prettier --write ${quote(files)}`],

	'*.{json,md,mdx,css,yml,yaml}': files =>
		files.length > FILE_LIMIT ? 'prettier --write .' : `prettier --write ${quote(files)}`,
}

export default config
