import React, { useState, useEffect } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (newStartDate: string, newEndDate: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  // Keep local state in sync with props
  useEffect(() => {
    setStart(startDate);
  }, [startDate]);

  useEffect(() => {
    setEnd(endDate);
  }, [endDate]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStart(newStart);
    onDateChange(newStart, end);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setEnd(newEnd);
    onDateChange(start, newEnd);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={start}
        onChange={handleStartDateChange}
        className="border border-gray-300 rounded-md p-2"
        style={{
          color: "var(--color-text)",
          backgroundColor: "var(--color-card-bg)",
        }}
      />
      <span>to</span>
      <input
        type="date"
        value={end}
        onChange={handleEndDateChange}
        className="border border-gray-300 rounded-md p-2"
        style={{
          color: "var(--color-text)",
          backgroundColor: "var(--color-card-bg)",
        }}
      />
    </div>
  );
};

export default DateRangePicker;
