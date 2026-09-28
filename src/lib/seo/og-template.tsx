import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

import { siteConfig } from '@/site.config'

/**
 * Wspólny szablon obrazów Open Graph — miniatur pokazywanych przy udostępnianiu
 * linku na Facebooku, LinkedInie, Slacku czy w komunikatorach.
 *
 * ─── DLACZEGO TO NIE IDZIE PRZEZ `components/ui` ─────────────────────────────
 *
 * Reguła „widoki buduje się wyłącznie z components/ui" tu nie obowiązuje i nie
 * jest to wyjątek dla wygody. Obraz renderuje Satori, który NIE jest
 * przeglądarką — obsługuje wąski wycinek CSS-a i nie zna Tailwinda w postaci,
 * w jakiej my go używamy. Wstawienie tu `Typography` czy `Card` skończyłoby się
 * pustym prostokątem, bo klasy nie mają się na czym rozwinąć.
 *
 * Konkretnie NIE działają:
 *   • fonty wariantowe — stąd statyczny `.ttf` w `src/assets/og`
 *   • `repeating-linear-gradient` i większość zaawansowanych teł
 *   • jednostki względne inne niż px oraz `gap` w części układów
 *   • każdy element bez jawnego `display` — Satori wymaga go nawet na `<div>`
 *
 * Trzymaj układ na płaskich kolorach i jawnych rozmiarach w pikselach.
 *
 * Font leży w `src/assets`, a nie w `public/`, bo ma być CZYTANY przy
 * generowaniu obrazu, a nie serwowany przeglądarce.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Rozmiar wymagany przez Open Graph. Mniejszy bywa przez serwisy odrzucany. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 }

export const OG_IMAGE_CONTENT_TYPE = 'image/png'

const COLORS = {
	background: '#0a0a0a',
	foreground: '#fafafa',
	muted: '#a1a1a1',
} as const

export interface OgTemplateInput {
	/** Napis nad tytułem — u nas domena albo dział strony. */
	eyebrow: string
	title: string
	/** Podpis pod tytułem. Pomijany, gdy pusty — nie zostawia wtedy dziury. */
	description?: string
	/** Prawy dolny róg: data wpisu, nazwa autora. Opcjonalny. */
	footnote?: string
}

/**
 * Buduje obraz Open Graph.
 *
 * Długość tytułu jest ograniczana, a nie zawijana w nieskończoność: Satori nie
 * przycina tekstu sam, więc długi tytuł wyszedłby poza kadr i po prostu zniknął
 * z dolnej krawędzi obrazu. Objaw jest niewidoczny w kodzie — trzeba obejrzeć
 * wygenerowany plik.
 */
export async function renderOgImage({
	eyebrow,
	title,
	description,
	footnote,
}: OgTemplateInput): Promise<ImageResponse> {
	const inter = await readFile(join(process.cwd(), 'src/assets/og/inter-semibold.ttf'))

	// Progi dobrane tak, żeby tekst zmieścił się w kadrze przy największym
	// stopniu pisma. Sprawdzone na wygenerowanych plikach, nie wyliczone.
	const trimmedTitle = truncate(title, 90)
	const trimmedDescription = description ? truncate(description, 160) : undefined

	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				backgroundColor: COLORS.background,
				color: COLORS.foreground,
				padding: 80,
				fontFamily: 'Inter',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					fontSize: 28,
					letterSpacing: 4,
					textTransform: 'uppercase',
					color: COLORS.muted,
				}}
			>
				{eyebrow}
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
				<div
					style={{
						display: 'flex',
						// Stopień pisma zależy od długości tytułu. Tytuł wpisu bloga bywa
						// dwa razy dłuższy od nazwy strony, a jeden rozmiar dla obu
						// znaczy albo mikroskopijną nazwę, albo tytuł poza kadrem.
						fontSize: trimmedTitle.length > 45 ? 64 : 84,
						lineHeight: 1.05,
					}}
				>
					{trimmedTitle}
				</div>

				{trimmedDescription ? (
					<div
						style={{
							display: 'flex',
							fontSize: 34,
							lineHeight: 1.35,
							color: COLORS.muted,
							maxWidth: 900,
						}}
					>
						{trimmedDescription}
					</div>
				) : null}
			</div>

			<div
				style={{
					display: 'flex',
					alignItems: 'flex-end',
					justifyContent: 'space-between',
				}}
			>
				<div
					style={{
						display: 'flex',
						height: 8,
						width: 220,
						backgroundColor: COLORS.foreground,
					}}
				/>

				{footnote ? (
					<div style={{ display: 'flex', fontSize: 26, color: COLORS.muted }}>{footnote}</div>
				) : null}
			</div>
		</div>,
		{
			...OG_IMAGE_SIZE,
			fonts: [{ name: 'Inter', data: inter, style: 'normal', weight: 600 }],
		}
	)
}

/** Domena bez protokołu — używana jako napis nad tytułem. */
export function siteDomain(): string {
	return siteConfig.url.replace(/^https?:\/\//, '')
}

function truncate(text: string, limit: number): string {
	if (text.length <= limit) return text

	// Ucinamy na granicy słowa, żeby nie kończyć w połowie wyrazu.
	const cut = text.slice(0, limit)
	const lastSpace = cut.lastIndexOf(' ')

	return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
