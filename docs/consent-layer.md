# Warstwa zgód i okna modalne — przepis do nowego projektu

Ten dokument opisuje, jak przenieść do nowego projektu baner zgód działający jako **modal
blokujący** oraz konwencję leniwego ładowania okien modalnych, która z niego wyrosła.

Nie jest to opis kodu — kod jest w repozytorium i da się go skopiować. To jest opis **decyzji i
pułapek**: rzeczy, których z samego kodu nie widać, a każda z nich kosztowała osobne śledztwo.
Wszystkie liczby poniżej są zmierzone, nie oszacowane.

Zakładam Next.js z App Routerem, Tailwind 4 i okna z Base UI (shadcn). Przy innym stosie zostaje
sama logika; zmienią się nazwy atrybutów.

---

## 1. Zanim zaczniesz — jedna decyzja prawna

Ten baner **nie ma przycisku odrzucenia w pierwszym kroku**. Są dwa wyjścia: „Ustawienia" i
„Akceptuję", a odmowa polega na wejściu w ustawienia i zapisaniu wyłączonych przełączników.

To decyzja właściciela strony, podjęta świadomie po to, żeby podnieść odsetek zgód marketingowych —
i **niesie ryzyko prawne**. Wytyczne EROD oraz stanowisko UODO mówią, że odmowa ma być tak samo
łatwa jak zgoda; układ z jednym kliknięciem na „tak" i dwoma na „nie" bywa kwestionowany jako dark
pattern.

Masz dwa warianty i musisz wybrać przed wdrożeniem:

| Wariant                 | Co zmieniasz                                               |
| ----------------------- | ---------------------------------------------------------- |
| Zgodny z wytycznymi     | dokładasz w banerze trzeci `Button` wołający `onRejectAll` |
| Nastawiony na konwersję | zostawiasz dwa przyciski, tak jak w tym repozytorium       |

Reszta warstwy jest identyczna w obu. Panel ustawień musi być osiągalny zawsze i z każdego miejsca —
także po podjęciu decyzji (RODO daje prawo do wycofania zgody w każdej chwili), stąd link w stopce.

---

## 2. Mapa plików

| Plik                                              | Za co odpowiada                                              |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `lib/analytics/consent.ts`                        | odczyt/zapis zgody, klasa `consent-pending`, skrypt startowy |
| `lib/analytics/gtag.ts`                           | przekład kategorii na sygnały Google Consent Mode            |
| `hooks/use-cookie-consent.ts`                     | zgoda jako store poza Reactem (`useSyncExternalStore`)       |
| `app/theme/consent.css`                           | widoczność banera, blokada przewijania, pulsowanie           |
| `components/layout/document-shell.tsx`            | klasy na `<html>` i skrypty w `<head>`                       |
| `components/cookie/cookie-consent.tsx`            | spina baner i okna, trzyma stan                              |
| `components/cookie/cookie-banner.tsx`             | sam modal: zasłona, karta, pułapka fokusa, pulsowanie        |
| `components/cookie/cookie-preferences-dialog.tsx` | panel kategorii                                              |
| `components/cookie/cookie-settings-button.tsx`    | ponowne otwarcie z dowolnego miejsca (zdarzenie okna)        |
| `components/legal/privacy-policy.tsx`             | treść polityki — JEDNO źródło dla strony i dla okna          |
| `hooks/use-is-open.ts`                            | stan otwarcia okna + `handleOpenChange`                      |

---

## 3. Reguła nadrzędna: nic widocznego nie pojawia się po hydracji

To jest fundament całej warstwy i jedyna rzecz, którą trzeba zrozumieć, zanim się cokolwiek
skopiuje.

Baner renderowany warunkowo (`{needsDecision && <Banner/>}`) zależy od odczytu `localStorage`, czyli
od czegoś, co istnieje dopiero po hydracji. Na krótkiej stronie baner jest największym elementem
kontentowym w pierwszym ekranie, więc to **on wyznacza LCP** — i wnosi do niego całe opóźnienie
hydracji.

Zmierzone na wdrożonym starterze: opóźnienie renderowania elementu LCP **2380 ms** przy TTFB 0 ms,
wynik wydajności **82 zamiast ~97**. Odtworzone lokalnie na buildzie produkcyjnym przy dławieniu 4×
CPU i 1,6 Mb/s, mediana z 3 przebiegów:

| Metryka | Przed       | Po                  |
| ------- | ----------- | ------------------- |
| FCP     | 1084 ms     | 1180 ms             |
| LCP     | **3416 ms** | **1180 ms** (= FCP) |
| CLS     | **0,0664**  | **0,0000**          |

