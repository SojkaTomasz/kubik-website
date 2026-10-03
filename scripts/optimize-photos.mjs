/**
 * Wersje webowe zdjęć: oryginały z `../image/` → `src/assets/photos`.
 *
 *   node scripts/optimize-photos.mjs            — odświeża pliki, które już są w assets
 *   node scripts/optimize-photos.mjs 20260901_113809 …  — dokłada wskazane oryginały
 *
 * Plik w assets to ŹRÓDŁO dla `next/image`, a nie to, co dostaje przeglądarka — Next koduje go
 * drugi raz do AVIF/WebP w rozmiarze z `sizes`. Dlatego zapis jest prawie bezstratny: każda strata
 * tutaj dokłada się do straty AVIF-a. Wcześniejsze 1400 px w JPEG 74 dawało widoczne artefakty na
 * cienkich rowkach i krawędziach rur, a okładka realizacji (1280 px CSS, czyli 2560 px na ekranie
 * 2×) była po prostu rozciągana.
 *
 * Metadane są usuwane w całości — oryginały z telefonu niosą współrzędne GPS budowy.
 */
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SOURCE = path.resolve(root, '../image')
const TARGET = path.join(root, 'src/assets/photos')

/** Dłuższy bok — okładka realizacji ma 1280 px CSS, na ekranie 2× to 2560 px. */
const LONG_EDGE = 2560

/**
 * Pliki pochodne: inna nazwa niż oryginał albo obrót do kadru poziomego (pionowe zdjęcie
 * położone na bok, żeby wypełnić hero 4:3).
 */
const derived = {
	'hero-floor': { from: '20260505_115751', rotate: 270, longEdge: 3200 },
	bus: { from: '20250825_112007', rotate: 270 },
}

async function write(name, { from = name, rotate = 0, longEdge = LONG_EDGE } = {}) {
	const input = path.join(SOURCE, `${from}.jpg`)
	if (!existsSync(input)) {
		console.warn(`pominięte: brak oryginału ${from}.jpg`)
		return
	}

	// Najpierw orientacja z EXIF-u, osobnym przebiegiem — sharp przyjmuje jeden `rotate` na potok.
	const upright = await sharp(input).rotate().toBuffer()
	const info = await sharp(upright)
		.rotate(rotate)
		.resize(longEdge, longEdge, { fit: 'inside', withoutEnlargement: true })
		.jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: '4:4:4' })
		.toFile(path.join(TARGET, `${name}.jpg`))

	console.log(`${name}.jpg  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`)
}

const requested = process.argv.slice(2)
const names =
	requested.length > 0
		? requested
		: readdirSync(TARGET)
				.filter(file => file.endsWith('.jpg'))
				.map(file => file.replace(/\.jpg$/, ''))

for (const name of names) {
	await write(name, derived[name])
}
