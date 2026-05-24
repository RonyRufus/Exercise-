import React from "react";
import { LoggedRepRecord } from "../types";
import { BarChart, Calendar, Trophy, Flame } from "lucide-react";

interface HistoryChartProps {
  records: LoggedRepRecord[];
  dailyGoal: number;
}

export default function HistoryChart({ records, dailyGoal }: HistoryChartProps) {
  // Generate the past 7 dates beautifully
  const getPastNDays = (numDays: number) => {
    const dates = [];
    const now = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dates.push(d);
    }
    return dates;
  };

  const pastSevenDays = getPastNDays(7);

  // Parse YYYY-MM-DD from Date objects to compare safely
  const getLocalDateString = (dateObj: Date) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Group records by day
  const repsPerDay = pastSevenDays.map((date) => {
    const key = getLocalDateString(date);
    
    // Sum of reps matching this day
    const dayTotal = records.reduce((acc, item) => {
      const itemDate = getLocalDateString(new Date(item.timestamp));
      if (itemDate === key) {
        return acc + item.amount;
      }
      return acc;
    }, 0);

    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumeric = date.getDate();

    return {
      dateString: key,
      dayName,
      dayNumeric,
      total: dayTotal,
      goalReached: dayTotal >= dailyGoal && dailyGoal > 0,
    };
  });

  // Calculate highest rep amount to scale the bars proportional to 100% height
  const maxRepRecorded = Math.max(...repsPerDay.map((d) => d.total), dailyGoal, 100);

  // Calculate streaks! (How many consecutive days including today or yesterday we met the daily goal)
  const calculateStreak = () => {
    let streakCount = 0;
    // Check consecutive days starting backwards from today
    const reverseDays = [...repsPerDay].reverse();
    
    // In case the user hasn't completed today's goal yet, checkout if they completed yesterday's
    // to keep the active streak alive.
    const todayStr = getLocalDateString(new Date());
    const isTodayCompleted = repsPerDay.find((d) => d.dateString === todayStr)?.total ?? 0 >= dailyGoal;

    let checkStartIndex = 0;

    // If today is not completed yet, start streak check from yesterday (index 1) to allow grace period
    if (!isTodayCompleted) {
      const todayTotal = repsPerDay.find((d) => d.dateString === todayStr)?.total ?? 0;
      if (todayTotal > 0) {
        // Did some reps today but didn't hit goal yet, starting check from today as possible streak builder
        checkStartIndex = 0;
      } else {
        // Today is empty, begin check from yesterday
        checkStartIndex = 1;
      }
    }

    for (let i = checkStartIndex; i < reverseDays.length; i++) {
      if (reverseDays[i].total >= dailyGoal && dailyGoal > 0) {
        streakCount++;
      } else {
        break;
      }
    }
    return streakCount;
  };

  const currentStreak = calculateStreak();

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-display text-sm uppercase tracking-[0.2em] font-semibold text-neutral-400">
              PERFORMANCE METRICS
            </h2>
            <p className="text-[11px] text-neutral-600 tracking-wider">7-day strength and pace audit</p>
          </div>

          <div className="flex gap-2 items-center bg-neutral-900 border border-neutral-850 px-3.5 py-1.5 rounded-xl">
            <span className="text-neutral-500 font-mono text-[9px] tracking-wider uppercase">Streak record</span>
            <span className="font-mono text-xs font-bold text-blue-400 flex items-center gap-1">
              <Trophy size={12} className="text-blue-500" />
              {currentStreak} {currentStreak === 1 ? "DAY" : "DAYS"}
            </span>
          </div>
        </div>

        {/* Minimal Bar Chart Container */}
        <div className="h-60 flex items-end justify-between gap-2.5 px-2 pt-6 relative border-b border-neutral-900">
          
          {/* Target line indicator across the chart */}
          <div 
            className="absolute left-0 w-full border-t border-dashed border-blue-500/15 z-0 flex justify-end"
            style={{ 
              bottom: `${(dailyGoal / maxRepRecorded) * 100}%`,
              transform: 'translateY(-50%)'
            }}
          >
            <span className="bg-neutral-950 text-blue-400 text-[10px] px-2 py-0.5 rounded -mt-2.5 mr-2 font-mono border border-neutral-900 tracking-widest uppercase">
              TARGET: {dailyGoal}
            </span>
          </div>

          {repsPerDay.map((day) => {
            const barHeightPercent = maxRepRecorded > 0 ? (day.total / maxRepRecorded) * 100 : 0;
            const isToday = getLocalDateString(new Date()) === day.dateString;

            return (
              <div 
                key={day.dateString} 
                className="flex-1 flex flex-col items-center h-full justify-end group z-10"
              >
                {/* Popover tooltip showing reps count on hover */}
                <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all duration-150 transform scale-95 group-hover:scale-100 select-none pointer-events-none z-20">
                  <span className="bg-neutral-900 font-mono text-[10px] font-bold text-white px-2 py-1 rounded-md border border-neutral-855 shadow-md">
                    {day.total}
                  </span>
                </div>

                {/* Animated Column Bar */}
                <div className="w-full flex justify-center h-full items-end pb-1">
                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 relative flex items-end justify-center ${
                      day.goalReached
                        ? "bg-blue-500 hover:bg-blue-400 text-black"
                        : day.total > 0
                        ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-350"
                        : "bg-neutral-900/15 hover:bg-neutral-900/30"
                    } ${isToday ? "ring-1.5 ring-blue-500/50" : ""}`}
                    style={{ height: `${Math.max(barHeightPercent, 4)}%` }} // minimum 4% so can be clicked/hovered
                  >
                    {day.goalReached && (
                      <span className="text-[9px] pb-1 font-bold font-mono">✓</span>
                    )}
                  </div>
                </div>

                {/* Day Labels */}
                <div className="text-center mt-2 pt-1 font-mono">
                  <div className={`text-[10px] leading-none tracking-wider ${isToday ? "text-blue-400 font-bold" : "text-neutral-600"}`}>
                    {day.dayName.toUpperCase()}
                  </div>
                  <div className={`text-xs mt-1 leading-none ${isToday ? "text-white font-semibold" : "text-neutral-450"}`}>
                    {day.dayNumeric}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-stone-500" />
          <span>Last updated: just now</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Goal Met
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-700" /> Logged
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-800/40" /> Empty
          </span>
        </div>
      </div>
    </div>
  );
}
