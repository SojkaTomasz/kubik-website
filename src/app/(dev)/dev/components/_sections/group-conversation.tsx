import { Check, FileText, ImageIcon, Paperclip, X } from 'lucide-react'

import { Sample, Showcase, ShowcaseItem } from '@/app/(dev)/dev/_components/showcase'
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentGroup,
	AttachmentMedia,
	AttachmentTitle,
	AttachmentTrigger,
	attachmentVariants,
} from '@/components/ui/attachment'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
	Bubble,
	BubbleContent,
	BubbleGroup,
	BubbleReactions,
	bubbleVariants,
} from '@/components/ui/bubble'
import { Marker, MarkerContent, MarkerIcon, markerVariants } from '@/components/ui/marker'
import {
	Message,
	MessageAvatar,
	MessageContent,
	MessageFooter,
	MessageGroup,
	MessageHeader,
} from '@/components/ui/message'
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { variantKeys } from '@/lib/cva'

/*
 * Listy wariantów czytane z komponentów, nie przepisane tutaj — ta sama zasada
 * co w pozostałych grupach. Dlatego `bubbleVariants` i `attachmentVariants`
 * są eksportowane z plików rejestru (odnotowane w AGENTS.md).
 */
const bubbleTones = variantKeys(bubbleVariants, 'variant')
const markerTones = variantKeys(markerVariants, 'variant')
const attachmentSizes = variantKeys(attachmentVariants, 'size')
const attachmentOrientations = variantKeys(attachmentVariants, 'orientation')

/** Stany załącznika — z sygnatury propsa `state`, bez osi cva. */
const attachmentStates = ['idle', 'uploading', 'processing', 'error', 'done'] as const

/** Wystarczająco długa, żeby przewijanie miało co pokazać. */
const CONVERSATION = [
	'Cześć, mam pytanie o starter.',
	'Jasne, pytaj.',
	'Czy da się wyłączyć drugi język?',
	'Tak — jedna linia w site.config.ts.',
	'A co z hreflangami?',
	'Przestają się generować same.',
	'Świetnie, dzięki.',
	'Nie ma sprawy.',
]

