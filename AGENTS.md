<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your
training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's
directory; in monorepos the `next` package may not be visible from the repo root) before writing any
code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at
`node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates
the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Zasady projektu

Blok powyżej jest generowany przez `next dev` — nie edytuj go. Wszystko poniżej jest nasze.

## Bramka jakości

```
pnpm check       typy, lint, format, testy jednostkowe, build
pnpm test:e2e    testy end-to-end na buildzie produkcyjnym
pnpm check:all   jedno i drugie
```

**Zadanie jest skończone dopiero, gdy `pnpm check` przechodzi.** Przy zmianach dotyczących kolorów,
dostępności, routingu lub warstwy zgód uruchom również `pnpm test:e2e` — te rzeczy weryfikuje
wyłącznie prawdziwa przeglądarka.

Przebieg deweloperski (`E2E_DEV=1 pnpm test:e2e`) chodzi na **dwóch** workerach zamiast domyślnej
połowy rdzeni. To nie jest ostrożność, tylko wymóg: `next dev` kompiluje trasy na żądanie, a
dziesięć równoległych przeglądarek zasypuje go żądaniami do tras jeszcze niezbudowanych. Serwer
odpowiada wtedy 500 albo przekracza limit czasu, a wywrotki wyglądają na losowe i wędrują między
testami — zwykle trafiając te, które sięgają po trasy kompilowane osobno (`/apple-icon`,
`/sitemap.xml`, strony miast). Zmierzone: przy domyślnej liczbie workerów 2 z 4 przebiegów padały,
przy dwóch — 3 z 3 czysto. Objaw jest łatwy do pomylenia z usterką aplikacji.

## Commity

Format [Conventional Commits](https://www.conventionalcommits.org): `typ: opis` lub
`typ(zakres): opis`, gdzie typ to jeden z `feat`, `fix`, `chore`, `docs`, `refactor`, `test`,
`style`, `perf`, `build`, `ci`. Pierwsza linia ma **maksymalnie 150 znaków**. Pilnuje tego
commitlint w hooku `commit-msg` (`commitlint.config.mjs`) — niezgodny commit zostanie odrzucony.

```
fix(formularz): walidacja numeru telefonu przyjmuje spacje
```

## Widoki buduje się wyłącznie z `components/ui`

Żadnego doraźnego markupu zastępującego istniejący komponent. Brakuje czegoś? Dochodzi nowy
komponent do `components/ui`, nie obejście w widoku. Regułę egzekwuje ESLint: import z `radix-ui`,
`@base-ui/react` i `next/image` poza `components/ui` jest błędem.

Importy wskazują konkretny plik, nie zbiorczy indeks:

```ts
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
```

`components/ui` to powierzchnia rejestru shadcn — trzymamy tam wyłącznie to, co ma sens porównywać z
rejestrem i odtwarzać po `shadcn add`. Warstwy o innej odpowiedzialności mają własne katalogi i
**nie** zaśmiecają tamtego:

| Katalog               | Zawartość                                                                |
| --------------------- | ------------------------------------------------------------------------ |
| `components/ui`       | rejestr shadcn i nasze kompozyty na tych samych zasadach                 |
| `components/motion`   | animacje — opakowują dowolną treść, nie mają wariantów                   |
| `components/layout`   | szkielet dokumentu, nagłówek, stopka                                     |
| `components/cookie`   | warstwa zgód                                                             |
| `components/legal`    | dokumenty prawne pokazywane w kilku miejscach naraz                      |
| `components/forms`    | formularze                                                               |
| `components/sections` | sekcje stron Kubika złożone z `components/ui` — hero, dowód, FAQ, wycena |
| `components/projects` | karta, siatka i galeria realizacji                                       |
| `components/quote`    | warstwa wyceny — przyklejony pasek na telefonie i okienko                |

## Warianty komponentów

Listy wariantów na stronach `/dev` są czytane z komponentów przez `variantKeys`, nigdy przepisywane
ręcznie. Dopisany wariant pojawia się tam sam.

Dwa niezmienniki pilnowane testami — oba łamią się CICHO, bez błędu kompilacji i bez wpisu w
konsoli:

1. Komponenty importują `cva` z `@/lib/cva`, nie z pakietu. Po `shadcn add` przywróć to poleceniem
   `pnpm ui:sync`.
2. Definicja wariantów czytana przez komponent serwerowy nie może leżeć w module z `'use client'` —
   eksporty takiego modułu docierają na serwer jako puste referencje. Wzorzec rozwiązania:
   `components/ui/button.variants.ts`.

## Zmodyfikowane pliki rejestru shadcn

`pnpm dlx shadcn@latest add <nazwa> --overwrite` **skasuje** poniższe zmiany. Po aktualizacji
rejestru nanieś je ponownie — testy powiedzą, których brakuje.

| Plik                                                                                                                                                                                                                                                   | Zmiana                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button.tsx`                                                                                                                                                                                                                                           | `href` (link świadomy języka / kotwica / link zewnętrzny), `icon` + `iconPosition` + `iconEffect`, `isLoading`, rozmiary `xl`, `icon-xl` i `none`, oś `radius`, zapowiedź nowej karty (`announceNewTab`); warianty Kubika `call` i `dark` w `button.variants.ts` |
| `button.variants.ts`                                                                                                                                                                                                                                   | plik dodany — definicja wariantów poza granicą klienta                                                                                                                                                                                                           |
| `card.tsx`                                                                                                                                                                                                                                             | oś `variant`: `modal`, `accent`, `interactive`, `flat`, `framed`; rozmiar `lg`; stopka bez tła i linii                                                                                                                                                           |
| `badge.tsx`                                                                                                                                                                                                                                            | warianty statusowe i licznikowe, tagi `label`, `pipe`, `photo`, oś `rounded`                                                                                                                                                                                     |
| `alert.tsx`                                                                                                                                                                                                                                            | warianty `success`, `warning`, `info`                                                                                                                                                                                                                            |
| `slider.tsx`                                                                                                                                                                                                                                           | przekazanie nazwy dostępnej do ukrytego `<input>`                                                                                                                                                                                                                |
| `combobox.tsx`                                                                                                                                                                                                                                         | propsy `triggerLabel` i `removeLabel` — ikonowy przycisk rozwijania oraz krzyżyk usuwania żetonu nie miały nazwy dostępnej (axe: `button-name`); wygląd pola i listy z `field-control.variants.ts`                                                               |
| `command.tsx`                                                                                                                                                                                                                                          | `role='presentation'` na separatorze — `role='separator'` w liście `listbox` to axe `aria-required-children`                                                                                                                                                     |
| `accordion.tsx`                                                                                                                                                                                                                                        | `hiddenUntilFound` domyślnie na panelu — bez tego zwinięta treść FAQ znika ze źródła HTML; wygląd FAQ Kubika (linie, plus / minus)                                                                                                                               |
| `sidebar.tsx`                                                                                                                                                                                                                                          | `SidebarMenuSkeleton` liczy szerokość z `useId()`, nie z `Math.random()` — losowanie rozjeżdżało serwer z klientem i psuło hydrację                                                                                                                              |
| `spinner.tsx`                                                                                                                                                                                                                                          | dekoracyjny domyślnie (`aria-hidden`), nazwa dostępna przez prop `label` — rejestr wpisywał `role='status' aria-label='Loading'` na stałe                                                                                                                        |
| `dialog.tsx`, `sheet.tsx`, `toast.tsx`, `carousel.tsx`, `breadcrumb.tsx`, `pagination.tsx`, `message-scroller.tsx`, `sidebar.tsx`                                                                                                                      | napisy czytane WYŁĄCZNIE przez czytnik ekranu idą przez `messages/*.json` — patrz sekcja „Czytniki ekranu"                                                                                                                                                       |
| `bubble.tsx`, `attachment.tsx`                                                                                                                                                                                                                         | eksport `bubbleVariants` / `attachmentVariants` — strony `/dev` czytają z nich listy wariantów                                                                                                                                                                   |
| `scroll-area.tsx`                                                                                                                                                                                                                                      | `tabIndex={0}` na obszarze przewijania — osiągalność z klawiatury                                                                                                                                                                                                |
| `typography.tsx`                                                                                                                                                                                                                                       | prop `dateTime` — bez niego `as='time'` nie przyjmowało atrybutu daty; skala ze styleguide'u Kubika, wariant `meta`, odcień `cold`                                                                                                                               |
| `container.tsx`, `section.tsx`, `typography.tsx`, `prose.tsx`, `image.tsx`, `iframe.tsx`, `stat.tsx`, `carousel-dots.tsx`, `rating.tsx`, `steps.tsx`, `spec-list.tsx`, `section-heading.tsx`, `page-hero.tsx`, `cta-band.tsx`, `carousel-progress.tsx` | pliki dodane — nasze kompozyty                                                                                                                                                                                                                                   |
| `separator.tsx`, `separator.variants.ts`                                                                                                                                                                                                               | oś `variant` z kreską rury (`pipe`); definicja poza granicą klienta                                                                                                                                                                                              |
| `field-control.variants.ts`                                                                                                                                                                                                                            | plik dodany — wspólny wygląd KAŻDEJ kontrolki formularza, patrz sekcja „Pola formularzy"                                                                                                                                                                         |
| `input.tsx`, `textarea.tsx`, `input-group.tsx`, `select.tsx`, `native-select.tsx`, `input-otp.tsx`                                                                                                                                                     | wygląd z `field-control.variants.ts`; `input.tsx` dostał oś `appearance`                                                                                                                                                                                         |
| `label.tsx`, `field.tsx`, `switch.tsx`, `toggle.tsx`, `item.tsx`, `progress.tsx`, `navigation-menu.tsx`, `dialog.tsx`                                                                                                                                  | wygląd Kubika — opis w nagłówku każdego pliku; `toggle.tsx` wariant `chip`, `item.tsx` warianty `line` / `rail` i rozmiar `flush`                                                                                                                                |
| `marquee.tsx`                                                                                                                                                                                                                                          | z rejestru Magic UI (`https://magicui.design/r/marquee.json`): tylko poziomo, `data-slot`, kopie treści z `aria-hidden`                                                                                                                                          |
| 21 plików z elementem klikalnym                                                                                                                                                                                                                        | klasa `cursor-pointer` — patrz sekcja niżej                                                                                                                                                                                                                      |

