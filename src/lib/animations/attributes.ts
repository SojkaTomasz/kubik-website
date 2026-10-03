import type * as React from 'react'

import type { AnimationKind } from '@/lib/animations/engine'

/*
 * Atrybuty dla silnika animacji (`engine.ts`). Moduł bez GSAP-a i bez `'use client'` —
 * importują go komponenty serwerowe, a sam silnik dociąga się dopiero w przeglądarce.
 * Import samego TYPU z `engine.ts` znika przy kompilacji, więc nie wciąga GSAP-a.
 */

/** `data-anim` z kontrolą typu — literówka w nazwie animacji nie przejdzie kompilacji. */
export function anim(kind: AnimationKind, options: { items?: string; delay?: number } = {}) {
	return {
		'data-anim': kind,
		...(options.items ? { 'data-anim-items': options.items } : {}),
		...(options.delay ? { 'data-anim-delay': String(options.delay) } : {}),
	}
}

/**
 * `key` dla nagłówka z `anim('heading')`. SplitText cofa podział przez `innerHTML`, więc
 * węzły tekstowe Reacta w środku przestają być podpięte do dokumentu. Klucz z treści
 * sprawia, że zmiana tekstu (przejście między realizacjami z innym CTA) montuje nowy
 * element, zamiast aktualizować odpięty węzeł — bez tego tekst zostałby stary.
 */
export function animationKey(content: React.ReactNode): string | undefined {
	return typeof content === 'string' || typeof content === 'number' ? String(content) : undefined
}
