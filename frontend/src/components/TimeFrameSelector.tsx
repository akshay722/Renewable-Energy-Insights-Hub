import React from "react";
import { useDateRange, TimeFrame } from "../context/DateRangeContext";
import DateRangePicker from "./DateRangePicker";

const TimeFrameSelector: React.FC = ({}) => {
  const { timeFrame, setTimeFrame, startDate, endDate, setDateRange } =
    useDateRange();

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setDateRange(newStartDate, newEndDate);
  };

  return (
    <div className="flex flex-col md:flex-row items-end gap-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Time Frame</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTimeFrame(TimeFrame.TODAY)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              timeFrame === TimeFrame.TODAY
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFrame(TimeFrame.LAST_7_DAYS)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              timeFrame === TimeFrame.LAST_7_DAYS
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeFrame(TimeFrame.LAST_30_DAYS)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              timeFrame === TimeFrame.LAST_30_DAYS
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeFrame(TimeFrame.LAST_90_DAYS)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              timeFrame === TimeFrame.LAST_90_DAYS
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
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
