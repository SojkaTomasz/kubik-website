# SEO: słowa kluczowe na stronach

Źródło: `../analiza słów.pdf` (Google Keyword Planner, 2 404 frazy). Liczby to wyszukania
miesięcznie w Polsce. Zasada: jedna fraza główna, warianty w nagłówkach i treści strony usługi,
pytania problemowe w FAQ. Frazy muszą brzmieć naturalnie, bez upychania.

## Mapa fraz na strony

| Fraza                                         | Wyszukań | Gdzie jest                                                                                               |
| --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| frezowanie pod ogrzewanie podłogowe           | 5 000    | adres i H1 usługi, H1 i lead każdej strony miasta, title, H2 teasera usługi na głównej, title realizacji |
| frezowane ogrzewanie podłogowe                | 500      | nad H1 na głównej (w kodzie część H1), stopka, nazwa firmy                                               |
| ogrzewanie podłogowe frezowane                | 500      | title i description głównej, H2 „Czy u mnie się da" na usłudze                                           |
| frezowanie wylewki pod ogrzewanie podłogowe   | 500      | lead głównej („Frezujemy wylewkę pod ogrzewanie podłogowe…”)                                             |
| frezowanie wylewki                            | 500      | H2 „Jak to działa”, tytuł kroku 2, treść sekcji                                                          |
| frezowanie posadzki (pod ogrzewanie)          | 500      | H2 „Jak to działa”, opis kroku 2, lead usługi                                                            |
| frezowanie posadzki betonowej                 | 500      | „Jak to działa” („frezujemy posadzkę betonową i anhydrytową”)                                            |
| frezowanie pod podłogówkę                     | 500      | H2 ceny („Frezowanie pod podłogówkę: cena za m²”)                                                        |
| … cena / cena za m2                           | 500      | H2 ceny, description usługi                                                                              |
| ogrzewanie podłogowe w istniejącej wylewce    | 50       | lead usługi (dosłownie)                                                                                  |
| ogrzewanie podłogowe w starym domu            | 500      | H2 i akapit „Kim jesteśmy” na głównej, FAQ                                                               |
| ogrzewanie podłogowe w bloku                  | 500      | H2 i akapit „Kim jesteśmy” na głównej, FAQ                                                               |
| modernizacja ogrzewania w starym domu         | 50       | FAQ usługi                                                                                               |
| frezowanie … cena za m2                       | 500      | H2 ceny, description usługi, FAQ („Ile kosztuje … za m²?”)                                               |
| podłogówka czy grzejniki                      | 500      | FAQ                                                                                                      |
| podłogówka / ogrzewanie podłogowe z grzejnika | 500      | FAQ                                                                                                      |
| pompa ciepła ogrzewanie podłogowe             | 500      | FAQ, lead strony miasta                                                                                  |
| ogrzewanie podłogowe wady i zalety            | 500      | FAQ                                                                                                      |
| frezowanie pod ogrzewanie podłogowe + miasto  | 50+      | H1, title i adres każdej strony miasta                                                                   |

**Nie używamy** fraz „frezarka do…”, „maszyna do frezowania…”. To ruch osób kupujących maszynę (przy
reklamach Google: wykluczyć od pierwszego dnia).

## Tytuły i opisy (do `metadata` w Next.js)

| Strona                                        | title                                                              | description                                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                           | Frezowane ogrzewanie podłogowe bez skuwania · Kubik                | Ogrzewanie podłogowe frezowane w wylewce, którą już masz. 50 m² w jeden dzień, bez kurzu. 5,0 w Google, 70+ opinii. Cała Polska. |
| `/frezowanie-pod-ogrzewanie-podlogowe`        | Frezowanie pod ogrzewanie podłogowe: cena, przebieg · Kubik        | Frezowanie wylewki pod ogrzewanie podłogowe bez skuwania. Sprawdź, od czego zależy cena za m², i zamów darmową wycenę.           |
| `/frezowanie-pod-ogrzewanie-podlogowe/krakow` | Frezowanie pod ogrzewanie podłogowe Kraków · Kubik                 | Frezowanie pod ogrzewanie podłogowe w Krakowie: bloki, kamienice i domy, bez podnoszenia podłogi. Darmowa wycena.                |
| `/realizacje`                                 | Realizacje: frezowane ogrzewanie podłogowe · Kubik                 | 12 podłóg z metrażem, rodzajem wylewki i czasem pracy. Zdjęcia z prawdziwych budów.                                              |
| `/realizacje/<miasto>-<metraż>m2`             | Frezowanie pod ogrzewanie podłogowe, <Miasto>, <metraż> m² · Kubik | Przebieg frezowania wylewki pod ogrzewanie podłogowe: <obiekt>, <metraż> m², <czas>.                                             |
| `/kontakt`                                    | Kontakt i darmowa wycena · Kubik                                   | Zadzwoń: 507 125 794, całą dobę. Albo zostaw numer, oddzwonimy z ceną.                                                           |