Rozwiązanie ma dwie części i żadna nie działa bez drugiej:

1. **Baner jest w HTML-u z serwera ZAWSZE** — także dla osoby, która zgodę wyraziła dawno temu.
2. **O widoczności decyduje CSS, nie React.**

### Kierunek klas jest odwrotny do intuicyjnego i to jest sedno

Klasa `consent-pending` siedzi na `<html>` **od razu**, a skrypt startowy z `<head>` ją
**zdejmuje**, gdy znajdzie w `localStorage` ważną zgodę. Nie odwrotnie.

Gdyby skrypt klasę **dokładał**, jego awaria schowałaby baner osobie, której o zgodę nigdy nie
zapytano — czyli zabrałaby jej wybór wymagany przez RODO. Ten sam kierunek stosuj do klasy `no-js` i
do każdej innej rzeczy zależnej od `localStorage`, ciasteczka czy `window`: **awaria skryptu ma
zostawiać stan bezpieczny**.

Skrypt musi wykonać się synchronicznie w `<head>`, czyli przed pierwszym malowaniem — inaczej
powracający użytkownik zobaczy mignięcie banera.

Warunki ważności zgody są wtedy **powtórzone** w dwóch miejscach: w skrypcie startowym (który nie ma
jak zaimportować modułu) i w funkcji odczytu. Rozjazd między kopiami łamie się cicho, więc napisz
test porównujący werdykty obu na tej samej tabeli przypadków.

---

## 4. Baner jako modal blokujący

```
<div data-slot='cookie-banner'>        pozycja, warstwa, przewijanie — BEZ klasy display
  <div>                                zasłona: fixed inset-0, bg-black/60, onClick → puls
  <div class='flex min-h-full …'>      ramka centrująca
    <Card role='dialog' aria-modal>    karta z treścią i przyciskami
```

Cztery rzeczy, które w tym układzie są nieoczywiste:

### Kontener banera NIE MOŻE dostać klasy `display` z Tailwinda

Reguły `display: none`, które chowają baner, siedzą w warstwie `base`. Zbudowany arkusz układa
warstwy w kolejności `properties → theme → base → components → utilities`, więc **dowolna** klasa
Tailwinda ustawiająca `display` bije je wszystkie, niezależnie od specyficzności.

Postawione tam `flex` sprawiło, że baner przestał znikać — pokazywał się osobie, która zgodę
wyraziła miesiąc temu, i nie schodził po decyzji. Wywróciło to połowę pakietu e2e, bo modal
przechwytywał kliknięcia. Wyśrodkowanie robi więc osobny element w środku.

To ta sama mechanika, która każe wpisywać `cursor-pointer` wprost w komponenty.

### Blokada przewijania siedzi w CSS-ie

```css
html.consent-pending:not(.no-js) {
	overflow: hidden;
}
```

Nie w efekcie ustawiającym `document.body.style.overflow` — z tego samego powodu co widoczność: styl
założony po hydracji to zmiana układu po hydracji, czyli CLS. Klasa jest w HTML-u z serwera, więc
blokada obowiązuje od pierwszej klatki, a u powracającego użytkownika nie włącza się ani na moment.

`:not(.no-js)` jest warunkiem koniecznym: bez JavaScriptu baner się nie renderuje, więc sama blokada
zostałaby i unieruchomiła stronę bez żadnego sposobu, żeby to odblokować.

**Pułapka przy testowaniu:** `overflow: hidden` odbiera użytkownikowi mechanizm przewijania, ale
**nadal pozwala przewinąć element z kodu**. Test oparty na `window.scrollTo` pokaże usterkę tam,
gdzie jej nie ma. Testuj kółkiem myszy (`page.mouse.wheel`).

### Warstwy nakładają się, nie podmieniają

Baner zostaje pod spodem przez cały czas otwartego panelu ustawień i otwartej polityki. Widoczność
banera reaguje **wyłącznie na podjętą decyzję**, nie na otwarte okno.

Chowanie banera na czas okna zabiera razem z nim jego zasłonę: tło przeskakuje w połowie ścieżki,
użytkownik na moment widzi stronę, którą modal miał zasłaniać, a po zamknięciu okna zasłona wraca.
Ubocznie znika przy tym cała klasa błędów „wróciłem z okna i stan się nie odtworzył" — stan, który
nigdy nie przestał istnieć, nie ma czego odtwarzać.

**Konsekwencja dla testów:** przy otwartym oknie Base UI zakłada `inert` na resztę dokumentu, więc
baner **wypada z drzewa dostępności**. To poprawne — leży pod modalem i nie ma być czytany — ale
`getByRole` go wtedy nie znajdzie. Do sprawdzenia, że nadal go widać, używaj selektora.

