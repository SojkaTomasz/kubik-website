/**
 * Przełącza komponenty z components/ui na `cva` z @/lib/cva.
 *
 * Powód: nakładka z @/lib/cva zachowuje konfigurację wariantów, dzięki czemu
 * strony /dev czytają listę wariantów wprost z komponentu, zamiast powtarzać ją
 * w tablicach, które nikt nie aktualizuje.
 *
 * `shadcn add` przywraca oryginalny import z pakietu, więc uruchom to po każdej
 * aktualizacji rejestru — najprościej przez `pnpm ui:sync`.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const uiDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'components', 'ui')

const patched = []

for (const file of readdirSync(uiDir)) {
	if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue

	const path = join(uiDir, file)
	const source = readFileSync(path, 'utf8')

	if (!source.includes("from 'class-variance-authority'")) continue

	// Podmieniamy wyłącznie źródło importu — lista importowanych symboli
	// (cva, VariantProps, cx) zostaje bez zmian, bo @/lib/cva reeksportuje je wszystkie.
	const next = source.replaceAll("from 'class-variance-authority'", "from '@/lib/cva'")

	if (next === source) continue

	writeFileSync(path, next, 'utf8')
	patched.push(file)
}

if (patched.length === 0) {
	console.log('Wszystkie komponenty już importują cva z @/lib/cva.')
} else {
	console.log(`Przełączono na @/lib/cva: ${patched.join(', ')}`)
}
