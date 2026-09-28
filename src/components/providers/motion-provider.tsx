'use client'

import { MotionConfig } from 'motion/react'
import type * as React from 'react'

/**
 * `reducedMotion='user'` — biblioteka sama pomija animacje przesunięcia, WEWNĄTRZ
 * siebie, bez zmiany drzewa dokumentu. Rozgałęzienie w komponencie dawałoby
 * niezgodność hydracji, bo serwer nie zna ustawienia systemowego.
 *
 * Drugie z trzech zabezpieczeń: pierwsze to reguły w `app/theme/motion.css`,
 * trzecie klasa `no-js`.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
	return <MotionConfig reducedMotion='user'>{children}</MotionConfig>
}
