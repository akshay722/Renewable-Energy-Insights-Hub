import React from "react";
import { useDateRange, TimeFrame } from "../context/DateRangeContext";
import DateRangePicker from "./DateRangePicker";

const TimeFrameSelector: React.FC = () => {
  const { timeFrame, setTimeFrame, startDate, endDate, setDateRange } =
    useDateRange();

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setDateRange(newStartDate, newEndDate);
  };

  return (
    <div className="flex flex-col md:flex-row items-end gap-4">
      <div>
        <h3
          className="text-sm font-medium mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Time Frame
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTimeFrame(TimeFrame.LAST_7_DAYS)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              timeFrame === TimeFrame.LAST_7_DAYS
                ? "bg-primary text-white"
                : ""
            }`}
            style={
              timeFrame !== TimeFrame.LAST_7_DAYS 
                ? { backgroundColor: 'var(--color-background-dark)', color: 'var(--color-text)' }
                : {}
            }
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeFrame(TimeFrame.LAST_30_DAYS)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              timeFrame === TimeFrame.LAST_30_DAYS
                ? "bg-primary text-white"
                : ""
            }`}
            style={
              timeFrame !== TimeFrame.LAST_30_DAYS 
                ? { backgroundColor: 'var(--color-background-dark)', color: 'var(--color-text)' }
                : {}
            }
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeFrame(TimeFrame.LAST_90_DAYS)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              timeFrame === TimeFrame.LAST_90_DAYS
                ? "bg-primary text-white"
                : ""
            }`}
            style={
              timeFrame !== TimeFrame.LAST_90_DAYS
                ? { backgroundColor: 'var(--color-background-dark)', color: 'var(--color-text)' }
                : {}
            }
          >
            Last 90 Days
          </button>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeFrameSelector;
