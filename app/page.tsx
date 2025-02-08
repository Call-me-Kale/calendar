"use client";

import React, {
  useState,
  useCallback,
  ChangeEvent,
  useMemo,
} from "react";


interface DayInfo {
  dayNumber: number;    
  isWeekend: boolean;  
  isSelected: boolean;  
}

interface MonthRow {
  monthName: string; 
  days: DayInfo[];   
  offset: number;  
}


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


export default function CalendarPage() {

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const [data, setData] = useState<MonthRow[]>([]);

  const getDaysInMonth = useCallback((year: number, monthIndex: number): number => {
    return new Date(year, monthIndex + 1, 0).getDate();
  }, []);


  const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  const possibleYears = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 9 }, (_, i) => current - 1 + i);
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Kalendarz {selectedYear}</h1>
      <div className="mb-4 flex items-center gap-2">
        <label className="font-semibold">Wybierz rok:</label>
        <select
          className="border border-gray-300 rounded p-1"
          value={selectedYear}
          onChange={handleYearChange}
        >
          {possibleYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}