Wszystkie mają w nagłówku ostrzeżenie `⚠️ PLIK ZMODYFIKOWANY` — poza ostatnim wierszem, który jest
zmianą przekrojową i pilnuje go test.

### `cursor-pointer` wpisujemy jawnie w komponent

Tailwind 4 zdjął przyciskom `cursor: pointer` — preflight ustawia im `cursor: default`. **Każdy
element z realnym kliknięciem w `components/ui` ma `cursor-pointer` wpisany wprost w swoje klasy** i
to jest źródło prawdy. Dokładając komponent z czymkolwiek klikalnym, dopisz tę klasę i pozycję w
`cursor-pointer.test.ts`.

Pozycje menu przychodzą z rejestru z jawnym `cursor-default` (wzorzec menu desktopowego) — świadomie
zamieniamy je na `cursor-pointer`. To dlatego mechanizm w ogóle potrzebuje strażnika:
`shadcn add --overwrite` przywraca `cursor-default` przy każdej aktualizacji rejestru.

Reguła w `globals.css` została jako **siatka bezpieczeństwa**, nie jako główny mechanizm. Łapie to,
do czego nie ma gdzie dopiąć klasy: gołe re-eksporty Base UI (`CollapsibleTrigger`,
`PopoverTrigger`, `DialogTrigger`), które renderują `<button>` bez naszego `className`, oraz
przyciski pisane wprost w widokach. Siedzi w `@layer base`, a zbudowany arkusz układa warstwy w
kolejności `properties → theme → base → components → utilities` — więc każda klasa Tailwinda bije tę
regułę niezależnie od specyficzności. Dzięki temu szyna paska bocznego zostaje przy swoim
`cursor-w-resize`, choć jest zwykłym `<button>`.

Brak tej klasy łamie się **całkowicie cicho**: nie ma błędu kompilacji, lint milczy, a testy
zachowania przechodzą, bo kliknięcie działa. Widać to wyłącznie kursorem nad elementem — stąd
`components/ui/cursor-pointer.test.ts`.

## Pola formularzy mają JEDEN wygląd

Input, Textarea, InputGroup, Select, NativeSelect, Combobox i InputOTP biorą powierzchnię z
`components/ui/field-control.variants.ts` — tło, dolną kreskę 2 px, kolor fokusu i błędu, wysokość.
Pole tekstowe i lista wyboru stojące obok siebie wyglądają identycznie i zmieniają się razem. **Nowa
kontrolka formularza też bierze wygląd stamtąd**, zamiast przepisywać klasy z `input.tsx`.

Tło pola zależy od miejsca: na tle strony ma kolor karty, wewnątrz `Card` i okna — kolor tła strony.
Bez tego pole na karcie znika i zostaje sama kreska.

## Komponenty z innych rejestrów

Magic UI dokłada się tym samym poleceniem co shadcn:
`pnpm dlx shadcn@latest add "https://magicui.design/r/<nazwa>.json"`. Komponent ląduje w
`components/ui` i podlega tym samym zasadom: `cva` z `@/lib/cva`, próbka na `/dev`, wpis w tabeli
zmodyfikowanych plików. Animacja przewijana w nieskończoność MUSI się zatrzymywać przy ograniczonym
ruchu — reguła w `app/theme/motion.css` (WCAG 2.2.2).

## Obrazy

Widoki nie importują `next/image` — pilnuje tego ESLint, tak samo jak przy prymitywach Base UI.
Obraz wstawia się przez `Image` z `components/ui/image`, który niesie proporcje, zaokrąglenie z
tokenu `--image-radius` i props `sizes`.

O trybie decyduje oś `ratio`, bo `fill` i `width`/`height` wykluczają się w Next.js — podanie obu
kończy się błędem w czasie wykonania, nie przy kompilacji:

| `ratio`   | Zachowanie                                                                             |
| --------- | -------------------------------------------------------------------------------------- |
| `auto`    | obraz zachowuje własne proporcje; potrzebuje `width`/`height` albo importu statycznego |
| pozostałe | ramka narzuca kształt, obraz dostaje `fill` i wypełnia ją według osi `fit`             |

**Importuj obrazy statycznie**, gdy leżą w repozytorium (`import zdjecie from '@/assets/…'`). Next
odczytuje wtedy wymiary sam i potrafi wygenerować rozmyty podgląd na czas ładowania
(`placeholder='blur'`). Przy adresie w postaci tekstu jedno i drugie trzeba podać ręcznie.

`sizes` domyślnie obejmuje całą szerokość okna. To wartość bezpieczna, ale rozrzutna — obraz w
kolumnie na jedną trzecią ekranu powinien dostać własną, np. `(min-width: 768px) 33vw, 100vw`.

## Wydajność

Część ustaleń jest przeniesiona z bliźniaczego projektu (biletNet, wrzesień 2026), gdzie każde z
nich zostało zmierzone medianą z trzech przebiegów Lighthouse'a na buildzie produkcyjnym — tamte
liczby traktuj jako kierunek. Dwa ostatnie punkty (`Nic nie pojawia się po hydracji`,
`Kroje zastępcze`) zmierzono JUŻ TUTAJ, na tym starterze.

