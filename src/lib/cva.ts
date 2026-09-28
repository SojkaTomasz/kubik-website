import { cva as createVariants } from 'class-variance-authority'

export type { VariantProps } from 'class-variance-authority'
export { cx } from 'class-variance-authority'

/**
 * Nakładka na `cva` zachowująca konfigurację wariantów — bez niej strony /dev
 * musiałyby powtarzać listy wariantów ręcznie i rozjeżdżałyby się po cichu.
 *
 * Wszystkie komponenty w `components/ui` importują `cva` STĄD, nie z pakietu.
 * Po `shadcn add` przywraca to `pnpm ui:sync`.
 */
export function cva<T>(...args: Parameters<typeof createVariants<T>>) {
	const [, config] = args

	return Object.assign(createVariants<T>(...args), { variantsConfig: config })
}

/**
 * Wartości osi wariantów odczytane z komponentu:
 * `variantKeys(buttonVariants, 'variant')` → `['default', 'outline', …]`.
 *
 * `P` wnioskowane wprost z parametru, nie przez `Parameters<F>` — ta druga
 * droga daje `never[]`.
 */
export function variantKeys<P, A extends Exclude<keyof P, 'class' | 'className'>>(
	fn: ((props?: P) => string) & { variantsConfig?: unknown },
	axis: A
): NonNullable<P[A]>[] {
	const config = fn.variantsConfig as
		{ variants?: Record<string, Record<string, unknown>> } | undefined

	const axisConfig = config?.variants?.[axis as string]

	if (!axisConfig) {
		// Dwie przyczyny, obie ciche: import `cva` z pakietu zamiast stąd, albo
		// odczyt wariantów z modułu z 'use client' w komponencie serwerowym
		// (dociera jako pusta skorupa — wzorzec: `button.variants.ts`).
		console.warn(
			`variantKeys: brak konfiguracji osi "${String(axis)}". ` +
				'Sprawdź, czy komponent importuje cva z @/lib/cva (pnpm ui:sync) ' +
				"i czy definicja wariantów nie siedzi w module z 'use client'."
		)
		return []
	}

	return Object.keys(axisConfig) as NonNullable<P[A]>[]
}
