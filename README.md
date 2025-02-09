# Kalendarz App

## Wprowadzenie

**Kalendarz App** to interaktywna aplikacja kalendarza stworzona przy użyciu Next.js, React, Tailwind CSS oraz @tanstack/react-table. Aplikacja umożliwia:

- Wybór roku (od 1000 do 9999)
- Dynamiczną generację kalendarza z oznaczaniem dni (np. weekendów i świąt)
- Optymalizację renderowania dzięki memoizacji i użyciu hooków (useMemo, useCallback, React.memo)
- Automatyczne ukrywanie kolumn, dla których żaden miesiąc nie posiada danych

## Instalacja i Uruchomienie

Aby zainstalować i uruchomić aplikację, wykonaj następujące kroki:

1. Zainstaluj zależności:

npm i

2. Uruchom aplikację:

Aplikacja będzie dostępna pod adresem: [http://localhost:3000](http://localhost:3000).


## Opis funkcji i komponentów

### Komponent: DayCell.tsx

- **Opis:**  
  Komponent renderuje pojedynczą komórkę kalendarza.

- **Props:**
  - **dayInfo:** Obiekt zawierający informacje o dniu, w tym:
    - Numer dnia
    - Informację, czy dzień jest świętem
    - Informację, czy dzień jest sobotą lub niedzielą
    - Informację, czy dzień został zaznaczony
  - **rowIndex:** Indeks wiersza (miesiąca) w tabeli.
  - **colIndex:** Indeks kolumny w tabeli.
  - **onDayClick:** Funkcja wywoływana przy kliknięciu w komórkę.

- **Zachowanie:**  
  Komponent ustawia odpowiednie style (np. tło i kolor tekstu) w zależności od stanu przekazanego w obiekcie dayInfo. Po kliknięciu wywołuje funkcję onDayClick z odpowiednimi indeksami, umożliwiając przełączenie stanu zaznaczenia danego dnia.

### Komponent: CalendarPage.tsx (lub page.tsx)

- **Opis:**  
  Główny komponent aplikacji, odpowiedzialny za generowanie i wyświetlanie kalendarza.

- **Funkcje pomocnicze:**

  - **getDaysInMonth(year, monthIndex):**  
    Zwraca liczbę dni w danym miesiącu dla określonego roku. Umożliwia dynamiczne określenie długości miesiąca.

  - **getFirstDayOffset(year, monthIndex):**  
    Zwraca przesunięcie pierwszego dnia miesiąca (dzień tygodnia). Pomaga w prawidłowym wyrównaniu dni w widoku kalendarza.

  - **computeEasterSunday(year):**  
    Oblicza datę Wielkanocy dla podanego roku. Wynik jest wykorzystywany przy generowaniu listy świąt publicznych.
    W obliczeniach wykorzystany został algorytm Meeusa/Jonesa/Butchera (znany również jako Anonymous Gregorian algorithm), który precyzyjnie oblicza datę Wielkanocy w kalendarzu gregoriańskim.

  - **getPublicHolidays(year):**  
    Zwraca tablicę świąt publicznych dla danego roku, w tym święta związane z Wielkanocą. Umożliwia oznaczenie świąt w kalendarzu.

  - **generateDataForYear(year):**  
    Generuje strukturę danych kalendarza dla całego roku. Dla każdego miesiąca tworzy obiekt zawierający:
    - Nazwę miesiąca
    - Tablicę obiektów DayInfo (dla poszczególnych dni)
    - Przesunięcie pierwszego dnia miesiąca  
    Funkcja ta przygotowuje dane do renderowania tabeli kalendarza.

- **Handlery:**

  - **handleYearChange(e):**  
    Obsługuje zmianę wartości w polu input, gdy użytkownik wpisuje nowy rok. Jeśli wpisany rok mieści się w zakresie 1000–9999, aktualizuje stan wybranego roku.

  - **handleYearChangeBlur(e):**  
    Wywoływany przy opuszczeniu pola input (onBlur). Jeśli wpisany rok jest mniejszy niż 1000 lub większy niż 9999, ustawia wartość graniczną (odpowiednio 1000 lub 9999) i aktualizuje stan.

  - **onDayClick(rowIndex, colIndex, e):**  
    Obsługuje kliknięcie w komórkę kalendarza. Przełącza stan zaznaczenia (isSelected) dla klikniętego dnia, aktualizując stan w sposób niemutowalny. Funkcja ta zatrzymuje propagację zdarzenia, aby uniknąć wielokrotnego wywoływania.

- **Generowanie kolumn:**  
  Komponent tworzy kolumny tabeli kalendarza przy użyciu memoizacji (useMemo). Dla każdej kolumny sprawdzane jest, czy przynajmniej jeden miesiąc posiada dane dla danej kolumny. Jeśli nie – kolumna jest pomijana.

- **Renderowanie:**  
  Dane kalendarza są prezentowane w tabeli za pomocą biblioteki @tanstack/react-table. Do renderowania poszczególnych komórek wykorzystywany jest komponent DayCell.