**Reguła nadrzędna całej tej sekcji: nic widocznego nie ma prawa pojawić się dopiero po hydracji.**
Element dorysowany po starcie Reacta wnosi do LCP całe opóźnienie hydracji, a jeśli przy okazji
przesuwa cokolwiek pod sobą — dokłada do CLS. Obie usterki opisane niżej sprowadzały się do tego
samego, choć wyglądały zupełnie inaczej.

### Nic nie pojawia się po hydracji — na przykładzie banera zgód

Wdrożony starter dostał 82 punkty wydajności zamiast spodziewanych ~100. Rozbicie wyniku wskazało
winnego jednoznacznie: **LCP zabierało 14 z 25 punktów**, a elementem LCP był akapit banera cookie z
opóźnieniem renderowania 2380 ms przy TTFB 0 ms.

Baner był wtedy renderowany warunkowo — widoczność zależała od odczytu localStorage, czyli od
czegoś, co istnieje dopiero po hydracji. Na krótkiej stronie to on jest największym elementem
kontentowym w pierwszym ekranie, więc to ON wyznaczał LCP. Do tego rezerwację miejsca pod baner
dopisywał `ResizeObserver` (`padding-bottom` na `<body>`), czyli zmiana układu po hydracji — CLS
0,064 z przesuwaną stopką.

Odtworzone lokalnie na buildzie produkcyjnym przy dławieniu 4× CPU i 1,6 Mb/s, mediana z 3
przebiegów:

| Metryka | Przed       | Po                  |
| ------- | ----------- | ------------------- |
| FCP     | 1084 ms     | 1180 ms             |
| LCP     | **3416 ms** | **1180 ms** (= FCP) |
| CLS     | **0,0664**  | **0,0000**          |

Rozwiązanie ma dwie części i żadna nie działa bez drugiej:

1. **Baner jest w HTML-u z serwera ZAWSZE** — także dla osoby, która zgodę wyraziła dawno temu.
2. **O widoczności decyduje CSS, nie React.** Klasa `consent-pending` siedzi na `<html>` od razu i
   zdejmuje ją skrypt startowy z `<head>`, gdy znajdzie w localStorage ważną zgodę — czyli przed
   pierwszym malowaniem, więc powracający użytkownik nie widzi nawet mignięcia. Kierunek jest ten
   sam co przy `no-js` i z tego samego powodu: awaria skryptu ma zostawić pytanie o zgodę widoczne,
   nigdy ukryte. Reguły siedzą w `app/theme/consent.css`.

Trzecia część rozwiązania odpadła razem ze zmianą banera w modal blokujący — opis niżej.

Warunki ważności zgody są POWTÓRZONE w skrypcie startowym, bo ten nie ma jak zaimportować modułu.
Rozjazd między kopiami łamie się cicho — pilnuje go tabela przypadków w
`lib/analytics/consent.test.ts`, sprawdzająca, że skrypt i `readStoredConsent` wydają ten sam
werdykt.

Ten sam schemat stosuj do KAŻDEGO elementu zależnego od localStorage, ciasteczka czy `window`: klasa
na `<html>` zdejmowana przed malowaniem plus reguła CSS, nigdy warunek renderowania.

### Baner zgód jest modalem blokującym

Pasek na dole strony dało się zignorować i większość osób tak robiła, więc zgód marketingowych
praktycznie nie było. Baner jest teraz `fixed` na całe okno: przyciemnia stronę, wyśrodkowuje kartę
i wstrzymuje serwis do czasu decyzji. Cztery rzeczy, które z tego wynikają:

1. **Nie ma przycisku odrzucenia w pierwszym kroku.** Są dwa wyjścia: „Ustawienia" i „Akceptuję", a
   odmowa polega na wejściu w ustawienia i zapisaniu wyłączonych przełączników. To decyzja
   właściciela strony, nie przeoczenie — i jest z nią ryzyko prawne: wytyczne EROD oraz stanowisko
   UODO mówią, że odmowa ma być tak samo łatwa jak zgoda. Powód i sposób przywrócenia równorzędnej
   odmowy opisuje nagłówek `components/cookie/cookie-banner.tsx`.
2. **Blokada przewijania siedzi w CSS-ie**
   (`html.consent-pending:not(.no-js) { overflow: hidden }`), a nie w efekcie dopisującym styl do
   `<body>`. Ten sam powód co przy widoczności: styl założony po hydracji to zmiana układu po
   hydracji. `:not(.no-js)` jest konieczne — bez JavaScriptu baner się nie renderuje, więc blokada
   nie miałaby czym zniknąć.
3. **Kontener banera NIE MOŻE dostać klasy `display` z Tailwinda.** Reguły `display: none` chowające
   baner siedzą w warstwie `base`, a każda utility bije całą tę warstwę niezależnie od
   specyficzności — to ta sama mechanika, co przy `cursor-pointer`. Postawione tam `flex` sprawiło,
   że baner nie znikał ani po decyzji, ani u powracającego użytkownika, i wywróciło połowę pakietu
   e2e. Wyśrodkowanie robi osobny element w środku.
4. **Pułapka fokusa jest napisana ręcznie**, a nie wzięta z `Dialog` Base UI. Dialog Base UI
   renderuje się przez portal dopiero na kliencie, czyli dokładnie tak, jak baner renderował się
   przed poprawką LCP.
5. **Polityka prywatności otwiera się w banerze jako OKNO, nie jako przejście na stronę.** Baner
   blokuje serwis, więc `/polityka-prywatnosci` pokazałaby dokument pod tym samym banerem — jeden
   zablokowany widok zamieniony na drugi. Poza banerem odnośnik zostaje odnośnikiem, bo dokument ma
   mieć własny adres do zalinkowania i zaindeksowania.

**Warstwy zgód nakładają się, nie podmieniają.** Baner zostaje pod spodem przez cały czas otwartych
ustawień i otwartej polityki — `hidden` reaguje wyłącznie na podjętą decyzję. Chowanie banera na
czas okna zabierało razem z nim jego zasłonę: tło przeskakiwało w połowie ścieżki, użytkownik na
moment widział stronę, którą modal miał zasłaniać, a po zamknięciu okna zasłona wracała. Ta sama
zasada obowiązuje przy każdej kolejnej warstwie dokładanej do tej ścieżki — nowe okno kładzie się na
poprzednim, nigdy go nie gasi. Ubocznie znika cała klasa błędów „wróciłem z okna i stan się nie
odtworzył": stan, który nigdy nie przestał istnieć, nie ma czego odtwarzać.

Konsekwencja dla testów: gdy okno jest otwarte, Base UI zakłada `inert` na resztę dokumentu, więc
baner **wypada z drzewa dostępności** — poprawnie, bo leży pod modalem. `getByRole` go wtedy nie
znajdzie; do sprawdzenia, że nadal go widać, służy selektor `[data-slot='cookie-banner']`.

Treść polityki ma **jedno** źródło: `components/legal/privacy-policy.tsx`. Strona
(`/polityka-prywatnosci`) i okno z banera (`privacy-policy-dialog.tsx`) renderują ten sam komponent,
różnią się wyłącznie oprawą — strona dokłada metadane, dane strukturalne i szerokość kolumny, okno
dokłada limit wysokości i przewijanie. Dwie kopie tej treści rozjechałyby się przy pierwszej
poprawce, a rozjazd w dokumencie, na podstawie którego użytkownik wyraża zgodę, jest usterką prawną,
nie kosmetyczną — pilnuje tego test porównujący obie listy w `e2e/consent.spec.ts`.

