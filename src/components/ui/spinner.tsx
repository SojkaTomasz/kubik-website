import { cn } from '@/lib/utils'
import { Loader2Icon } from 'lucide-react'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: spinner jest DOMYŚLNIE
 * dekoracyjny, nazwę dostępną dostaje przez `label`.
 * `shadcn add spinner --overwrite` to skasuje. Pełna lista: AGENTS.md.
 */

export interface SpinnerProps extends React.ComponentProps<'svg'> {
	/**
	 * Nazwa dostępna. Podaj JEDYNIE wtedy, gdy spinner jest samodzielnym
	 * komunikatem o trwającej operacji — czyli nic obok niego tego nie mówi.
	 *
	 * Bez tego propsa spinner jest dekoracją (`aria-hidden`). Rejestr shadcn
	 * wpisywał tu na stałe `role='status' aria-label='Loading'`, co dawało dwa
	 * problemy naraz: angielskie słowo czytane polskim głosem oraz podwójne
	 * ogłoszenie w `Button isLoading`, gdzie stan niesie już `aria-busy`
	 * i podmieniony napis przycisku.
	 */
	label?: string
}

function Spinner({ className, label, ...props }: SpinnerProps) {
	return (
		<Loader2Icon
			data-slot='spinner'
			{...(label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': 'true' })}
			className={cn('size-4 animate-spin', className)}
			{...props}
		/>
	)
}

export { Spinner }