### Odpowiedź na próbę ominięcia

Modal, którego nie da się zamknąć kliknięciem w tło, bez żadnej reakcji wygląda jak zawieszona
strona — użytkownik klika drugi i trzeci raz, zanim zauważy, że pytanie czeka wyżej. Kliknięcie obok
karty i Escape odpowiadają krótkim pulsowaniem karty (animacja CSS, klasa zakładana imperatywnie i
zdejmowana na `animationend`, żeby dała się odpalić ponownie).

Pulsowanie musi znikać przy `prefers-reduced-motion: reduce` (WCAG 2.3.3).

Pulsowanie widzi jednak WYŁĄCZNIE oko. Dla czytnika ekranu ta sama próba kończy się ciszą, więc
karta niesie obszar `aria-live` z krótkim zdaniem o tym, że decyzja jest wymagana. Obszar jest w
drzewie od początku i zmienia się tylko jego treść — `aria-live` dostawiony razem z gotowym tekstem
bywa pomijany. Treść jest czyszczona przed ustawieniem, bo podmiana na to samo zdanie nie jest dla
czytnika zmianą i drugiej próby by nie ogłosił.

---

## 5. Dostępność

- Karta ma `role='dialog'`, `aria-modal='true'`, nazwę dostępną oraz `aria-describedby` wskazujące
  akapit z wyjaśnieniem. Bez opisu czytnik ogłasza nazwę okna i pierwszy przycisk, a zdanie mówiące,
  czego decyzja dotyczy, trafia do użytkownika tylko wtedy, gdy sam po nie przejdzie — w oknie,
  którego nie da się zamknąć bez podjęcia tej decyzji.
- **Tło jest odcięte przez `inert`, nie tylko przez `aria-modal`.** Deklaracja `aria-modal` jest
  respektowana różnie; NVDA w trybie przeglądania zjeżdża strzałkami na treść pod banerem. `inert`
  na rodzeństwie banera w `<body>` wyjmuje gałąź z drzewa dostępności i odbiera jej fokus naraz.
  Trzy warunki: ten sam `isPending()` co przy fokusie (inaczej powracający użytkownik dostaje CAŁĄ
  stronę martwą), lista rodzeństwa zdejmowana RAZ przy wejściu (okna portalują się do `<body>`
  później, więc `inert` ich nie obejmuje), i świadomość, że `inert` nie rusza układu — nie łamie
  więc reguły „nic nie pojawia się po hydracji".
- Przełączniki w panelu ustawień mają `aria-describedby` wskazujące opis kategorii, a kategoria
  wymagana dodatkowo zdanie o tym, DLACZEGO nie da się jej wyłączyć. Przy `disabled` czytnik mówi
  samo „niedostępny", co brzmi jak usterka strony; osoba widząca ma obok akapit z wyjaśnieniem i
  wiąże jedno z drugim wzrokiem.
- **Pułapka fokusa jest napisana ręcznie**, nie wzięta z `Dialog` Base UI. Dialog Base UI renderuje
  się przez portal dopiero na kliencie — czyli dokładnie ten scenariusz, którego cała ta warstwa
  unika. `aria-modal` odcina czytnik ekranu, ale **nie ma wpływu na fokus klawiatury**: bez własnej
  pułapki Tab wychodzi na przykrytą treść i użytkownik klawiatury traci baner z oczu.
- Fokus wjeżdża do karty po hydracji. Warunek sprawdza klasę na `<html>`, bo o widoczności decyduje
  CSS i React nie ma innego sposobu, żeby się dowiedzieć, czy baner faktycznie widać. Użyj
  `focus({ preventScroll: true })` — przewijanie jest w tym momencie zablokowane.
- Escape nie zamyka banera (decyzja jest wymagana), ale musi coś zrobić — stąd pulsowanie.
- Kontrolki Base UI renderują rolę na elemencie z własnym identyfikatorem, więc `<Label htmlFor>`
  nie nadaje im nazwy dostępnej. Używaj `aria-label` albo `aria-labelledby`.
- Każda para tokenów kolorystycznych musi spełniać próg WCAG AA w obu motywach. Zasłona jest ciemna
  w obu — kolor wpisany na sztywno, nie z tokenu, bo rampa marki bywa w motywie ciemnym odwrócona i
  token dałby tam jasną zasłonę.

---

## 6. Polityka prywatności: jedno źródło, dwa miejsca

