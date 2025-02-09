"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  useMemo,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import DayCell from "../components/DayCell";

interface DayInfo {
  dayNumber: number;
  isHoliday: boolean;
  isSaturday: boolean;
  isSunday: boolean;
  isSelected: boolean;
}

interface MonthRow {
  monthName: string;
  days: DayInfo[];
  offset: number;
}

type PublicHolidays = Array<[number, number]>;

const MONTH_NAMES_PL: string[] = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

const WEEKDAY_LABELS_PL: string[] = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"];

const DAY_COLUMNS_COUNT = 37;

const getPublicHolidays = (year: number): PublicHolidays => {
  const holidays: PublicHolidays = [];

  holidays.push([1, 0]);
  holidays.push([6, 0]);
  holidays.push([1, 4]);
  holidays.push([3, 4]); 
  holidays.push([15, 7]);
  holidays.push([1, 10]); 
  holidays.push([11, 10]);
  holidays.push([25, 11]); 
  holidays.push([26, 11]); 

  const easterSunday = computeEasterSunday(year);
  const easterMonthIndex = easterSunday.getMonth();
  const easterDayNumber = easterSunday.getDate();

  holidays.push([easterDayNumber, easterMonthIndex]);

  const easterMonday = new Date(year, easterMonthIndex, easterDayNumber + 1);
  holidays.push([easterMonday.getDate(), easterMonday.getMonth()]);

  const corpusChristi = new Date(year, easterMonthIndex, easterDayNumber + 60);
  holidays.push([corpusChristi.getDate(), corpusChristi.getMonth()]);

  return holidays;
};


/**
 * Liczy datę Wielkanocy wg algorytmu Meeusa (lub Gaussa) dla zachodniego obrządku.
 * Zwraca obiekt Date, który jest niedzielą wielkanocną.
 */

const computeEasterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
};