Testy e2e zaziarniają zapisaną zgodę DOMYŚLNIE — fixture `consentSeeded` w `e2e/fixtures.ts`. Bez
tego modal przykrywa stronę i żaden test niczego by nie kliknął. Plik lub blok `describe`, który
ogląda sam baner, wyłącza to u siebie przez `test.use({ consentSeeded: false })`.

### Kroje zastępcze dopasowane metrycznie

Po naprawie banera CLS spadł do zera nie zawsze, tylko w części przebiegów — resztę (0,0205) wnosiła
podmiana kroju. Wszystkie `@font-face` mają `font-display: swap`, więc pierwsza klatka renderuje się
krojem systemowym, a po pobraniu pliku tekst przerysowuje się właściwym. Różnica szerokości znaków
przesuwa wtedy układ. Potwierdzone wprost: zablokowanie plików `.woff2` dawało w tych samych
warunkach CLS 0,0000.

Każdy krój ma teraz odpowiednik `… Fallback` — krój systemowy z WYMUSZONYMI metrykami tego
właściwego (`size-adjust` plus trójka `*-override`). Tekst zajmuje przed podmianą dokładnie tyle
samo miejsca co po niej, więc nie ma czego przesuwać.

Dwie rzeczy do zapamiętania:

- **Pozycja w stosie decyduje o wszystkim.** `… Fallback` musi stać ZARAZ za krojem właściwym, przed
  `ui-sans-serif` i resztą rodzin systemowych. Za nimi mechanizm nie robi nic, a wygląda
  identycznie.
- **Przy podmianie kroju marki przelicz liczby.** Nie są zgadnięte — liczy je wzór z
  `next/dist/server/font-utils.js` na metrykach z `next/dist/server/capsize-font-metrics.json`,
  czyli tak samo jak `next/font`. Gotowe polecenie jest w nagłówku `app/theme/fonts.css`.

Całości pilnuje `app/theme/fonts.test.ts` — usterka jest niewidoczna dla oka, lintu i testów
zachowania, bo tekst jest na miejscu, tylko przeskakuje w trakcie ładowania.

### Sekcje poza pierwszym ekranem: `deferLayout`

Bez tego pierwsze malowanie czeka na ułożenie CAŁEJ strony. W pomiarze `Style & Layout` zajmował
1059 ms — więcej niż wykonanie całego JavaScriptu — a obserwowane FCP i LCP padały w tej samej
milisekundzie, długo po `load`. Po założeniu `content-visibility: auto` na sekcje: **Speed Index
3965 → 1137 ms**, `Style & Layout` 1059 → 53 ms.

`<Section deferLayout>` na każdą sekcję **poza pierwszym ekranem**. Nie zakładaj tego na sekcję z
przyklejonym elementem w środku: `content-visibility` tworzy blok zawierający dla `position: fixed`.

### Obrazy: `eager`, nie `priority`

`priority` w `next/image` dokłada `fetchpriority='high'`, przez co React 19 wstawia
`<link rel='preload' as='image'>` **przed** arkuszem stylów. Na wolnym łączu zdjęcie zabiera wtedy
pasmo elementowi LCP — a na stronie tekstowej jest nim zwykle akapit, nie obraz. Zamiana na `eager`
(samo `loading='eager'`) dała **LCP 3714 → 3480 ms i TBT 272 → 141 ms**.

`priority` zostaw wyłącznie dla obrazu, który JEST elementem LCP — sprawdzonym w raporcie, nie
założonym.

### Zwinięta treść zostaje w dokumencie

`AccordionContent` ma domyślnie `hiddenUntilFound`. Base UI bez tego USUWA zwinięty panel z drzewa
dokumentu, a akordeon to najczęstsze miejsce na FAQ — czyli treść, po którą przychodzi robot.
Sprawdzone na zbudowanej stronie: przed poprawką pytania były w źródle, odpowiedzi nie było ani
jednej.

`hidden='until-found'` daje przy tym więcej niż `keepMounted`: wbudowana wyszukiwarka przeglądarki
znajduje tekst i sama rozwija panel. Bez JavaScriptu atrybut działa jak zwykłe `hidden` — treść
zostaje w źródle, panel ma wysokość zero, więc nie ma przesunięcia układu po hydracji (zmierzone w
przeglądarce z wyłączonym JS-em).

### Okna modalne ładują się leniwie — konwencja dla CAŁEJ aplikacji

**Każde okno modalne wchodzi do drzewa przez `next/dynamic` i warunek montażu, nigdy przez statyczny
import.** Pilnuje tego `src/hooks/use-is-open.test.ts`, który skanuje źródła: moduł o nazwie
`*-dialog.tsx` poza `components/ui` nie może być nigdzie zaimportowany statycznie. Wzorzec do
skopiowania siedzi w `components/cookie/cookie-consent.tsx`.

```tsx
const ThingDialog = dynamic(() =>
	import('@/components/thing/thing-dialog').then(module => module.ThingDialog)
)

const thing = useIsOpen()

<Button onClick={thing.handleOpen}>Otwórz</Button>
{thing.isOpen && <ThingDialog open={thing.isOpen} onOpenChange={thing.handleOpenChange} />}
```

Dwie rzeczy, bez których to nie działa, a wygląda, jakby działało:

1. **Samo `dynamic` nie odracza niczego.** Chunk rusza przy PIERWSZYM RENDERZE komponentu, więc okno
   renderowane bezwarunkowo (`<ThingDialog open={false}>`) pobiera się na każdej stronie tak samo
   jak przy zwykłym imporcie. Odroczenie daje dopiero warunek `{thing.isOpen && …}`.
2. **Zamknięcie idzie przez `onOpenChange`, nie przez własny `onClick`.** Escape i kliknięcie w tło
   mają tylko tę jedną drogę; handler ignorujący argument (`() => handleClose()`) wygląda na
   działający i rozjeżdża stan przy każdym zamknięciu spoza przycisku. Dlatego `useIsOpen` oddaje
   gotowe `handleOpenChange` — żeby nie było czego pomylić.

**Cena tego wzorca — dwie rzeczy, obie świadome:**

- **Nie ma animacji zamknięcia.** Sprawdzone w przeglądarce na zbudowanej stronie: przy warunkowym
  montażu `[data-slot="dialog-content"]` znika z DOM-u w tej samej klatce, w której pada Escape
  (`present: false`); okno zamontowane na stałe zostaje wtedy w drzewie z `data-closed` i przejście
  ma się na czym odegrać. Wejście animuje się normalnie w obu wariantach. Jeśli któreś okno MUSI
  domykać się płynnie, trzymaj je zamontowane po pierwszym otwarciu — kosztem jest jedna dodatkowa
  flaga stanu.
- **Pobranie chunku startuje z kliknięciem**, więc między kliknięciem a oknem jest przerwa. Na
  szybkim łączu niezauważalna, na wolnym widoczna. Jeśli zacznie przeszkadzać, podgrzej chunk na
  `onPointerEnter` i `onFocus` przycisku (`void import('…')`) — pomaga myszy i klawiaturze, nie
  pomaga dotykowi.

**Ile to daje — zmierzone na tym starterze**, dwa okna warstwy zgód (panel ustawień i polityka
prywatności), strona główna, build produkcyjny, sumy z Resource Timing:

| Metryka                  |     Przed |        Po |      Różnica |
| ------------------------ | --------: | --------: | -----------: |
| transfer (po gzipie)     | 444 127 B | 440 764 B |  **−3,4 kB** |
| do sparsowania (decoded) | 1 487 440 | 1 471 116 | **−16,3 kB** |
| plików JS przy starcie   |        20 |        23 |           +3 |

