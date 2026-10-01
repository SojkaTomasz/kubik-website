/**
 * ⚠️ PLIK DODANY — wspólny wygląd KAŻDEJ kontrolki formularza.
 *
 * Input, Textarea, InputGroup, Select, NativeSelect, Combobox i InputOTP biorą
 * powierzchnię stąd, więc pole tekstowe i lista wyboru stojące obok siebie
 * w formularzu wyglądają identycznie — i zmieniają się razem. Wcześniej każdy
 * plik rejestru niósł własną kopię tych klas i rozjeżdżały się przy pierwszej
 * poprawce.
 *
 * Wygląd ze styleguide'u w Paperze („04 · Przyciski i pola"): tło karty, sama
 * dolna kreska 2 px — w kolorze linii w spoczynku, niebieska przy fokusie,
 * czerwona przy błędzie. Kanciaste (`--input-radius`).
 *
 * Moduł BEZ 'use client' — z tego samego powodu co `button.variants.ts`:
 * strony /dev czytają listy wariantów po stronie serwera.
 */
import { cva } from '@/lib/cva'

/*
 * Tło pola zawsze KONTRASTUJE z tym, na czym stoi: na tle strony ma kolor karty
 * (styleguide), a wewnątrz karty lub okna — kolor tła strony (popup wyceny,
 * formularz w Kontakcie). Bez tego pole na karcie znika, zostaje sama kreska.
 */
const fieldControlVariants = cva(
	'w-full min-w-0 rounded-(--input-radius) border-0 border-b-2 border-border bg-card text-foreground transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 in-data-[slot=card]:bg-background in-data-[slot=dialog-content]:bg-background',
	{
		variants: {
			/**
			 * Skąd pole wie, że jest aktywne. `self` — sam element dostaje fokus
			 * (input, textarea, przycisk listy). `within` — fokus ma element
			 * W ŚRODKU opakowania (grupa z dopiskiem „m²", żetony comboboxa).
			 */
			focus: {
				self: 'focus-visible:border-cold aria-invalid:border-hot',
				within: 'focus-within:border-cold has-aria-invalid:border-hot',
			},
			/** Wysokość i odstępy wiersza — 56 px jak w projekcie. */
			size: {
				default: 'h-14 px-4',
				/** Bez narzuconej wysokości — textarea, opakowanie z żetonami. */
				auto: 'min-h-14 px-4',
			},
			appearance: {
				/** Tekst — telefon, miejscowość, wybór z listy. */
				default: 'text-body',
				/**
				 * Liczba w kroju nagłówkowym — „80" w polu metrażu. Projekt
				 * eksponuje wpisaną wartość tak samo jak cenę.
				 */
				display: 'font-display text-xl font-bold',
			},
		},
		defaultVariants: {
			focus: 'self',
			size: 'default',
			appearance: 'default',
		},
	}
)

/**
 * Podpowiedź w pustym polu. Zawsze krojem tekstu — także w polu `display`,
 * bo „np. 80" w kroju nagłówkowym udawałby wpisaną wartość.
 */
const fieldPlaceholderClass =
	'placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-placeholder'

/** Lista rozwijana pola (Select, Combobox) — ta sama kanciastość i linia co pole. */
const fieldPopupClass =
	'rounded-(--input-radius) border border-border bg-popover text-popover-foreground shadow-modal'

export { fieldControlVariants, fieldPlaceholderClass, fieldPopupClass }
