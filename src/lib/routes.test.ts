import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { isUnlocalizedPath, staticRoutes, UNLOCALIZED_SEGMENTS } from '@/lib/routes'

/**
 * Trasy spoza routingu językowego są opisane w DWÓCH miejscach: tutaj i w
 * matcherze `proxy.ts`, bo Next.js wymaga tam literału, którego nie da się
 * złożyć ze stałej. Rozjazd między nimi łamie się cicho — link prowadzi do
 * `/en/dev`, dostajemy 404 i nic tego nie zgłasza. Ten plik zamienia to w błąd.
 */

describe('segmenty poza routingiem językowym', () => {
	const proxySource = readFileSync(join(process.cwd(), 'src', 'proxy.ts'), 'utf8')
	const matcher = proxySource.match(/matcher:\s*\[([^\]]*)\]/)?.[1] ?? ''

	it('proxy.ts faktycznie deklaruje matcher', () => {
		expect(matcher, 'nie znaleziono matchera w proxy.ts').not.toBe('')
	})

	for (const segment of UNLOCALIZED_SEGMENTS) {
		it(`matcher proxy wyklucza "${segment}"`, () => {
			expect(
				matcher,
				`Segment "${segment}" jest w UNLOCALIZED_SEGMENTS, ale proxy.ts go nie wyklucza. ` +
					'next-intl dokleiłby mu prefiks języka.'
			).toContain(segment)
		})
	}
})

describe('isUnlocalizedPath', () => {
	it('rozpoznaje trasę spoza routingu językowego', () => {
		expect(isUnlocalizedPath('/dev')).toBe(true)
		expect(isUnlocalizedPath('/dev/styleguide')).toBe(true)
		expect(isUnlocalizedPath('/api/health')).toBe(true)
	})

	it('przepuszcza zwykłe podstrony', () => {
		expect(isUnlocalizedPath('/')).toBe(false)
		expect(isUnlocalizedPath('/kontakt')).toBe(false)
		expect(isUnlocalizedPath('/polityka-prywatnosci')).toBe(false)
	})

	it('nie łapie ścieżki tylko dlatego, że segment jest jej przedrostkiem', () => {
		// `/developers` zaczyna się od „dev", ale jest zwykłą podstroną.
		expect(isUnlocalizedPath('/developers')).toBe(false)
		expect(isUnlocalizedPath('/api-reference')).toBe(false)
	})

	it('pomija parametry zapytania i kotwicę', () => {
		expect(isUnlocalizedPath('/dev?tab=1')).toBe(true)
		expect(isUnlocalizedPath('/dev#actions')).toBe(true)
	})
})

describe('rejestr tras statycznych', () => {
	it('każda ścieżka zaczyna się od ukośnika', () => {
		for (const route of staticRoutes) {
			expect(route.path.startsWith('/'), `"${route.path}" bez wiodącego ukośnika`).toBe(true)
		}
	})

	it('nie ma powtórzonych ścieżek', () => {
		const paths = staticRoutes.map(route => route.path)

		expect(paths).toEqual([...new Set(paths)])
	})

	it('żadna trasa statyczna nie koliduje z segmentem poza routingiem', () => {
		for (const route of staticRoutes) {
			expect(
				isUnlocalizedPath(route.path),
				`"${route.path}" koliduje z trasą nielokalizowaną`
			).toBe(false)
		}
	})
})
