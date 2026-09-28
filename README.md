# Starter stron WWW

Podstawa pod nowe strony: Next.js 16, shadcn/ui, SEO, Consent Mode v2, dwa języki i komplet testów.
Nie jest to szkielet do rozbudowy „kiedyś" — wszystko poniżej jest zrobione i pokryte testami, więc
nowy projekt zaczyna się od pisania treści, a nie od konfiguracji.

```bash
pnpm install
pnpm dev
```

Strona stoi pod [localhost:3000](http://localhost:3000), strony deweloperskie pod
[/dev](http://localhost:3000/dev).

## Co jest w środku

| Warstwa        | Realizacja                                                                            |
| -------------- | ------------------------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack), React 19, TypeScript                              |
| Komponenty     | shadcn/ui na Base UI — **cały rejestr**, 60+ komponentów, plus własne kompozyty       |
| Style          | Tailwind v4 (CSS-first), tokeny marki w jednym pliku                                  |
| Języki         | next-intl, `[locale]` w trasie, adresy bez prefiksu dla języka domyślnego             |
| SEO            | canonical, hreflang, Open Graph (własny obraz na wpis), sitemap, robots, RSS, JSON-LD |
| Analityka      | GTM z Google Consent Mode v2 — domyślna odmowa przed startem kontenera                |
| Zgody          | baner, dialog kategorii, wycofanie zgody ze stopki                                    |
| Treść          | MDX z walidacją frontmattera przy budowaniu                                           |
| Formularze     | react-hook-form + zod, akcja serwerowa, Resend, ochrona przed automatami              |
| Obrazy         | `next/image` w kompozycie z proporcjami, `sizes` i rozmytym podglądem                 |
| Animacje       | motion, z zabezpieczeniem na ograniczony ruch i brak JavaScriptu                      |
| Dostępność     | WCAG 2.2 AA: warstwa dla czytników ekranu, `aria-current`, podsumowania błędów        |
| Bezpieczeństwo | CSP, COOP, frame-ancestors, Referrer-Policy, Permissions-Policy, HSTS                 |
| Testy          | Vitest + Testing Library, Playwright, audyt axe, pomiar kontrastu, czytnik ekranu     |

## Bramka jakości

```bash
pnpm check       # typy, lint, format, testy jednostkowe, build
pnpm test:e2e    # testy end-to-end na buildzie produkcyjnym
pnpm check:all   # jedno i drugie
```

To jest sedno tego startera: po aktualizacji zależności uruchamiasz `pnpm check:all` i **wiesz**,
czy coś się zepsuło. Testy celowo pilnują rzeczy, które łamią się cicho — bez błędu kompilacji i bez
wpisu w konsoli:

- kontrast każdej pary tokenów kolorystycznych, w obu motywach, mierzony w przeglądarce
- domyślna odmowa zgód docierająca do `dataLayer` **przed** startem kontenera GTM
- każdy adres z sitemapy odpowiadający statusem 200
- treść widoczna przy ograniczonym ruchu i przy wyłączonym JavaScripcie
- listy wariantów na stronach `/dev` zgodne z komponentami

## Nowy projekt — co podmienić

Trzy pliki i strona przestaje być starterem:

1. **`src/site.config.ts`** — nazwa, opis, adres produkcyjny, języki
2. **`src/company.config.ts`** — dane firmy trafiające do JSON-LD
3. **`src/app/theme/brand.css`** — rampa kolorów marki

Potem `.env.local` na wzór `.env.example` i skasowanie przykładowych wpisów z `content/blog/`.

Po zmianie palety uruchom `pnpm test:e2e` — kontrast weryfikuje wyłącznie prawdziwa przeglądarka.

### Strona jednojęzyczna

Jedna linia w `src/site.config.ts`:

```ts
export const locales: readonly Locale[] = ['pl']
```

Adresy tracą prefiks, przełącznik języka znika, `hreflang` przestaje się generować. Szczegóły w
[AGENTS.md](./AGENTS.md).

## Strony deweloperskie

`/dev/styleguide` pokazuje fundamenty (kolory, typografia, odstępy, stany), `/dev/components` —
każdy komponent w każdym wariancie. Listy wariantów są **czytane z komponentów**, więc dopisanie
wariantu pokazuje go tam samo.

W produkcji strony te są dostępne wyłącznie za flagą `NEXT_PUBLIC_ENABLE_DEV_PAGES`.

## Struktura

```
content/blog/<język>/     wpisy MDX
messages/                 tłumaczenia (pl.json, en.json)
src/
  app/
    (site)/[locale]/      strony publiczne
    (dev)/dev/            styleguide i przegląd komponentów
    theme/                tokeny: marka, typografia, komponenty, animacje
  components/
    ui/                   shadcn + nasze kompozyty — JEDYNE źródło widoków
    motion/               animacje wejścia
    layout/               szkielet dokumentu, nagłówek, stopka
    cookie/               warstwa zgód
    forms/                formularze
  lib/                    seo, analytics, content, validation, actions
  i18n/                   routing i nawigacja świadoma języka
e2e/                      testy end-to-end
```

## Skille agentów

W `.claude/skills/` leżą skille zainstalowane z [skills.sh](https://www.skills.sh) — dobrane pod ten
stos (React/Next.js, Playwright, testowanie aplikacji webowych, projektowanie interfejsu).
`skills-lock.json` zapisuje źródła i sumy kontrolne.

```bash
npx skills list                          # co jest zainstalowane
npx skills update                        # aktualizacja
npx skills add <owner/repo> --skill <s>  # dołożenie kolejnego
```

To cudze pliki — wyłączone z lintowania i formatowania. **Zasady projektu z [AGENTS.md](./AGENTS.md)
mają pierwszeństwo** przed poradami ze skilli, gdy się rozjeżdżają.

## Konwencje i pułapki

Wszystko, co trzeba wiedzieć przed pierwszą zmianą w kodzie — łącznie z listą zmodyfikowanych plików
rejestru shadcn i opisem trzech usterek, które łamią się cicho — jest w
**[AGENTS.md](./AGENTS.md)**. Ten plik czytają też agenci pracujący nad projektem.

## Wdrożenie

Vercel: podłącz repozytorium i ustaw zmienne środowiskowe z `.env.example`. Build to `pnpm build`,
nic poza tym nie wymaga konfiguracji.

CI (`.github/workflows/ci.yml`) uruchamia bramkę jakości i testy end-to-end — także w trybie
deweloperskim, bo część błędów widać wyłącznie tam.
# kubik-website
# kubik-website
