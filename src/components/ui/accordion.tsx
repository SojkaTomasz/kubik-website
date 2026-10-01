import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'

import { cn } from '@/lib/utils'
import { MinusIcon, PlusIcon } from 'lucide-react'

/*
 * ⚠️ PLIK ZMODYFIKOWANY względem rejestru shadcn: `hiddenUntilFound` domyślnie
 * na panelu oraz wygląd FAQ Kubika — linie między pytaniami, pytanie krojem
 * nagłówkowym, plus / minus zamiast strzałek. `shadcn add --overwrite` to skasuje.
 */

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
	return (
		<AccordionPrimitive.Root
			data-slot='accordion'
			className={cn('flex w-full flex-col', className)}
			{...props}
		/>
	)
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
	return (
		<AccordionPrimitive.Item
			data-slot='accordion-item'
			className={cn('border-t last:border-b', className)}
			{...props}
		/>
	)
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
	return (
		<AccordionPrimitive.Header className='flex'>
			<AccordionPrimitive.Trigger
				data-slot='accordion-trigger'
				className={cn(
					'group/accordion-trigger relative flex flex-1 cursor-pointer items-start justify-between gap-4 py-5 text-left font-heading text-body leading-6 font-bold transition-colors outline-none hover:text-hot-text focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-foreground aria-expanded:**:data-[slot=accordion-trigger-icon]:text-cold-text',
					className
				)}
				{...props}
			>
				{children}
				<PlusIcon
					data-slot='accordion-trigger-icon'
					className='pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden'
				/>
				<MinusIcon
					data-slot='accordion-trigger-icon'
					className='pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline'
				/>
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	)
}

function AccordionContent({
	className,
	children,
	hiddenUntilFound = true,
	...props
}: AccordionPrimitive.Panel.Props) {
	return (
		<AccordionPrimitive.Panel
			data-slot='accordion-content'
			/*
			 * ⚠️ ZMIANA WZGLĘDEM REJESTRU. Base UI domyślnie USUWA zwiniętą treść
			 * z dokumentu — a akordeon to najczęstsze miejsce na FAQ, czyli treść,
			 * po którą przychodzi robot. `until-found` bije `keepMounted`: pozwala
			 * jeszcze wyszukiwarce przeglądarki rozwinąć panel.
			 */
			hiddenUntilFound={hiddenUntilFound}
			className='overflow-hidden text-base text-muted-foreground data-open:animate-accordion-down data-closed:animate-accordion-up'
			{...props}
		>
			<div
				className={cn(
					'h-(--accordion-panel-height) pt-0 pr-10 pb-5 leading-[1.5625] data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
					className
				)}
			>
				{children}
			</div>
		</AccordionPrimitive.Panel>
	)
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
