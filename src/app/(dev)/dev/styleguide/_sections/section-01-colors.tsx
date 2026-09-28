import { Sample, Showcase, ShowcaseItem, Swatch } from '@/app/(dev)/dev/_components/showcase'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

/**
 * Rampa marki. Klasa i token są tu sparowane, bo to jedyna para, której nie da
 * się wyprowadzić automatycznie — Tailwind generuje klasy na etapie budowania,
 * więc nie można ich odczytać z DOM-u tak jak wartości zmiennych.
 */
const brandRamp = [
	['--brand-50', 'bg-brand-50'],
	['--brand-100', 'bg-brand-100'],
	['--brand-200', 'bg-brand-200'],
	['--brand-300', 'bg-brand-300'],
	['--brand-400', 'bg-brand-400'],
	['--brand-500', 'bg-brand-500'],
	['--brand-600', 'bg-brand-600'],
	['--brand-700', 'bg-brand-700'],
	['--brand-800', 'bg-brand-800'],
	['--brand-900', 'bg-brand-900'],
	['--brand-950', 'bg-brand-950'],
] as const

const semanticRoles = [
	['--background', 'bg-background', 'Tło strony'],
	['--foreground', 'bg-foreground', 'Tekst podstawowy'],
	['--card', 'bg-card', 'Tło karty'],
	['--popover', 'bg-popover', 'Tło warstwy nakładanej'],
	['--primary', 'bg-primary', 'Akcja główna'],
	['--secondary', 'bg-secondary', 'Akcja drugorzędna'],
	['--muted', 'bg-muted', 'Tło wyciszone'],
	['--accent', 'bg-accent', 'Podświetlenie'],
	['--border', 'bg-border', 'Obramowania'],
	['--input', 'bg-input', 'Obramowanie pól'],
	['--ring', 'bg-ring', 'Pierścień fokusa'],
	['--destructive', 'bg-destructive', 'Akcja niszcząca'],
] as const

/*
 * Klasy wypisane w całości, nie sklejane z fragmentów.
 *
 * Tailwind skanuje pliki źródłowe jako zwykły tekst — `bg-${key}` nigdy nie
 * trafi do wynikowego CSS-a, bo skaner nie wykonuje kodu. To najczęstsza
 * przyczyna „ta klasa działa lokalnie, ale nie na produkcji".
 */
const statusColors = [
	{
		label: 'Sukces',
		solid: 'bg-success',
		solidText: 'text-success-foreground',
		soft: 'bg-success-soft',
		softText: 'text-success-soft-foreground',
	},
	{
		label: 'Ostrzeżenie',
		solid: 'bg-warning',
		solidText: 'text-warning-foreground',
		soft: 'bg-warning-soft',
		softText: 'text-warning-soft-foreground',
	},
	{
		label: 'Informacja',
		solid: 'bg-info',
		solidText: 'text-info-foreground',
		soft: 'bg-info-soft',
		softText: 'text-info-soft-foreground',
	},
	{
		label: 'Błąd',
		solid: 'bg-destructive',
		solidText: 'text-white',
		soft: 'bg-destructive/10',
		softText: 'text-destructive',
	},
] as const

export function SectionColors() {
	return (
		<Showcase
			id='colors'
			index='01'
			title='Kolory'
			description='Rampa marki jest jedynym miejscem, które podmieniasz przy brandingu — role semantyczne poniżej są z niej wyliczone. W motywie ciemnym rampa jest odwrócona, więc te same tokeny dają poprawny kontrast w obu motywach.'
		>
			<ShowcaseItem
				title='Rampa marki'
				note='src/app/theme/brand.css'
			>
				{brandRamp.map(([token, className]) => (
					<Swatch
						key={token}
						token={token}
						className={className}
					/>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Role semantyczne'
				note='wyprowadzone z rampy w globals.css'
			>
				{semanticRoles.map(([token, className, label]) => (
					<Swatch
						key={token}
						token={token}
						className={className}
						label={label}
					/>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Kolory statusowe'
				note='każdy ma czwórkę: pełny, foreground, soft, soft-foreground'
			>
				{statusColors.map(status => (
					<div
						key={status.label}
						className='flex w-full flex-col gap-2 sm:w-56'
					>
						<Typography variant='caption'>{status.label}</Typography>
						<div
							className={cn(
								'flex h-12 items-center justify-center rounded-lg',
								status.solid
							)}
						>
							<span className={cn('text-sm font-medium', status.solidText)}>
								tekst na tle
							</span>
						</div>
						<div
							className={cn('flex h-12 items-center justify-center rounded-lg', status.soft)}
						>
							<span className={cn('text-sm font-medium', status.softText)}>
								wariant soft
							</span>
						</div>
					</div>
				))}
			</ShowcaseItem>

			<ShowcaseItem
				title='Kontrast tekstu'
				note='sprawdź obie wartości motywu — czytelność musi się zgadzać w każdym'
				className='flex-col items-stretch gap-4'
			>
				<Sample label='foreground na background'>
					<div className='w-full rounded-lg border bg-background p-4 text-foreground'>
						Zażółć gęślą jaźń — 0123456789
					</div>
				</Sample>
				<Sample label='muted-foreground na background'>
					<div className='w-full rounded-lg border bg-background p-4 text-muted-foreground'>
						Zażółć gęślą jaźń — 0123456789
					</div>
				</Sample>
				<Sample label='primary-foreground na primary'>
					<div className='w-full rounded-lg bg-primary p-4 text-primary-foreground'>
						Zażółć gęślą jaźń — 0123456789
					</div>
				</Sample>
			</ShowcaseItem>
		</Showcase>
	)
}