export function GroupConversation() {
	return (
		<Showcase
			id='conversation'
			index='10'
			title='Rozmowa'
			description='Komponenty interfejsu konwersacyjnego: wiadomości z awatarem i nagłówkiem, dymki w kilku odcieniach, znaczniki oddzielające wątek oraz załączniki z własnymi stanami. Przydają się nie tylko w czacie z modelem — ten sam zestaw obsługuje komentarze, historię zgłoszeń i podgląd wysyłanych plików.'
		>
			<ShowcaseItem
				title='Wiadomość'
				note='Message + MessageGroup — align steruje stroną, na której staje wiadomość'
				className='flex-col items-stretch'
			>
				<MessageGroup className='flex w-full flex-col gap-4'>
					<Message align='start'>
						<MessageAvatar>
							<Avatar>
								<AvatarFallback>AK</AvatarFallback>
							</Avatar>
						</MessageAvatar>
						<Bubble variant='muted'>
							<MessageHeader>Anna Kowalska</MessageHeader>
							<BubbleContent>
								Czy da się podmienić paletę bez ruszania komponentów?
							</BubbleContent>
							<MessageFooter>10:24</MessageFooter>
						</Bubble>
					</Message>

					<Message align='end'>
						<Bubble>
							<BubbleContent>
								Tak — cała rampa siedzi w `app/theme/brand.css`. To jedyny plik do podmiany.
							</BubbleContent>
							<MessageFooter>10:25</MessageFooter>
						</Bubble>
					</Message>
				</MessageGroup>
			</ShowcaseItem>

			<ShowcaseItem
				title='Wiadomość złożona z MessageContent'
				note='kolumna treści — nagłówek i stopka stoją OBOK dymka, nie w środku'
				className='flex-col items-stretch'
			>
				{/*
				 * `MessageContent` to kolumna, nie ozdobnik. Trzyma nagłówek, dymek
				 * i stopkę jako rodzeństwo, a przy `align='end'` dosuwa je wszystkie
				 * do prawej krawędzi. Wersja bez niego (wyżej) wkłada nagłówek do
				 * środka dymka — działa, ale nie da się wtedy postawić pod jedną
				 * wiadomością dwóch dymków ani rozdzielić tła treści od podpisu.
				 */}
				<MessageGroup className='flex w-full flex-col gap-4'>
					<Message align='start'>
						<MessageAvatar>
							<Avatar>
								<AvatarFallback>AK</AvatarFallback>
							</Avatar>
						</MessageAvatar>
						<MessageContent>
							<MessageHeader>Anna Kowalska</MessageHeader>
							<Bubble variant='muted'>
								<BubbleContent>Wysyłam dwie wiadomości pod rząd.</BubbleContent>
							</Bubble>
							<Bubble variant='muted'>
								<BubbleContent>Druga staje pod pierwszą, bez nowego awatara.</BubbleContent>
							</Bubble>
							<MessageFooter>10:31</MessageFooter>
						</MessageContent>
					</Message>

					<Message align='end'>
						<MessageContent>
							<Bubble>
								<BubbleContent>Tak też można — kolumna dosuwa się do prawej.</BubbleContent>
							</Bubble>
							<MessageFooter>10:32</MessageFooter>
						</MessageContent>
					</Message>
				</MessageGroup>
			</ShowcaseItem>

			<ShowcaseItem
				title='Reakcje pod dymkiem'
				note='BubbleReactions — osie side i align ustawiają je względem dymka'
				className='flex-col items-stretch gap-6'
			>
				{/*
				 * Reakcje są pozycjonowane absolutnie względem dymka, więc dymek
				 * musi zostać `relative` — `Bubble` już taki jest. Odstęp w tej
				 * próbce jest większy, bo element wystaje poza obrys rodzica.
				 */}
				<Sample label="side='bottom' align='end' (domyślne)">
					<Bubble variant='muted'>
						<BubbleContent>Świetnie to wygląda.</BubbleContent>
						<BubbleReactions>
							<span>👍</span>
							<span>🎉</span>
						</BubbleReactions>
					</Bubble>
				</Sample>
				<Sample label="side='top' align='start'">
					<Bubble>
						<BubbleContent>Reakcja nad wiadomością.</BubbleContent>
						<BubbleReactions
							side='top'
							align='start'
						>
							<span>❤️</span>
						</BubbleReactions>
					</Bubble>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Odcienie dymka'
				note='wszystkie warianty Bubble, czytane z komponentu'
				className='flex-col items-stretch'
			>
				<BubbleGroup className='flex w-full flex-col gap-3'>
					{bubbleTones.map(tone => (
						<Sample
							key={tone}
							label={tone}
						>
							<Bubble variant={tone}>
								<BubbleContent>Przykładowa treść wiadomości.</BubbleContent>
							</Bubble>
						</Sample>
					))}
				</BubbleGroup>
			</ShowcaseItem>

			<ShowcaseItem
				title='Znaczniki'
				note='Marker — data, status dostarczenia, oddzielenie wątku'
				className='flex-col items-stretch gap-4'
			>
				{markerTones.map(tone => (
					<Sample
						key={tone}
						label={tone}
					>
						<Marker
							variant={tone}
							className='w-full'
						>
							<MarkerIcon>
								<Check />
							</MarkerIcon>
							<MarkerContent>Dzisiaj</MarkerContent>
						</Marker>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Załącznik'
				note='rozmiary i orientacja — obie osie czytane z komponentu'
			>
				{attachmentSizes.map(size => (
					<Sample
						key={size}
						label={`size="${size}"`}
					>
						<Attachment size={size}>
							<AttachmentMedia>
								<FileText />
							</AttachmentMedia>
							<AttachmentContent>
								<AttachmentTitle>umowa.pdf</AttachmentTitle>
								<AttachmentDescription>248 kB</AttachmentDescription>
							</AttachmentContent>
							<AttachmentActions>
								<AttachmentAction aria-label='Usuń załącznik'>
									<X />
								</AttachmentAction>
							</AttachmentActions>
						</Attachment>
					</Sample>
				))}

				{attachmentOrientations.map(orientation => (
					<Sample
						key={orientation}
						label={`orientation="${orientation}"`}
					>
						<Attachment orientation={orientation}>
							<AttachmentMedia>
								<ImageIcon />
							</AttachmentMedia>
							<AttachmentContent>
								<AttachmentTitle>okladka.jpg</AttachmentTitle>
								<AttachmentDescription>1,2 MB</AttachmentDescription>
							</AttachmentContent>
						</Attachment>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Stany załącznika'
				note='prop state — obramowanie i tło niosą informację o postępie wysyłki'
			>
				{attachmentStates.map(state => (
					<Sample
						key={state}
						label={state}
					>
						<Attachment
							state={state}
							size='sm'
						>
							<AttachmentMedia>
								<Paperclip />
							</AttachmentMedia>
							<AttachmentContent>
								<AttachmentTitle>raport.csv</AttachmentTitle>
								<AttachmentDescription>{state}</AttachmentDescription>
							</AttachmentContent>
						</Attachment>
					</Sample>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Przewijanie rozmowy'
				note='MessageScroller — trzyma widok przy najnowszej wiadomości i pokazuje przycisk powrotu po ręcznym przewinięciu w górę'
				className='flex-col items-stretch'
			>
				<MessageScrollerProvider>
					<MessageScroller className='h-64 w-full rounded-xl border'>
						<MessageScrollerViewport className='p-4'>
							<MessageScrollerContent className='flex flex-col gap-3'>
								{CONVERSATION.map((line, index) => (
									<MessageScrollerItem key={index}>
										<Message align={index % 2 === 0 ? 'start' : 'end'}>
											<Bubble variant={index % 2 === 0 ? 'muted' : 'default'}>
												<BubbleContent>{line}</BubbleContent>
											</Bubble>
										</Message>
									</MessageScrollerItem>
								))}
							</MessageScrollerContent>
						</MessageScrollerViewport>
						<MessageScrollerButton />
					</MessageScroller>
				</MessageScrollerProvider>
			</ShowcaseItem>

			<ShowcaseItem
				title='Załącznik jako całość klikalna'
				note='AttachmentTrigger — przezroczysty przycisk przykrywa kafelek, akcje zostają nad nim'
			>
				{/*
				 * Trigger jest warstwą `absolute inset-0`, więc klikalny jest cały
				 * kafelek, a nie sam tytuł. `AttachmentActions` ma wyższy stos, więc
				 * przycisk usuwania nadal łapie własne kliknięcia — bez tego jedyną
				 * alternatywą byłoby zagnieżdżenie przycisku w przycisku, czego HTML
				 * nie dopuszcza.
				 */}
				<Sample label='cały kafelek otwiera plik'>
					<Attachment>
						<AttachmentTrigger aria-label='Otwórz umowa.pdf' />
						<AttachmentMedia>
							<FileText />
						</AttachmentMedia>
						<AttachmentContent>
							<AttachmentTitle>umowa.pdf</AttachmentTitle>
							<AttachmentDescription>248 kB</AttachmentDescription>
						</AttachmentContent>
						<AttachmentActions>
							<AttachmentAction aria-label='Usuń załącznik'>
								<X />
							</AttachmentAction>
						</AttachmentActions>
					</Attachment>
				</Sample>
			</ShowcaseItem>

			<ShowcaseItem
				title='Grupa załączników'
				note='AttachmentGroup — zawijanie wielu plików pod wiadomością'
			>
				<AttachmentGroup>
					{['umowa.pdf', 'zalacznik-1.png', 'notatki.txt'].map(name => (
						<Attachment
							key={name}
							size='xs'
						>
							<AttachmentMedia>
								<Paperclip />
							</AttachmentMedia>
							<AttachmentContent>
								<AttachmentTitle>{name}</AttachmentTitle>
							</AttachmentContent>
						</Attachment>
					))}
				</AttachmentGroup>
			</ShowcaseItem>
		</Showcase>
	)
}
