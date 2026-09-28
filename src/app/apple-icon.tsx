import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

import { APPLE_ICON_BACKGROUND } from '@/app/icon-mark'

/**
 * Ikona na ekran startowy iOS-a. Bez niej iPhone wstawia ZRZUT strony i nie
 * ostrzega o tym — widać dopiero na urządzeniu. Safari nie przyjmuje SVG,
 * ikona musi być rastrowa 180×180.
 *
 * Tło malowane na CAŁĄ powierzchnię, bo iOS nakłada własną maskę i zaokrąglone
 * rogi z `icon.svg` zostawiłyby przy krawędziach sierpy. Znak jest czytany
 * z `icon.svg`; powtórzony jest tylko kolor tła — pilnuje go `icon-mark.test.ts`.
 */
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function AppleIcon() {
	const mark = await readFile(join(process.cwd(), 'src/app/icon.svg'), 'utf8')

	return new ImageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: APPLE_ICON_BACKGROUND,
			}}
		>
			{/* Satori przyjmuje SVG wyłącznie jako obraz `data:`. Bez
					`encodeURIComponent` znaki `#` z kolorów urywają adres. */}
			<img
				src={`data:image/svg+xml;utf8,${encodeURIComponent(mark)}`}
				alt=''
				width={128}
				height={128}
			/>
		</div>,
		size
	)
}
