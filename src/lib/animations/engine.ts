import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

/**
 * Silnik animacji przewijania — GSAP sterowany atrybutami `data-anim` z HTML-u.
 *
 * Ten moduł NIE jest importowany statycznie. Ładuje go `ScrollMotion` przez `import()`
 * po hydracji, więc GSAP (~45 kB po gzipie z wtyczkami) nie stoi na drodze pierwszemu
 * malowaniu ani hydracji. Opis całości i reguły: AGENTS.md, „Animacje".
 *
 * Trzy zasady, na których to stoi:
 *
 * 1. **HTML z serwera jest stanem KOŃCOWYM.** Nic nie startuje ukryte. Silnik chowa
 *    element dopiero w przeglądarce i tylko wtedy, gdy ten jest POZA ekranem — awaria
 *    skryptu, brak JS-a czy wolne łącze zostawiają stronę po prostu bez animacji.
 * 2. **Chowamy przez `opacity`, nigdy przez `visibility`/`autoAlpha`.** Element
 *    z `visibility: hidden` wypada z drzewa dostępności, a czytnik ekranu czyta stronę
 *    bez przewijania — cała treść pod pierwszym ekranem byłaby dla niego niema.
 * 3. **Wejście w kadr wykrywa IntersectionObserver, nie ScrollTrigger.** Sekcje mają
 *    `content-visibility: auto` (`deferLayout`), więc ich wysokość zmienia się w chwili
 *    wyrenderowania, a pozycje policzone przez ScrollTrigger rozjeżdżają się. Observer
 *    pyta przeglądarkę o widoczność wprost. ScrollTrigger zostaje do paralaksy hero,
 *    która stoi nad wszystkimi odroczonymi sekcjami.
 */

gsap.registerPlugin(ScrollTrigger, SplitText)

/** Rytm wspólny z `motionTokens`: szybki start, długie hamowanie. */
const EASE = 'expo.out'
const DISTANCE = 32
const STAGGER = 0.08

/**
 * Słownik ROLI, nie efektu — każda rola ma jeden ruch, ten sam w całym serwisie.
 * Odwiedzający uczy się go po dwóch sekcjach i dalej ruch prowadzi wzrok, zamiast
 * zwracać na siebie uwagę. Nowy element dostaje rolę, której już używa podobny —
 * nowy efekt tylko wtedy, gdy rzeczywiście dochodzi nowa rola.
 *
 *   heading   tytuł sekcji          linie spod maski
 *   eyebrow   etykieta mono          litery zapalają się od lewej, jak pisane
 *   text      lead, opis             linie wyostrzają się z rozmycia, kaskadą
 *   image     zdjęcie                kurtyna od dołu + powrót ze zbliżenia
 *   badge     tag na zdjęciu         wysuwa się z lewej, gdy zdjęcie już stoi
 *   action    przycisk, akcja        dojeżdża ostatni, z lekkiego pomniejszenia
 *   line      kreska rury            rysuje się od lewej
 *   stagger   lista, karty           kaskada
 *   rise      blok bez własnej roli  wjazd z dołu
 *
 * Liczby (licznik od zera) NIE są tutaj: robi je `react-countup` w `components/motion/count-up.tsx`,
 * używany przez `Stat` i `Rating`.
 *   steps     kroki na rurze         rura napełnia się od ciepłego do zimnego
 *   parallax  zdjęcie hero           wolniejsze od przewijania
 */
export type AnimationKind =
	| 'heading'
	| 'eyebrow'
	| 'text'
	| 'image'
	| 'badge'
	| 'action'
	| 'line'
	| 'stagger'
	| 'rise'
	| 'steps'
	| 'parallax'

const delayOf = (element: HTMLElement) => Number(element.dataset.animDelay ?? 0)

interface Animation {
	/** Stan wyjściowy — wołany, gdy element jest poza ekranem. */
	prepare: (element: HTMLElement) => void
	/** Wejście w kadr. */
	play: (element: HTMLElement) => void
}

function staggerTargets(element: HTMLElement): HTMLElement[] {
	const selector = element.dataset.animItems
	const items = selector ? element.querySelectorAll<HTMLElement>(selector) : element.children

	return [...items].filter((item): item is HTMLElement => item instanceof HTMLElement)
}

/** Zdjęcie animuje się na dwóch warstwach: ramka odsłania kadr, obraz w niej wraca ze zbliżenia. */
function imageLayers(element: HTMLElement) {
	const image = element instanceof HTMLImageElement ? element : element.querySelector('img')
	const frame = image?.parentElement ?? element

	return { image, frame }
}