## H1

- Główna: w kodzie jeden `<h1>` z dwiema częściami: mały nadtytuł „Frezowane ogrzewanie podłogowe” i
  duże „Ciepła podłoga bez skuwania posadzki.”. Wygląd bez zmian, fraza w H1.
- Usługa: „Frezowanie pod ogrzewanie podłogowe.”
- Miasto: „Frezowanie pod ogrzewanie podłogowe w <Mieście>.”

## Strony miast

Każda strona pisana osobno (dojazd, zabudowa, typowe wylewki, realizacje z okolicy). Nie kopiujemy
treści usługi 1:1. Lead każdego miasta otwiera się frazą główną z nazwą miasta, ale innym zdaniem —
powtórzony szablon to dokładnie słabość konkurencji (Twoja Ciepła Podłoga ma te same teksty pod
każdym miastem).

**Nadal do zrobienia:** sekcja „Jak to działa” i trzy pytania FAQ dociągane ze strony usługi są na
wszystkich miastach identyczne. Trzeba im dać lokalny wariant, inaczej strony miast zostają w części
duplikatami.

## FAQ: pytania pisane tak, jak ludzie pytają

Sama analiza fraz nie wystarcza. Planer podaje hasła („ogrzewanie podłogowe w starym domu”), a nie
pytania, więc 3.10.2026 przejrzałem to, co w tej branży pada w sieci: `forum.info-ogrzewanie.pl`,
poradniki o kosztach frezowania i porównania „czy warto”. Trzy rzeczy wyszły w KAŻDYM źródle i
żadnej z nich nie było wcześniej na stronie:

| Pytanie                               | Dlaczego jest ważne                                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Czy frezowanie nie osłabi wylewki?    | Najmocniejsza obiekcja. Na forum pada wprost: „obecna wylewka na 90% nie wytrzyma frezowania”                   |
| Ile kosztuje za m²?                   | Grupa o największej intencji zakupowej. Konkurencja publikuje widełki 30–100 zł, my odpowiadamy czynnikami ceny |
| Czy wystarczy jako jedyne ogrzewanie? | Pytanie wraca przy każdej dyskusji o pompie ciepła i o mieszkaniu narożnym                                      |

Dalej doszły: jakie podłogi można położyć (panele winylowe z atestem), czy da się mieszkać w domu w
czasie pracy. Pytania są sformułowane jak w wyszukiwarce („Czy warto robić…”, „Ile kosztuje…”, „Co
lepsze: …”), bo w tej formie trafiają do bloku „Podobne pytania” w Google.

**Pierwsze trzy pozycje FAQ usługi dociąga każda strona miasta** (`faq.slice(0, 3)`), dlatego stoją
tam pytania uniwersalne: stary dom, osłabienie wylewki, cena. Pytanie o blok jest dalej, żeby nie
dublowało lokalnego FAQ Krakowa, Warszawy i Torunia.

### Pytania bez odpowiedzi — do potwierdzenia z klientem

Te wracają w sieci równie często, ale odpowiedź wymaga wiedzy o tym, jak firma pracuje. Nie
wymyślamy jej:

- Czy przed frezowaniem skanujecie posadzkę, żeby nie przeciąć rury albo kabla? (w poradnikach to
  „błąd numer jeden”)
- Kto robi próbę ciśnieniową przed zalaniem rowków? Klient potwierdził 29.09.2026, że nie robi jej
  sam, więc trzeba napisać, czyja to rola
- Czy frezujecie w łazience i co z hydroizolacją oraz spadkami do odpływu?
- Jaki rozstaw rur stosujecie standardowo i jaka jest maksymalna długość pętli?
- Czy na robotę jest gwarancja i na jak długo?

## Dane strukturalne

`LocalBusiness` (nazwa, adres, telefon, NIP, obszar: Polska, ocena 5,0 / liczba opinii), `Service`
na stronie usługi, `FAQPage` na FAQ, `BreadcrumbList` na miastach i realizacjach.