export default function CalendarPage() {
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [data, setData] = useState<MonthRow[]>([]);

  const getDaysInMonth = useCallback(
    (year: number, monthIndex: number): number =>
      new Date(year, monthIndex + 1, 0).getDate(),
    []
  );

  const getFirstDayOffset = useCallback(
    (year: number, monthIndex: number): number =>
      new Date(year, monthIndex, 1).getDay(),
    []
  );

  const generateDataForYear = useCallback(
    (year: number): MonthRow[] => {
      const rows: MonthRow[] = [];
      const publicHolidays = getPublicHolidays(year);

      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthName = MONTH_NAMES_PL[monthIndex];
        const offset = getFirstDayOffset(year, monthIndex);
        const daysInThisMonth = getDaysInMonth(year, monthIndex);

        const days: DayInfo[] = [];
        for (let dayNumber = 1; dayNumber <= daysInThisMonth; dayNumber++) {
          const weekday = new Date(year, monthIndex, dayNumber).getDay();
          const isSunday = weekday === 0;
          const isSaturday = weekday === 6;
          let isHoliday = false;

          if (!isSunday && !isSaturday) {
            if (
              publicHolidays.some(
                ([d, m]) => d === dayNumber && m === monthIndex
              )
            ) {
              isHoliday = true;
            }
          }

          days.push({
            dayNumber,
            isSaturday,
            isSunday,
            isSelected: false,
            isHoliday,
          });
        }
        rows.push({ monthName, days, offset });
      }
      return rows;
    },
    [getDaysInMonth, getFirstDayOffset]
  );

  useEffect(() => {
    setData(generateDataForYear(selectedYear));
  }, [selectedYear, generateDataForYear]);

  // Wywoływany przy opuszczeniu pola input (onBlur). 
  //Jeśli wpisany rok jest mniejszy niż 1000 lub większy niż 9999, ustawia wartość graniczną (odpowiednio 1000 lub 9999) i aktualizuje stan.
  const handleYearChangeBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let newYear = Number(e.target.value);
      if (newYear < 1000) newYear = 1000;
      else if (newYear > 9999) newYear = 9999;
      setSelectedYear(newYear);
    },
    []
  );
  // Obsługuje zmianę wartości w polu input, gdy użytkownik wpisuje nowy rok. Jeśli wpisany rok mieści się w zakresie 1000–9999, aktualizuje stan wybranego roku.
  const handleYearChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newYear = Number(e.target.value);
      if (newYear >= 1000 && newYear <= 9999) setSelectedYear(newYear);
    },
    []
  );

  //Obsługuje kliknięcie w komórkę kalendarza. Przełącza stan zaznaczenia (`isSelected`) dla klikniętego dnia, 

  const onDayClick = useCallback(
    (
      rowIndex: number,
      colIndex: number,
      e: React.MouseEvent<HTMLDivElement>
    ) => {
      e.stopPropagation();
      setData((prev) =>
        prev.map((month, mIndex) => {
          if (mIndex !== rowIndex) return month;

          const dayNumber = colIndex - month.offset + 1;
          if (dayNumber < 1 || dayNumber > month.days.length) return month;

          return {
            ...month,
            days: month.days.map((day, dIndex) =>
              dIndex === dayNumber - 1
                ? { ...day, isSelected: !day.isSelected }
                : day
            ),
          };
        })
      );
    },
    []
  );

  const columns = useMemo<ColumnDef<MonthRow>[]>(() => {
      const firstColumn: ColumnDef<MonthRow> = {
        header: "Miesiąc",
        id: "monthName",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-left pl-2 pr-4">
            {row.original.monthName}
          </span>
        ),
      };

    const dayColumnsWithNull: (ColumnDef<MonthRow> | null)[] = Array.from(
      { length: DAY_COLUMNS_COUNT },
      (_, colIndex) => {
        const columnHasData = data.some((row) => {
          const dayNumber = colIndex - row.offset + 1;
          return dayNumber >= 1 && dayNumber <= row.days.length;
        });
        if (!columnHasData) return null;

        return {
          header: WEEKDAY_LABELS_PL[colIndex % 7],
          id: `day-col-${colIndex}`,
          cell: ({ row }) => {
            const { offset, days } = row.original;
            const dayNumber = colIndex - offset + 1;
            if (dayNumber < 1 || dayNumber > days.length) return null;
            const dayInfo = days[dayNumber - 1];
            return (
              <DayCell
                dayInfo={dayInfo}
                rowIndex={row.index}
                colIndex={colIndex}
                onDayClick={onDayClick}
              />
            );
          },
        };
      }
    );

    const dayColumns: ColumnDef<MonthRow>[] = dayColumnsWithNull.filter(
      (col): col is ColumnDef<MonthRow> => col !== null
    );

    return [firstColumn, ...dayColumns];
  }, [onDayClick, data]);

  const table = useReactTable<MonthRow>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Dane kalendarza są prezentowane w tabeli za pomocą biblioteki `@tanstack/react-table`. Do renderowania poszczególnych komórek wykorzystywany jest komponent `DayCell`.
  
  return (
    <div className="h-[100vh] w-[100vw] flex justify-center flex-col">
      <div className="mb-4 flex gap-2 ml-12">
        <div className="w-26 h-10">
          <label className="font-semibold">Wybierz rok</label>
          <p className="text-[70%] text-gray-500 w-full flex justify-center">
            (rok powinien być 4-cyfrowy)
          </p>
        </div>
        <input
          type="number"
          placeholder="Wprowadź liczbę"
          className="border border-gray-300 rounded p-2"
          onBlur={handleYearChangeBlur}
          onChange={handleYearChange}
          defaultValue={new Date().getFullYear()}
          minLength={4}
          maxLength={4}
        />
      </div>
      <div className="overflow-auto ml-12">
        <table className="min-w-max border-collapse border border-gray-200">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border border-gray-200 px-3 py-2 text-center"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border border-gray-200 p-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