Czytaj to uczciwie: **−0,76% transferu i −1,1% kodu do sparsowania to mało**, a trzy żądania więcej
zjadają część tej oszczędności na wolnym łączu. Dla TYCH dwóch okien zmiana jest na granicy szumu i
jej sens bierze się stąd, że `CookieConsent` siedzi w root layoucie, więc dokłada się do KAŻDEJ
strony. Konwencja obowiązuje mimo to, bo koszt jej stosowania to dwie linie, a zysk rośnie z wagą
okna: pierwsze okno z podpisem, edytorem tekstu, mapą albo wykresem to już nie kilobajty, tylko
setki kilobajtów, których większość odwiedzających nigdy nie uruchomi. Nie licz jednak na to, że ten
wzorzec sam z siebie poprawi wynik Lighthouse'a — przy lekkim oknie nie poprawi.

### Zmierzone i ODRZUCONE — nie próbuj ponownie

| Pomysł                          | Dlaczego nie                                                                                                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `experimental.inlineCss`        | w App Routerze CSS ląduje w HTML-u dwa razy — jako `<style>` i w ładunku RSC. HTML po gzipie rósł z 31,7 do 60,2 kB wobec 9,1 kB osobnego arkusza; FCP gorszy o 225 ms                                                                                                                                  |
| `browserslist` na polyfille     | Next z Turbopackiem wstrzykuje `polyfill-module` bezwarunkowo — audyt `legacy-javascript` nie zmienił się ani o bajt                                                                                                                                                                                    |
| przenoszenie GTM z `lazyOnload` | kontener startuje po zdarzeniu `load`, jego długie zadania wypadają w 4,5 i 6,1 s — długo po LCP. Wyłączenie go dało różnicę jednego punktu, czyli szum                                                                                                                                                 |
| wyłączanie `/dev` z arkusza     | zmierzone dwa razy. Build z flagą `NEXT_PUBLIC_ENABLE_DEV_PAGES` i bez niej daje BAJT W BAJT ten sam arkusz (34 967 B po gzipie), bo Tailwind skanuje całe `src/` niezależnie od budowanych tras. `@source not '../app/(dev)'` oszczędza 1 kB — strony `/dev` używają tych samych komponentów co reszta |

## Nagłówki bezpieczeństwa

Komplet siedzi w `headers()` w `next.config.ts` i obejmuje **każdą** trasę, łącznie z plikami z
`public/`. Warstwa łamie się bezobjawowo — strona wygląda i działa tak samo z nagłówkami i bez nich
— więc pilnuje jej `e2e/security-headers.spec.ts`.

### `script-src` ma `'unsafe-inline'` i to jest decyzja, nie przeoczenie

Strona ma cztery skrypty wykonywane przed pierwszym malowaniem (tabela niżej) plus bloki JSON-LD.
Alternatywą jest `nonce`, ale nonce musi być inny przy każdym żądaniu, więc **wymusza render
dynamiczny** — a dziś wszystkie trasy są prerenderowane statycznie i to jest fundament wydajności
tej strony.

Robotę wykonują za to pozostałe dyrektywy i one mają zostać nietknięte: `object-src 'none'`,
`base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`. Zamykają drogi eskalacji nawet
wtedy, gdy skrypt uda się wstrzyknąć.

Przejście na nonce jest tanie, gdy projekt i tak zrezygnuje z SSG — instrukcja w `next.config.ts`.
Uwaga: nonce i `'unsafe-inline'` wykluczają się, przeglądarka ignoruje to drugie.

### Trzy pułapki, każda kosztowała osobne śledztwo

| Rzecz                       | Co się dzieje                                                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `upgrade-insecure-requests` | podnosi żądania http na https również pod `http://localhost`. Pierwsza strona ładuje się normalnie, a dopiero ładunek RSC pada na `ERR_SSL_PROTOCOL_ERROR` i router po cichu schodzi do pełnego przeładowania |
| `frame-src data:`           | byłby potrzebny dla podglądu osadzenia na `/dev`, gdyby ten został adresem `data:`. Otwiera ramkę na dowolny wstrzyknięty dokument — dlatego podgląd przeniósł się do `public/embed-preview.html`             |
| `require-trusted-types-for` | Lighthouse pokazuje go jako informację, ale włączyć się nie da: React i Next.js przypisują do `innerHTML`. Wywraca stronę całkowicie, nie po cichu                                                            |

Dokładając osadzenie (mapa, film) dopisz jego domenę do `frame-src` — bez tego ramka zostaje pusta,
a przeglądarka mówi o tym wyłącznie w konsoli.

## Kolory i dostępność

Strona jest **wyłącznie ciemna** — rampa w `brand.css` ma od razu konwencję motywu ciemnego, a blok
`.dark` nie powtarza wartości. Akcenty marki to para `--hot` / `--cold`; do TEKSTU służą ich
jaśniejsze wersje `--hot-text` / `--cold-text`, bo kolor pełny jako mały napis nie trzyma WCAG AA.

Rampa marki i role semantyczne siedzą w `src/app/theme/brand.css` — to jedyny plik do podmiany przy
brandingu. Każdy kolor statusowy ma **czwórkę** tokenów: `--x`, `--x-foreground`, `--x-soft`,
`--x-soft-foreground`. Kolor pełny jest tłem, `-soft-foreground` jest tekstem; użycie koloru pełnego
jako tekstu daje kontrast rzędu 2:1.

Każda para tokenów musi spełniać próg WCAG AA (4,5:1) w OBU motywach — sprawdza to
`e2e/contrast.spec.ts`. Po zmianie palety uruchom `pnpm test:e2e`.

Kontrolki Base UI renderują rolę na elemencie z własnym identyfikatorem, więc `<Label htmlFor>` nie
nadaje im nazwy dostępnej. Używaj `aria-label` albo `aria-labelledby`.

## Czytniki ekranu

Ta warstwa łamie się inaczej niż wszystko pozostałe w projekcie: **strona wygląda identycznie, lint
milczy, testy zachowania przechodzą i audyt axe też jest zielony.** Brak `aria-current`, nazwa
dostępna zlepiona z całej karty czy angielskie „Close" w polskim serwisie nie są naruszeniem żadnej
reguły — to utrata informacji, którą słychać wyłącznie z włączonym czytnikiem. Dlatego:

- `e2e/a11y.spec.ts` odpowiada na pytanie **czy nie ma naruszeń** (axe, WCAG 2.2 AA),
- `e2e/screen-reader.spec.ts` odpowiada na pytanie **czy da się z tego korzystać**.

Automaty łapią około jednej trzeciej realnych barier, więc drugi plik jest tym, który pilnuje
reszty. Dokładając cokolwiek do interfejsu, dopisz tam przypadek.

### Napisy widoczne tylko dla czytnika idą przez `messages/*.json`

Rejestr shadcn przychodzi z angielskimi napisami wpisanymi wprost w kod: `Close`, `Loading`,
`Previous slide`, `More pages`, `Toggle Sidebar`, `aria-label='pagination'`. Na polskiej stronie
polska synteza mowy czyta je polskimi regułami i wychodzi z tego bełkot — a **nie widzi tego nikt
poza osobą niewidomą**, bo napisy są `sr-only`. Komplet siedzi w namespace `a11y`.

Pilnuje tego `components/ui/sr-only-text.test.ts`: skanuje `components/ui` w poszukiwaniu literałów
w `aria-label`, `aria-roledescription`, `title` i w treści elementów `sr-only`. Lista `ALLOWED` jest
krótka i imienna. Test jest konieczny, bo `shadcn add --overwrite` przywraca angielskie napisy przy
każdej aktualizacji komponentu.

