import React, { useState, useEffect } from "react";
import { LoggedRepRecord } from "./types";
import Timer from "./components/Timer";
import RepTracker from "./components/RepTracker";
import HistoryChart from "./components/HistoryChart";
import { soundEngine } from "./components/AudioAlert";
import { Flame, Dumbbell, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

export default function App() {
  // State from LocalStorage
  const [records, setRecords] = useState<LoggedRepRecord[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(100);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);

  // Load state on mount safely
  useEffect(() => {
    try {
      const storedRecords = localStorage.getItem("REP_TRACKER_RECORDS");
      if (storedRecords) {
        setRecords(JSON.parse(storedRecords));
      }

      const storedGoal = localStorage.getItem("REP_TRACKER_DAILY_GOAL");
      if (storedGoal) {
        setDailyGoal(parseInt(storedGoal, 10) || 100);
      }

      const storedSound = localStorage.getItem("REP_TRACKER_SOUND");
      if (storedSound !== null) {
        setSoundEnabled(storedSound === "true");
      }

      const storedSpeech = localStorage.getItem("REP_TRACKER_SPEECH");
      if (storedSpeech !== null) {
        setSpeechEnabled(storedSpeech === "true");
      }
    } catch (e) {
      console.warn("Could not read local storage values:", e);
    }
  }, []);

  // Update states in LocalStorage upon change
  const syncRecords = (newRecords: LoggedRepRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem("REP_TRACKER_RECORDS", JSON.stringify(newRecords));
  };

  const handleUpdateGoal = (newGoal: number) => {
    setDailyGoal(newGoal);
    localStorage.setItem("REP_TRACKER_DAILY_GOAL", newGoal.toString());
  };

  const handleSoundToggle = (val: boolean) => {
    setSoundEnabled(val);
    localStorage.setItem("REP_TRACKER_SOUND", val.toString());
  };

  const handleSpeechToggle = (val: boolean) => {
    setSpeechEnabled(val);
    localStorage.setItem("REP_TRACKER_SPEECH", val.toString());
  };

  // Date Formatting Helper
  const getLocalDateString = (dateObj: Date) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Add reps handler with goal achievement detection
  const handleAddReps = (amount: number, exercise: string) => {
    const todayKey = getLocalDateString(new Date());

    // Compute previous today's total
    const prevTotalToday = records.reduce((sum, item) => {
      const itemDate = getLocalDateString(new Date(item.timestamp));
      if (itemDate === todayKey) {
        return sum + item.amount;
      }
      return sum;
    }, 0);

    const fallbackId = Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    const newRecord: LoggedRepRecord = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : fallbackId,
      timestamp: Date.now(),
      amount,
      exercise,
    };

    const newRecords = [...records, newRecord];
    syncRecords(newRecords);

    const newTotalToday = prevTotalToday + amount;
    
    // Check if goal newly completed
    if (prevTotalToday < dailyGoal && newTotalToday >= dailyGoal) {
      setTimeout(() => {
        soundEngine.playSuccessFlourish();
        soundEngine.speak(
          `Outstanding effort! You successfully reached your goal of ${dailyGoal} daily repetitions!`
        );
      }, 500);
    } else {
      soundEngine.speak(`Logged ${amount} ${exercise}.`);
    }
  };

  // Remove rep-log handler
  const handleRemoveRecord = (id: string) => {
    const filtered = records.filter((r) => r.id !== id);
    syncRecords(filtered);
    soundEngine.speak("Entry removed.");
  };

  // Callback when countdown timer completes
  const handleTimerComplete = () => {
    // Notify parent if needed, could trigger audio or logs
  };

  // Filter records to just Today for the RepTracker visual cards
  const todayKeyStr = getLocalDateString(new Date());
  const todayRecords = records.filter((rec) => {
    return getLocalDateString(new Date(rec.timestamp)) === todayKeyStr;
  });

  // Calculate stats for header bar
  const totalRepsAllTime = records.reduce((sum, item) => sum + item.amount, 0);

  // Clear all data optionally (for ease of reset)
  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear your entire physical rep records and history? This cannot be undone.")) {
      syncRecords([]);
      soundEngine.playClick(200, 0.2);
      soundEngine.speak("All history successfully cleared.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-col justify-between py-6 px-4 sm:px-6 md:px-8">
      {/* Absolute Header Section */}
      <header className="max-w-6xl w-full mx-auto mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 border-b border-neutral-900 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-black font-semibold shadow-xl border border-neutral-800">
              <Dumbbell size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-sm uppercase tracking-[0.2em] font-semibold text-white flex items-center gap-2">
                REPS & PACE SYSTEM <span className="text-neutral-600 font-mono text-[9px] font-normal tracking-normal lowercase">v1.2</span>
              </h1>
              <p className="text-[11px] text-neutral-500 tracking-wider">Minimalist tactical pacing for physical repetition training</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right font-mono">
              <span className="text-neutral-500 text-[9px] block uppercase tracking-[0.2em] mb-0.5">ALL-TIME REPS</span>
              <span className="text-sm font-semibold text-white">{totalRepsAllTime}</span>
            </div>

            <button
              onClick={handleClearAllData}
              className="px-3.5 py-2 rounded-xl border border-neutral-900 bg-neutral-950/40 text-neutral-500 hover:text-red-400 hover:border-red-500/20 text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 ml-2 cursor-pointer"
              title="Reset configuration and records data"
            >
              <RefreshCw size={11} />
              Reset Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-View Tactical Layout */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch mb-6">
        {/* Interval Clock Block - occupy 5 columns on desktop */}
        <section id="timer-panel" className="lg:col-span-5 h-full">
          <Timer
            onTimerComplete={handleTimerComplete}
            soundEnabled={soundEnabled}
            speechEnabled={speechEnabled}
            setSoundEnabled={handleSoundToggle}
            setSpeechEnabled={handleSpeechToggle}
          />
        </section>

        {/* Repetition Logging Block - occupy 7 columns on desktop */}
        <section id="rep-panel" className="lg:col-span-7 h-full">
          <RepTracker
            records={todayRecords}
            dailyGoal={dailyGoal}
            onAddReps={handleAddReps}
            onRemoveRecord={handleRemoveRecord}
            onUpdateGoal={handleUpdateGoal}
          />
        </section>

        {/* Past Analytics & Trends Track - full width of standard grid */}
        <section id="trends-panel" className="lg:col-span-12">
          <HistoryChart records={records} dailyGoal={dailyGoal} />
        </section>
      </div>

      {/* Footer Credentials */}
      <footer className="max-w-6xl w-full mx-auto border-t border-neutral-900/60 pt-4 text-center">
        <p className="text-[9px] text-neutral-600 font-mono flex items-center justify-center gap-1 uppercase tracking-widest">
          <Sparkles size={11} className="text-blue-500/50" />
          Offline-First Storage Engine • High Contrast Layout • Web Audio Synths
        </p>
      </footer>
    </main>
  );
}
