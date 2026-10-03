import { useTranslations } from 'next-intl'

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Section } from '@/components/ui/section'
import { SectionHeading } from '@/components/ui/section-heading'
import { anim } from '@/lib/animations/attributes'
import { faqJsonLd, JsonLd } from '@/lib/seo'

export interface FaqSectionProps {
	eyebrow: string
	title?: string
	items: { question: string; answer: string }[]
}

/**
 * FAQ (Paper: „FaqAccordion") — nagłówek z lewej, pytania z prawej, pierwsze
 * rozwinięte. Dane strukturalne `FAQPage` z tych samych pozycji, więc to, co
 * widzi Google, jest dokładnie tym, co na stronie (wymóg wytycznych FAQ).
 *
 * Odpowiedzi zostają w dokumencie także zwinięte (`hiddenUntilFound`
 * w `accordion.tsx`) — FAQ to treść, po którą przychodzi robot.
 */
export function FaqSection({ eyebrow, title, items }: FaqSectionProps) {
	const t = useTranslations('sections')

	return (
		<Section
			deferLayout
			aria-labelledby='faq-title'
			background='card'
		>
			<JsonLd data={faqJsonLd(items)} />

			<div className='relative grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20'>
				<SectionHeading
					eyebrow={eyebrow}
					title={title ?? t('faqTitle')}
					titleId='faq-title'
					lead={t('faqLead')}
					// `self-start` jest warunkiem działania: bez niego kolumna rozciąga
					// się na wysokość wiersza siatki, czyli całego akordeonu, i
					// przyklejenie nie ma gdzie się przesunąć. Odstęp od góry jak w
					// spisie treści polityki prywatności. NIE `top-navbar`: ten token
					// ma 4rem, a zadokowany pasek mierzy na desktopie 4,5rem (`pt-5`
					// plus karta `h-18`), więc nagłówek wjechałby pod jego kreskę.
					className='lg:sticky lg:top-28 lg:self-start'
				/>

				<Accordion
					defaultValue={[items[0]?.question]}
					{...anim('stagger', { items: '[data-slot="accordion-item"]' })}
				>
					{items.map(item => (
						<AccordionItem
							key={item.question}
							value={item.question}
						>
							<AccordionTrigger>{item.question}</AccordionTrigger>
							<AccordionContent>{item.answer}</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</Section>
	)
}