**Wyjątek: `Button` i `Spinner` nie wołają `useTranslations` bezwarunkowo.** `global-error.tsx`
renderuje `Button` bez kontekstu next-intl (ginie razem z root layoutem), więc hook w ciele
komponentu wywracałby ostatnią granicę błędu w aplikacji. Zapowiedź nowej karty jest dlatego osobnym
komponentem `NewTabHint` — hook uruchamia się dopiero wtedy, gdy zapowiedź wchodzi do drzewa.
`Spinner` rozwiązuje to inaczej: jest dekoracyjny domyślnie i nie potrzebuje żadnego napisu.

### Nazwa dostępna to nie to samo co widoczny tekst

| Wzorzec                      | Reguła                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Klikalna karta               | `aria-labelledby` na tytule. Bez tego nazwą linku jest CAŁA treść karty i lista linków staje się bezużyteczna |
| Data                         | tekst zapisany słowami (`formatIsoDate`), maszynowy ISO zostaje w `dateTime`                                  |
| Kropka, pauza, strzałka      | `aria-hidden` — czytnik wymawia je jako „kropka środkowa"                                                     |
| Link do nowej karty          | `Button` dopisuje zapowiedź sam; `announceNewTab={false}`, gdy widoczny tekst już to mówi                     |
| `mailto:` / `tel:`           | NIE dostają `target='_blank'` — kartę przejmuje program pocztowy i zostaje pusta                              |
| Punkt orientacyjny bez nazwy | `<aside>`, `<nav>`, `role='region'` bez nazwy przepadają z listy, po której czytnik pozwala skakać            |
| Pozycja menu z wyborem       | `menuitemradio` + `closeOnClick`, nie `menuitem` — patrz niżej                                                |

### Stan widoczny okiem musi mieć odpowiednik w ARIA

Trzy miejsca, w których podświetlenie było JEDYNĄ informacją o stanie:

1. **Bieżąca podstrona** — `aria-current` dokłada `components/layout/nav-link.tsx`. Wartości są dwie
   i różnią się znaczeniem: `page` to ta strona, `true` to pozycja, w której obrębie jesteśmy
   (`/realizacje` na stronie jednej realizacji). Oznaczanie wszystkiego jest gorsze niż
   nieoznaczanie niczego.
2. **Wybrany motyw i język** — `DropdownMenuRadioGroup`, nie zwykłe pozycje menu. Bieżący język NIE
   jest już `disabled`: czytnik mówił wtedy „niedostępny", co brzmi jak usterka, a nie jak „to jest
   ustawione teraz". **Pozycje radiowe Base UI domyślnie NIE zamykają menu** (`closeOnClick` ma
   domyślnie `false`, bo służą zwykle do przestawiania kilku opcji naraz) — bez tego propsa wybór
   motywu przestaje zamykać listę.
3. **Wybór w wyszukiwarce `/dev`** — `aria-activedescendant`. Strzałki przesuwały samo
   podświetlenie, więc użytkownik czytnika naciskał Enter, nie wiedząc, co otworzy.

### Formularze: trzy mechanizmy, każdy na inną sytuację

`components/forms/quote-form.tsx` jest wzorcem do kopiowania.

1. **`aria-describedby` z pola na komunikat.** `aria-invalid` mówi tylko „coś nie tak"; powód leży w
   osobnym elemencie, którego czytnik przy polu nie czyta. Sklejaj listę helperem `describedBy` —
   wskazanie NIEISTNIEJĄCEGO identyfikatora każe części czytników pominąć cały atrybut, więc razem z
   brakującym opisem przepada ten, który istnieje (axe: `aria-valid-attr-value`).
2. **Podsumowanie błędów nad formularzem**, z fokusem i odnośnikami do pól. Bez niego osoba
   niewidoma po kliknięciu „Wyślij" nie wie NIC. Wymaga `shouldFocusError: false` w `useForm`:
   react-hook-form domyślnie przestawia fokus na pierwsze błędne pole **po** naszym efekcie, więc
   mechanizm wygląda na działający (komunikat jest widoczny), tylko kursor stoi gdzie indziej.
3. **Obszar `role='status'` istnieje ZAWSZE, zmienia się tylko jego treść.** Obszar `aria-live`
   dostawiony do drzewa razem z gotowym tekstem bywa pomijany — czytniki ogłaszają zmiany obszarów,
   które już obserwowały.

### Baner zgód odcina tło przez `inert`

`aria-modal='true'` deklaruje, że pod oknem nic nie ma, ale czytniki traktują tę deklarację różnie —
NVDA w trybie przeglądania zjeżdża strzałkami na treść pod banerem. Osoba niewidoma czyta wtedy
stronę, której baner miał nie wypuszczać, i nie ma powodu przypuszczać, że gdziekolwiek czeka na nią
decyzja. `inert` na rodzeństwie banera wyjmuje gałąź z drzewa dostępności I odbiera jej fokus.

Trzy rzeczy, bez których to się psuje:

1. **Ten sam warunek `isPending()` co przy fokusie.** Bez niego powracający użytkownik — u którego
   baner jest w HTML-u, ale ukryty CSS-em — dostaje CAŁĄ stronę martwą. Najgorsza możliwa usterka
   tej warstwy, stąd osobny test „po decyzji strona wraca do drzewa dostępności".
2. **Lista rodzeństwa zdejmowana RAZ, przy wejściu.** Okna zgód portalują się do `<body>` później,
   więc nie trafiają na tę listę i działają normalnie.
3. `inert` nie wpływa na układ, więc nie łamie reguły „nic nie pojawia się po hydracji" — nie ma tu
   czego przesunąć ani domalować.

Próba ominięcia banera (Escape, kliknięcie w tło) odpowiadała wcześniej WYŁĄCZNIE pulsowaniem karty.
Teraz dokłada komunikat w obszarze `aria-live` — bez niego osoba niewidoma naciska Escape, nic się
nie dzieje i ma prawo sądzić, że strona zawisła.

### Czego NIE trzeba robić