W banerze odnośnik do polityki **otwiera okno modalne**, a nie prowadzi na stronę. Baner blokuje
serwis, więc przejście na `/polityka-prywatnosci` zamieniłoby jeden zablokowany widok na drugi —
użytkownik zobaczyłby ten sam baner nad dokumentem, po który przyszedł.

Poza banerem odnośnik zostaje odnośnikiem i prowadzi na stronę: dokument musi mieć własny adres do
zalinkowania i zaindeksowania.

Treść ma **jedno źródło** (`components/legal/privacy-policy.tsx`), z którego korzystają oba miejsca;
różnią się tylko oprawą. Strona dokłada metadane, dane strukturalne i szerokość kolumny, okno —
limit wysokości i przewijanie. Dwie kopie tej treści rozjechałyby się przy pierwszej poprawce, a
rozjazd w dokumencie, na podstawie którego użytkownik wyraża zgodę, jest usterką prawną, nie
kosmetyczną. Napisz test porównujący obie wersje.

Ponieważ ten element jest przyciskiem, a nie odnośnikiem, licznik przycisków w banerze musi być
liczony w stopce karty, nie w całym banerze.

---

## 7. Konwencja: okna modalne ładują się leniwie

Okno modalne to kod, którego większość odwiedzających nigdy nie uruchomi, a który bez tego siedzi w
bundlu każdej strony — zwłaszcza gdy komponent montuje się w root layoucie.

```tsx
const ThingDialog = dynamic(() =>
	import('@/components/thing/thing-dialog').then(module => module.ThingDialog)
)

const thing = useIsOpen()

<Button onClick={thing.handleOpen}>Otwórz</Button>
{thing.isOpen && <ThingDialog open={thing.isOpen} onOpenChange={thing.handleOpenChange} />}
```

Dwie rzeczy, bez których to nie działa, a wygląda, jakby działało:

1. **Samo `dynamic` nie odracza niczego.** Chunk rusza przy pierwszym renderze komponentu, więc okno
   renderowane bezwarunkowo (`<ThingDialog open={false}>`) pobiera się na każdej stronie tak samo
   jak przy zwykłym imporcie. Odroczenie daje dopiero warunek montażu.
2. **Zamknięcie idzie przez `onOpenChange`, nie przez własny `onClick`.** Escape i kliknięcie w tło
   mają tylko tę jedną drogę. Handler ignorujący argument (`() => setOpen(false)`) wygląda na
   działający i rozjeżdża stan przy każdym zamknięciu spoza przycisku — to najczęstszy błąd w tym
   wzorcu.

### Cena — dwie rzeczy, obie zmierzone

**Nie ma animacji zamknięcia.** Sprawdzone w przeglądarce na buildzie produkcyjnym:

| Wariant                   | Stan DOM zaraz po Escape                           |
| ------------------------- | -------------------------------------------------- |
| `{isOpen && <Dialog>}`    | element zniknął w tej samej klatce                 |
| okno zamontowane na stałe | element zostaje z `data-closed`, przejście się gra |

Animacja wejścia działa w obu wariantach. Jeśli któreś okno musi domykać się płynnie, trzymaj je
zamontowane po pierwszym otwarciu (dodatkowa flaga, która nie wraca do `false`).

**Pobranie chunku startuje z kliknięciem**, więc między kliknięciem a oknem jest przerwa. Na szybkim
łączu niezauważalna, na wolnym widoczna. Podgrzanie chunku na `onPointerEnter` i `onFocus` przycisku
(`void import('…')`) pomaga myszy i klawiaturze, nie pomaga dotykowi. W testach e2e ta przerwa
oznacza, że po kliknięciu trzeba **poczekać na treść okna** — metody nieczekające (`allInnerTexts`)
odczytają pustkę.

### Ile to daje

Zmierzone na stronie głównej startera, build produkcyjny, sumy z Resource Timing, dwa lekkie okna:

| Metryka                  |     Przed |        Po |      Różnica |
| ------------------------ | --------: | --------: | -----------: |
| transfer (po gzipie)     | 444 127 B | 440 764 B |  **−3,4 kB** |
| do sparsowania (decoded) | 1 487 440 | 1 471 116 | **−16,3 kB** |
| plików JS przy starcie   |        20 |        23 |           +3 |

**Czytaj to uczciwie: −0,76% transferu to mało**, a trzy żądania więcej zjadają część oszczędności
na wolnym łączu. Dla lekkich okien zmiana jest na granicy szumu. Konwencja ma sens mimo to, bo
kosztuje dwie linie, a zysk rośnie z wagą okna — pierwsze okno z podpisem, edytorem tekstu, mapą
albo wykresem to setki kilobajtów, których większość odwiedzających nigdy nie uruchomi. **Nie licz
na to, że ten wzorzec sam z siebie poprawi wynik Lighthouse'a.**

