import React from "react";

interface DayCellProps {
  dayInfo: {
    dayNumber: number;
    isHoliday: boolean;
    isSaturday: boolean;
    isSunday: boolean;
    isSelected: boolean;
  };
  rowIndex: number;
  colIndex: number;
  onDayClick: (
    rowIndex: number,
    colIndex: number,
    e: React.MouseEvent<HTMLDivElement>
  ) => void;
}

// ten komponent generuje komórkę tabeli

const DayCell: React.FC<DayCellProps> = React.memo(
  ({ dayInfo, rowIndex, colIndex, onDayClick }) => {
    let bg = "bg-transparent";
    let text = "text-black";

    if (dayInfo.isSelected) {
      bg = "bg-gray-600";
      text = "text-white";
    } else if (dayInfo.isSaturday) {
      bg = "bg-gray-300";
    } else if (dayInfo.isSunday || dayInfo.isHoliday) {
      bg = "bg-red-500";
    }

    return (
      <div
        className={`cursor-pointer text-center p-2 h-full w-full ${bg} ${text}`}
        onClick={(e) => onDayClick(rowIndex, colIndex, e)}
      >
        {dayInfo.dayNumber}
      </div>
    );
  }
);

export default DayCell;