| Rzecz                            | Dlaczego nie                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ogłaszanie zmiany trasy          | App Router robi to sam — `AppRouterAnnouncer` wstawia tytuł dokumentu do obszaru `aria-live` przy każdej nawigacji |
| `aria-hidden` na ikonach lucide  | biblioteka dokłada je sama, gdy ikona nie ma żadnego propsa `aria-*`, `role` ani `title`                           |
| `lang` na pozycjach przełącznika | nazwy języków są przetłumaczone na język strony („Angielski"), więc `lang` przełączyłby syntezę na złą             |

## Konwencje

- nazwy plików w kebab-case
- **kod po angielsku, treść po polsku.** Nazwy zmiennych, funkcji, typów, pól, identyfikatorów DOM i
  kotwic — wyłącznie angielskie. Po polsku zostają komentarze, opisy testów i teksty widoczne dla
  użytkownika. Mieszanka (`LIMITY.wiadomosc`, `const naruszenia`) zamyka projekt przed każdym, kto
  nie mówi po polsku, a to ma być podstawa dowolnej strony.
- lodash importowany per metoda (`import map from 'lodash/map'`), i tylko tam, gdzie standardowa
  biblioteka nie ma odpowiednika
- `interface` zamiast `type` dla kształtów obiektów
- zakaz `any`
- zmienne środowiskowe wyłącznie przez `@/env`, nigdy `process.env` bezpośrednio
- testy komponentów renderuj przez `render` z `@/test/render`, nie wprost z Testing Library — helper
  dokłada kontekst next-intl, bez którego linki świadome języka rzucają błędem

## Animacje

`Reveal` i `RevealGroup` z `components/motion/reveal.tsx` pokazują element przy wejściu w pole
widzenia. Animacja startuje z `opacity: 0`, a stan początkowy trafia do HTML-a **już z serwera** —
więc każda ścieżka, na której nie dojdzie do jej odpalenia, ukrywa treść na stałe. Stąd dwa
zabezpieczenia, oba w CSS-ie (`app/theme/motion.css`), bo muszą zadziałać wtedy, gdy JavaScript
zawiedzie:

| Sytuacja                    | Mechanizm                                                                     |
| --------------------------- | ----------------------------------------------------------------------------- |
| `prefers-reduced-motion`    | media query wymusza stan końcowy `!important` (WCAG 2.3.3)                    |
| Brak lub awaria JavaScriptu | klasa `no-js` jest na `<html>` OD RAZU i znika dopiero, gdy skrypt się wykona |

Logika klasy `no-js` jest celowo odwrotna do intuicyjnej. Gdyby skrypt ją **dokładał**, jego awaria
zostawiłaby treść niewidoczną — czyli dokładnie w stanie, przed którym zabezpieczenie ma chronić.

**`Reveal` nie rozgałęzia się na ograniczony ruch i to jest wymóg, nie uproszczenie.** Wcześniej
pytał o preferencję i zwracał wtedy zwykły `div`. Serwer nie zna ustawienia systemowego, więc
renderował wariant animowany, a klient — goły: niezgodność hydracji, po której React porzuca całe
poddrzewo. Markup jest teraz identyczny po obu stronach granicy, a preferencję obsługuje
`MotionConfig reducedMotion='user'` w `Providers` — biblioteka pomija animacje sama, bez zmiany
drzewa. Dlatego `data-reveal` zostaje ZAWSZE: to zaczep dla reguł z `motion.css`.

Usterka była widoczna **wyłącznie w przebiegu deweloperskim** — build produkcyjny nie wypisuje
ostrzeżeń o hydracji. Stąd osobne zadanie `e2e-dev` w CI; uruchamiaj lokalnie
`E2E_DEV=1 pnpm test:e2e` przy każdej zmianie w komponentach klienckich.

Testy wariantu z ograniczonym ruchem siedzą w OSOBNYM pliku (`reveal.reduced-motion.test.tsx`):
odczyt preferencji w bibliotece animacji jest zapamiętywany przy pierwszym wywołaniu i trzymany
przez całe życie modułu. W jednym pliku z pozostałymi testami byłby już zapamiętany jako „brak
ograniczenia", a test przechodziłby, nie sprawdzając niczego.

## Warstwa danych

Treść stron Kubika siedzi w `src/data/` jako zwykłe moduły TypeScriptu — bez CMS-a i bez MDX:

| Plik          | Zawartość                                                            |
| ------------- | -------------------------------------------------------------------- |
| `cities.ts`   | 12 miast z treścią pisaną dla każdego osobno, FAQ, faktami lokalnymi |
| `projects.ts` | 12 realizacji: metraż, wylewka, czas, przebieg, zdjęcia              |
| `service.ts`  | kroki, „nadaje się / nie nadaje się", czynniki ceny, FAQ usługi      |
| `reviews.ts`  | opinie z wizytówki Google                                            |

Trzy rzeczy wynikają z tego, że to ta SAMA lista karmi wiele miejsc:

- **Strony miast i realizacji mają `dynamicParams = false`.** Adres spoza listy to 404 z
  `not-found.tsx`, a nie render na żądanie z danymi `undefined`.
- **Sitemap czyta te same listy co `generateStaticParams`**, więc nie zgłosi adresu bez strony.
- **Ścieżki składają wyłącznie `cityPath` i `projectPath`.** Slider, stopka, obszar działania i
  okruszki linkują przez nie — zmiana adresu to jedna linia.

Angielskie wersje leżą w `src/data/en/` — patrz „Języki".

Zdjęcia leżą w `src/assets/photos` i są importowane statycznie (patrz „Obrazy"); typ zdjęcia w
danych to `ImageSource` z `components/ui/image`, bo import `next/image` poza `components/ui` blokuje
ESLint.

Wygląd długiej treści opisuje **jedno** miejsce — `components/ui/prose.tsx`. Świadomie bez
`@tailwindcss/typography`, bo ta wtyczka przynosi własną skalę rozjeżdżającą się z `typography.tsx`.

### `/apple-icon` — jedyny plik metadanych bez kropki w adresie

Trasa generowanej ikony iOS-a nazywa się `/apple-icon`, więc reguła w matcherze proxy jej nie łapie
i next-intl przepisywał ją na `/pl/apple-icon`. Objaw: build wypisuje trasę jako zbudowaną,
`<link rel="apple-touch-icon">` jest w HTML-u, a pod adresem stoi 404 — a na iPhonie zamiast ikony
ląduje zrzut strony. Segment jest dlatego wymieniony z nazwy w `UNLOCALIZED_SEGMENTS`. Pilnuje tego
`e2e/metadata-files.spec.ts`.

## Języki

Kubik ma dwie wersje: polską (domyślna, bez prefiksu) i angielską (`/en/…`). Listy siedzą w
`src/site.config.ts` i nie wolno ich mylić: `supportedLocales` to języki, które zna kod — z niej
wynika typ `Locale` i mapa `localeTags`; `locales` to języki faktycznie włączone i tylko ją
edytujesz. Gdyby `Locale` wynikało z listy włączonych, zawężenie jej do `['pl']` zawęziłoby też sam
typ i **wywaliło build** — tak było w pierwszym podejściu.

Tekst strony ma DWA źródła i każde tłumaczy się inaczej:

| Źródło                  | Tłumaczenie                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| `messages/<język>.json` | interfejs i nagłówki; komplet kluczy i zmiennych pilnuje `i18n/messages.test.ts` |
| `src/data/*.ts`         | treść miast, realizacji, usługi i opinie; wersja angielska w `src/data/en/`      |

Treść z `src/data` widok bierze **zawsze z językiem strony** — `localizedCities(locale)`,
`findProject(slug, locale)`, `serviceContent[locale]`, `reviewsByLocale[locale]` — a nie z gołej
listy. Gołe `cities` / `projects` służą wyłącznie do slugów (`generateStaticParams`, sitemap). Brak
tłumaczenia nie wywraca strony, tylko pokazuje polski tekst pod angielskim menu; komplet slugów
pilnuje `data/localized.test.ts`.

Trzy decyzje, które warto znać:

- **Adresy są wspólne dla języków** — `/en/frezowanie-pod-ogrzewanie-podlogowe/krakow`. Dzięki temu
  `hreflang` i sitemap wynikają same z prefiksu. Angielskie slugi wymagałyby `pathnames` w next-intl
  i osobnych slugów w danych.
- **Opinie po angielsku to tłumaczenie oryginałów** i sekcja opinii mówi to wprost
  (`sections.reviewsTranslated`) — klienci pisali po polsku.
- **Mail do właściciela zostaje po polsku** niezależnie od języka formularza — czyta go firma.

Wyłączenie drugiego języka to jedna pozycja w `locales` — adresy tracą prefiks, przełącznik i
`hreflang` znikają same (przez `isMultilingual`). **Nie kasuj** przy tym segmentu `[locale]`,
`proxy.ts` ani next-intl. Wariant jednojęzyczny pokrywa `lib/seo/metadata.single-locale.test.ts`.

## Linki wewnętrzne a język

`Button` z `href` sam wybiera element: link zewnętrzny, kotwicę albo link routera. Dla ścieżek
wewnętrznych używa `Link` z `@/i18n/navigation`, więc przy drugim języku `href='/kontakt'` sam
dostanie jego prefiks. **Nigdy nie sklejaj `/${locale}/…` ręcznie.**

Trasy spoza routingu językowego (`/dev`, `/api`) są wymienione w `UNLOCALIZED_SEGMENTS` w
`lib/routes.ts` — te dostają zwykły `next/link`. Lista jest powtórzona w matcherze `proxy.ts`, bo
Next.js wymaga tam literału; zgodności pilnuje `lib/routes.test.ts`.

## Strony 404 i błędów

Cztery pliki, bo Next.js obsługuje cztery różne sytuacje i żaden z nich nie zastępuje pozostałych:

| Plik                            | Kiedy się renderuje                                                  |
| ------------------------------- | -------------------------------------------------------------------- |
| `app/global-not-found.tsx`      | adres nie pasuje do ŻADNEJ trasy (`/nie-ma`, `/dev/nie-ma`, `/xx`)   |
| `(site)/[locale]/not-found.tsx` | `notFound()` z widoku, adres miasta lub realizacji spoza listy       |
| `(site)/[locale]/error.tsx`     | wyjątek w stronie lub zagnieżdżonym layoucie części publicznej       |
| `app/global-error.tsx`          | wyjątek w SAMYM root layoucie — wtedy nie ma już nagłówka ani stopki |

Trzy pułapki, wszystkie złapane w tym projekcie dopiero na buildzie produkcyjnym:

1. **`not-found.tsx` NIE łapie adresów bez pasującej trasy.** Router nie wchodzi wtedy w drzewo
   segmentów, więc granica 404 wewnątrz `[locale]` w ogóle się nie renderuje, a użytkownik dostaje
   wbudowaną, niestylowaną stronę Next.js. Od tego jest `global-not-found.tsx` — wymaga flagi
   `experimental.globalNotFound` w `next.config.ts`, bez której plik jest cicho ignorowany.
   Dokumentacja Next.js wskazuje go dokładnie dla naszego układu, i to z obu wymienionych tam
   powodów naraz: dwa root layouty ORAZ dynamiczny segment na samej górze.
2. **Pliki omijające root layout nie dziedziczą `globals.css`.** `global-not-found.tsx` i
   `global-error.tsx` renderują własny dokument, więc import stylów i `DocumentShell` muszą mieć u
   siebie. Brak importu daje stronę o poprawnej treści i zerowym wyglądzie — bez błędu w konsoli.
3. **Poza `[locale]` nie ma kontekstu next-intl.** `Button` z `href` renderuje link świadomy języka,
   a ten bez kontekstu rzuca błędem. `global-not-found.tsx` opakowuje treść w
   `NextIntlClientProvider` — tak samo jak layout `/dev`. Do `global-error.tsx` kontekst już nie
   dojdzie (ginie razem z layoutem), więc ma teksty wpisane wprost i link jako zwykłą kotwicę
   (`external`). To jedyne miejsce w projekcie, gdzie treść nie idzie przez `messages/*.json`.

Treść samej strony 404 opisuje `components/layout/not-found-view.tsx` — wspólna dla obu plików 404,
żeby nie rozjechały się przy pierwszej zmianie tekstu.

Granica błędu w Next.js 16 dostaje `retry`, nie `reset`: `retry()` ponawia pobranie i render,
`reset` tylko czyści stan i jest dziś wariantem awaryjnym.

Zachowanie pilnuje `e2e/not-found.spec.ts`. Jednostkowo nie da się go sprawdzić — o tym, która
granica się wyrenderuje, decyduje router, a nie kod widoku.

## Skrypty wykonywane przed hydracją

Cztery rzeczy muszą zadziałać przed pierwszym malowaniem strony. Służy do tego
`components/layout/inline-script.tsx` — i tylko on.

| Skrypt                 | Co robi                                        | Co się stanie bez niego                        |
| ---------------------- | ---------------------------------------------- | ---------------------------------------------- |
| `themeScript`          | nakłada motyw na `<html>`                      | błysk białego tła u osoby z motywem ciemnym    |
| `enableMotionScript`   | zdejmuje `no-js`                               | treść z animacjami wejścia zostaje niewidoczna |
| `consentPendingScript` | zdejmuje `consent-pending`, gdy zgoda zapisana | mignięcie banera u powracającego użytkownika   |
| `consentBootstrap`     | ustawia domyślną odmowę dla GTM                | tagi odpalone przed decyzją użytkownika        |

Trzy pierwsze zdejmują albo zakładają klasę na `<html>`, a nie odwrotnie — klasa jest w HTML-u z
serwera OD RAZU i znika dopiero, gdy skrypt się wykona. Kierunek jest za każdym razem taki, żeby
AWARIA skryptu zostawiała stan bezpieczny: treść widoczną, pytanie o zgodę zadane.

Ani zwykły `<script>`, ani `next/script` ze strategią `beforeInteractive` się tu nie nadają: oba
trafiają do drzewa Reacta, a React ostrzega przy każdym renderze klienta („Encountered a script tag
while rendering React component"). `InlineScript` oddaje skrypt jako `text/javascript` na serwerze i
`text/plain` na kliencie — wzorzec z dokumentacji Next.js „How to prevent flash before hydration".

## Skille agentów

W `.claude/skills/` leżą skille zainstalowane przez `npx skills add` — cudze pliki, wyłączone z
lintowania i formatowania. `skills-lock.json` zapisuje źródła i sumy kontrolne.

**Zasady z tego pliku mają pierwszeństwo.** Skille to porady ogólne, pisane bez znajomości tego
projektu; przy rozjeździe wygrywa AGENTS.md. Najczęstszy przypadek: skille pokazują komponenty
budowane od zera w widoku, a u nas widok składa się wyłącznie z `components/ui`.

## Strony deweloperskie

`/dev`, `/dev/styleguide`, `/dev/components` — dostępne w trybie deweloperskim, a w produkcji tylko
za flagą `NEXT_PUBLIC_ENABLE_DEV_PAGES`. Każda próbka to realny komponent: jeśli coś tam wygląda
źle, poprawka idzie do komponentu, nie do strony.

**Każdy eksportowany komponent z `components/ui` musi być RENDEROWANY w którejś sekcji.** Pilnuje
tego `dev-coverage.test.ts` — jeden test na eksport. Bez tego `shadcn add` dokładałby rzeczy, o
których nikt się nie dowie, a skończy się doraźnym markupem w widoku, czyli dokładnie tym, czego
zakazuje reguła wyżej.

Ziarnistość jest tu istotna i kosztowała jedną ślepą plamę. Pierwsza wersja testu pytała o **import
pliku** i świeciła na zielono przy komplecie 65 modułów — mimo że 101 z 343 eksportowanych
komponentów nie było renderowanych nigdzie (`ToggleGroupItem`, `ComboboxChips`, `CommandDialog`,
połowa `Sidebar`). Jeden import wystarczał na cały plik. Gorzej niż brak próbki: `ToggleGroup`
składał grupę z `Toggle` zamiast `ToggleGroupItem`, więc strona pokazywała BŁĘDNĄ kompozycję —
wariant i odstęp grupy nie propagowały się do dzieci, a test i tak przechodził.

Eksporty bez własnego wyglądu (portale, tła warstw, elementy składane przez rodzica, warstwa toastów
sterowana przez `toast.add`) siedzą w liście `NO_SAMPLE` w tym teście, każdy z powodem. Lista jest
krótka celowo — wszystko, co pisze użytkownik komponentu, musi mieć próbkę, inaczej zamieni się w
wygodne miejsce na chowanie długów.

Strona jest **jedną stroną od góry do dołu** — bez dzielenia na podstrony. Nawigację niesie szyna
przy lewej krawędzi (`anchor-nav.tsx`) z podświetlaniem aktywnej sekcji oraz wyszukiwarka
(`section-search.tsx`). Indeks wyszukiwarki powstaje z DRZEWA DOKUMENTU, nie z osobnej listy —
dopisana próbka trafia do wyników sama.