Konwencję da się wyegzekwować testem skanującym źródła: moduł o nazwie `*-dialog.tsx` poza
katalogiem prymitywów nie może być nigdzie zaimportowany statycznie. Bez strażnika łamie się cicho —
nie ma błędu kompilacji ani ostrzeżenia lintu, jest tylko większy bundle.

---

## 8. Testy, bez których to psuje się po cichu

Cała ta warstwa ma tę własność, że **wygląda i działa tak samo, gdy jest zepsuta**. Stąd lista
strażników:

| Co pilnuje                                          | Dlaczego nie wystarczy oko                                     |
| --------------------------------------------------- | -------------------------------------------------------------- |
| skrypt startowy i odczyt zgody dają ten sam werdykt | rozjazd daje mignięcie banera albo baner znikający po hydracji |
| baner jest w HTML-u z serwera                       | brak = cichy powrót problemu z LCP                             |
| baner przykrywa treść i blokuje przewijanie         | regresja wygląda jak „baner trochę inaczej wygląda"            |
| po decyzji strona wraca do przewijania              | zostawiona blokada unieruchamia całą stronę                    |
| fokus krąży wewnątrz banera                         | widoczne wyłącznie z klawiatury                                |
| tło banera jest `inert`                             | słyszalne wyłącznie z czytnikiem ekranu                        |
| po decyzji `inert` znika z rodzeństwa               | zostawiony unieruchamia stronę przy niewidocznym już banerze   |
| okna zgód NIE dziedziczą `inert`                    | odcięłoby jedyną drogę do odmowy zgody                         |
| baner ma dokładnie dwa przyciski                    | trzeci albo brak „Ustawień" zmienia sytuację prawną            |
| okno polityki ma tę samą treść co strona            | rozjazd jest usterką prawną                                    |
| żadne okno nie jest importowane statycznie          | brak błędu, brak ostrzeżenia, tylko większy bundle             |
| sygnały Consent Mode trafiają do `dataLayer`        | testy jednostkowe nie widzą, czy sygnał dotarł i kiedy         |

**Fixture do testów e2e:** baner jest modalem blokującym, więc **domyślnie zaziarnij zapisaną zgodę
przed załadowaniem strony** (`addInitScript`). Bez tego modal przykrywa stronę i żaden inny test
niczego nie kliknie. Pliki oglądające sam baner wyłączają zaziarnienie u siebie. Zapisuj zgodę z
wszystkim wyłączonym poza niezbędnym — najostrożniejszy stan, w którym żaden test nie odziedziczy
przypadkiem włączonych tagów.

---

## 9. Checklista wdrożenia

- [ ] Decyzja o przycisku odrzucenia podjęta i zapisana w kodzie jako komentarz z uzasadnieniem
- [ ] Baner ma `aria-describedby`, a jego tło `inert` — i jedno i drugie znika po decyzji
- [ ] `/polityka-prywatnosci` istnieje i ma treść — bez niej zgoda jest wadliwa prawnie
- [ ] Skrypt startowy w `<head>`, przed kontenerem tagów
- [ ] Klasy `consent-pending` i `no-js` w HTML-u z serwera, zdejmowane przez skrypty
- [ ] Kontener banera bez klasy `display`
- [ ] Domyślna odmowa wysłana do Consent Mode zanim kontener zdąży odpalić tagi
- [ ] Wersja zgody (`CONSENT_VERSION`) podbijana przy każdym rozszerzeniu zakresu danych
- [ ] Link „Ustawienia cookies" w stopce
- [ ] Opisy kategorii dopasowane do tego, co faktycznie robi Twój kontener
- [ ] Kontrast par tokenów sprawdzony w obu motywach
- [ ] Pakiet e2e z zaziarnioną zgodą przechodzi

---

## 10. Czego nie robić

- Nie renderuj banera warunkowo po odczycie `localStorage`.
- Nie ustawiaj `overflow` na `<body>` z poziomu efektu.
- Nie chowaj banera na czas otwartego okna.
- Nie zakładaj klasy `display` na kontener banera.
- Nie rezerwuj miejsca pod baner `ResizeObserverem` — to była poprzednia wersja i to ona dawała CLS
  0,064.
- Nie podpinaj pod `onOpenChange` funkcji ignorującej argument.
- Nie ufaj `window.scrollTo` w teście blokady przewijania.
- Nie wstawiaj wymyślonej treści polityki prywatności — wygląda na gotową i ktoś ją wypuści.
