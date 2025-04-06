import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { format, subDays } from "date-fns";

// Time frame options
export enum TimeFrame {
  LAST_7_DAYS = "last_7_days",
  LAST_30_DAYS = "last_30_days",
  LAST_90_DAYS = "last_90_days",
  LAST_YEAR = "last_year",
  TODAY = "today",
  CUSTOM = "custom",
}

interface DateRangeContextType {
  startDate: string;
  endDate: string;
  timeFrame: TimeFrame;
  setDateRange: (startDate: string, endDate: string) => void;
  setTimeFrame: (timeFrame: TimeFrame) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(
  undefined
);

export const DateRangeProvider = ({ children }: { children: ReactNode }) => {
  // Set default time frame
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.LAST_30_DAYS);

  // Initialize dates
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);

  // Set default date range to last 30 days
  const [startDate, setStartDate] = useState(
    format(thirtyDaysAgo, "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));

  // Update dates when timeFrame changes
  useEffect(() => {
    const today = new Date();
    let start: Date;

    switch (timeFrame) {
      case TimeFrame.LAST_7_DAYS:
        start = subDays(today, 7);
        break;
      case TimeFrame.LAST_30_DAYS:
        start = subDays(today, 30);
        break;
      case TimeFrame.LAST_90_DAYS:
        start = subDays(today, 90);
        break;
      case TimeFrame.LAST_YEAR:
        start = subDays(today, 365);
        break;
      case TimeFrame.TODAY:
        // Set both start and end to today to show just today's data
        start = today;
        break;
      case TimeFrame.CUSTOM:
        // Don't update dates for custom range
        return;
      default:
        start = subDays(today, 30);
    }

    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(today, "yyyy-MM-dd"));

    // Save to localStorage
    localStorage.setItem(
      "dateRange",
      JSON.stringify({
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(today, "yyyy-MM-dd"),
        timeFrame,
      })
    );
  }, [timeFrame]);

  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setTimeFrame(TimeFrame.CUSTOM);

    // Save to localStorage so date range persists after refresh
    localStorage.setItem(
      "dateRange",
      JSON.stringify({
        startDate: start,
        endDate: end,
        timeFrame: TimeFrame.CUSTOM,
      })
    );
  };

  // Load date range from localStorage on mount
  useEffect(() => {
    const savedDateRange = localStorage.getItem("dateRange");
    if (savedDateRange) {
      try {
        const {
          startDate: savedStart,
          endDate: savedEnd,
          timeFrame: savedTimeFrame,
        } = JSON.parse(savedDateRange);
        setStartDate(savedStart);
        setEndDate(savedEnd);
        if (savedTimeFrame) {
          setTimeFrame(savedTimeFrame);
        }
      } catch (error) {
        console.error("Error parsing saved date range:", error);
      }
    }
  }, []);

  return (
    <DateRangeContext.Provider
      value={{
        startDate,
        endDate,
        timeFrame,
        setDateRange,
        setTimeFrame,
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = (): DateRangeContextType => {
  const context = useContext(DateRangeContext);

  if (context === undefined) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }

  return context;
};