const animations: Record<AnimationKind, Animation> = {
	/*
	 * Nagłówek wjeżdża linia po linii spod maski. Podział na linie dzieje się dopiero
	 * przy wejściu w kadr: w sekcji odroczonej tekst nie ma wcześniej układu, więc
	 * SplitText policzyłby złe linie. Po animacji podział jest cofany — w DOM-ie
	 * zostaje oryginalny nagłówek, z nazwą dostępną bez `aria-label`.
	 */
	heading: {
		prepare: element => gsap.set(element, { opacity: 0 }),
		play: element => {
			const split = SplitText.create(element, { type: 'lines', mask: 'lines' })
			gsap.set(element, { opacity: 1 })
			gsap.from(split.lines, {
				yPercent: 110,
				duration: 1.1,
				ease: EASE,
				stagger: 0.1,
				onComplete: () => split.revert(),
			})
		},
	},

	/* Etykieta mono — krótka, więc znak po znaku: czyta się jak wpisywana. */
	eyebrow: {
		prepare: element => gsap.set(element, { opacity: 0 }),
		play: element => {
			const split = SplitText.create(element, { type: 'chars' })
			gsap.set(element, { opacity: 1 })
			gsap.from(split.chars, {
				opacity: 0,
				duration: 0.35,
				ease: 'none',
				stagger: { amount: 0.5 },
				onComplete: () => split.revert(),
			})
		},
	},

	/* Akapit — linie wyostrzają się z rozmycia, spokojniej niż tytuł nad nimi. */
	text: {
		prepare: element => gsap.set(element, { opacity: 0 }),
		play: element => {
			const split = SplitText.create(element, { type: 'lines' })
			gsap.set(element, { opacity: 1 })
			gsap.from(split.lines, {
				opacity: 0,
				y: 14,
				filter: 'blur(8px)',
				duration: 1.1,
				ease: 'power3.out',
				stagger: 0.07,
				delay: delayOf(element) || 0.15,
				onComplete: () => split.revert(),
			})
		},
	},

	/* Tag na zdjęciu — wychodzi zza lewej krawędzi, gdy kurtyna zdjęcia już opadła. */
	badge: {
		prepare: element =>
			gsap.set(element, { opacity: 0, x: -24, clipPath: 'inset(0% 100% 0% 0%)' }),
		play: element =>
			gsap.to(element, {
				opacity: 1,
				x: 0,
				clipPath: 'inset(0% 0% 0% 0%)',
				duration: 0.9,
				ease: EASE,
				delay: delayOf(element) || 0.7,
				clearProps: 'transform,clipPath',
			}),
	},

	/* Przycisk — domyka sekcję: ostatni w kolejce, z lekkiego pomniejszenia. */
	action: {
		prepare: element => gsap.set(element, { opacity: 0, y: 16, scale: 0.96 }),
		play: element =>
			gsap.to(element, {
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 0.9,
				ease: EASE,
				delay: delayOf(element) || 0.35,
				clearProps: 'transform',
			}),
	},

	/* Kreska rury — rysuje się od ciepłego końca. */
	line: {
		prepare: element => gsap.set(element, { scaleX: 0, transformOrigin: '0% 50%' }),
		play: element =>
			gsap.to(element, {
				scaleX: 1,
				duration: 1.4,
				ease: 'expo.inOut',
				delay: delayOf(element),
				clearProps: 'transform',
			}),
	},

	rise: {
		prepare: element => gsap.set(element, { opacity: 0, y: DISTANCE }),
		play: element =>
			gsap.to(element, {
				opacity: 1,
				y: 0,
				duration: 1,
				ease: EASE,
				delay: delayOf(element),
				clearProps: 'transform',
			}),
	},

	stagger: {
		prepare: element => gsap.set(staggerTargets(element), { opacity: 0, y: DISTANCE }),
		play: element =>
			gsap.to(staggerTargets(element), {
				opacity: 1,
				y: 0,
				duration: 1,
				ease: EASE,
				stagger: STAGGER,
				clearProps: 'transform',
			}),
	},

	image: {
		prepare: element => {
			const { image, frame } = imageLayers(element)
			gsap.set(frame, { clipPath: 'inset(100% 0% 0% 0%)' })
			if (image) gsap.set(image, { scale: 1.25 })
		},
		play: element => {
			const { image, frame } = imageLayers(element)
			gsap.to(frame, {
				clipPath: 'inset(0% 0% 0% 0%)',
				duration: 1.3,
				ease: 'expo.inOut',
				clearProps: 'clipPath',
			})
			if (image) {
				gsap.to(image, { scale: 1, duration: 1.8, ease: EASE, clearProps: 'transform' })
			}
		},
	},

	/*
	 * Rura w „Jak to działa": kroki zapalają się po kolei, a odcinek między nimi
	 * napełnia się od ciepłego do zimnego — jak woda puszczona w pętlę.
	 */
	steps: {
		prepare: element => {
			const parts = stepParts(element)
			gsap.set(parts.markers, { opacity: 0, scale: 0.4 })
			gsap.set(parts.texts, { opacity: 0, y: 16 })
			for (const connector of parts.connectors) {
				gsap.set(connector, connectorStart(connector))
			}
		},
		play: element => {
			const { items } = stepParts(element)
			const timeline = gsap.timeline({ defaults: { ease: EASE } })

			for (const item of items) {
				const marker = item.querySelector('[data-slot="steps-marker"]')
				const text = item.querySelector('[data-slot="steps-marker"] + *')
				const connector = item.querySelector<HTMLElement>('[data-slot="steps-connector"]')

				timeline.to(marker, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' })
				timeline.to(text, { opacity: 1, y: 0, duration: 0.7, clearProps: 'transform' }, '<0.1')
				if (connector) {
					timeline.to(
						connector,
						{ scaleX: 1, scaleY: 1, duration: 0.55, ease: 'power1.inOut' },
						'<0.15'
					)
				}
			}
		},
	},

	/** Paralaksa zdjęcia w hero — sterowana przewinięciem, nie wejściem w kadr. */
	parallax: {
		prepare: () => {},
		play: element => {
			const section = element.closest('section') ?? element
			// Ruch idzie na RAMKĘ zdjęcia: `<img>` ma animację wejścia z CSS-a, a ta wygrywa
			// z transformacją inline, którą ustawia GSAP.
			const target =
				element instanceof HTMLImageElement ? (element.parentElement ?? element) : element
			gsap.to(target, {
				yPercent: 18,
				ease: 'none',
				scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
			})
		},
	},
}

function stepParts(element: HTMLElement) {
	const items = [...element.querySelectorAll<HTMLElement>('[data-slot="steps-item"]')]

	return {
		items,
		markers: element.querySelectorAll('[data-slot="steps-marker"]'),
		texts: element.querySelectorAll('[data-slot="steps-marker"] + *'),
		connectors: [...element.querySelectorAll<HTMLElement>('[data-slot="steps-connector"]')],
	}
}

/** Odcinek rury rośnie wzdłuż swojej osi — w kolumnie w dół, w rzędzie w prawo. */
function connectorStart(connector: HTMLElement): gsap.TweenVars {
	const { width, height } = connector.getBoundingClientRect()

	return width > height
		? { scaleX: 0, transformOrigin: '0% 50%' }
		: { scaleY: 0, transformOrigin: '50% 0%' }
}

function isAnimationKind(value: string | undefined): value is AnimationKind {
	return value !== undefined && value in animations
}

/**
 * Uruchamia animacje dla wszystkich `[data-anim]` w `root`. Zwraca sprzątanie:
 * odłącza obserwatora i cofa WSZYSTKO, co GSAP zmienił (style, podziały tekstu,
 * ScrollTriggery) — wołane przy zmianie trasy.
 */
export function startAnimations(root: ParentNode): () => void {
	const context = gsap.context(() => {})
	/** Obserwowany element → animacje, które od niego zależą (zdjęcie i jego tag dzielą ramkę). */
	const targets = new Map<Element, { element: HTMLElement; kind: AnimationKind }[]>()
	/** Pierwsze zgłoszenie obserwatora rozstrzyga stan — kolejne tylko odpalają animację. */
	const decided = new WeakSet<Element>()

	const observer = new IntersectionObserver(
		entries => {
			for (const entry of entries) {
				const group = targets.get(entry.target) ?? []

				if (!decided.has(entry.target)) {
					decided.add(entry.target)
					// Widoczny już teraz — zostaje tak, jak przyszedł z serwera. Schowanie go
					// i odegranie od nowa byłoby mignięciem, nie animacją.
					if (entry.isIntersecting) {
						observer.unobserve(entry.target)
					} else {
						for (const { element, kind } of group) {
							context.add(() => animations[kind].prepare(element))
						}
					}
					continue
				}

				if (isInView(entry)) {
					observer.unobserve(entry.target)
					for (const { element, kind } of group) {
						context.add(() => animations[kind].play(element))
					}
				}
			}
		},
		{ threshold: [0, 0.15] }
	)

	for (const element of root.querySelectorAll<HTMLElement>('[data-anim]')) {
		const kind = element.dataset.anim
		if (kind === 'parallax') {
			context.add(() => animations.parallax.play(element))
		} else if (isAnimationKind(kind)) {
			const sentinel = sentinelFor(element, kind)
			targets.set(sentinel, [...(targets.get(sentinel) ?? []), { element, kind }])
			observer.observe(sentinel)
		}
	}

	return () => {
		observer.disconnect()
		context.revert()
	}
}

/**
 * Element, o którego widoczność pyta obserwator. Zwykle sam animowany — ale nie wtedy,
 * gdy stan wyjściowy animacji go przycina: IntersectionObserver w Chrome uwzględnia
 * `clip-path`, a `scaleX(0)` daje pudełko o zerowej szerokości. Zdjęcie za kurtyną,
 * tag schowany za krawędzią i niewyrysowana kreska byłyby wtedy „niewidoczne" na
 * zawsze — i nigdy by nie wjechały. Pytamy więc ich rodzica, którego animacja nie rusza.
 */
function sentinelFor(element: HTMLElement, kind: AnimationKind): Element {
	if (kind === 'image') {
		const { frame } = imageLayers(element)
		return frame.parentElement ?? frame
	}
	if (kind === 'badge' || kind === 'line') return element.parentElement ?? element

	return element
}

/** 15% elementu w kadrze — albo ćwierć ekranu, gdy element jest wyższy niż sam ekran. */
function isInView(entry: IntersectionObserverEntry): boolean {
	return (
		entry.intersectionRatio >= 0.15 ||
		entry.intersectionRect.height >= (entry.rootBounds?.height ?? window.innerHeight) * 0.25
	)
}
