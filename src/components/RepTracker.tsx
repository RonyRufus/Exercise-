import React, { useState } from "react";
import { Plus, Trash2, Trophy, Flame, ChevronRight, Activity } from "lucide-react";
import { LoggedRepRecord } from "../types";
import { soundEngine } from "./AudioAlert";

interface RepTrackerProps {
  records: LoggedRepRecord[];
  dailyGoal: number;
  onAddReps: (amount: number, exercise: string) => void;
  onRemoveRecord: (id: string) => void;
  onUpdateGoal: (newGoal: number) => void;
}

export default function RepTracker({
  records,
  dailyGoal,
  onAddReps,
  onRemoveRecord,
  onUpdateGoal,
}: RepTrackerProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>("Pushups");
  const [customIncrement, setCustomIncrement] = useState<string>("25");
  const [goalInput, setGoalInput] = useState<string>(dailyGoal.toString());
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  // Suggested exercise list
  const exercisePresets = [
    { name: "Pushups", icon: "💪" },
    { name: "Squats", icon: "🦵" },
    { name: "Pullups", icon: "🧗" },
    { name: "Crunches", icon: "🧘" },
    { name: "General", icon: "⚡" }
  ];

  // Calculate stats for today
  const totalCompletedToday = records.reduce((sum, item) => sum + item.amount, 0);
  const percentOfGoal = dailyGoal > 0 ? Math.min((totalCompletedToday / dailyGoal) * 100, 100) : 0;
  
  // Calculate stats per exercise category
  const exerciseStats = records.reduce((stats: { [key: string]: number }, rec) => {
    const ex_name = rec.exercise || "General";
    stats[ex_name] = (stats[ex_name] || 0) + rec.amount;
    return stats;
  }, {});

  const handleLogClick = (amountToLog: number) => {
    soundEngine.playClick(900, 0.05);
    onAddReps(amountToLog, selectedExercise);
  };

  const handleCustomLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incVal = parseInt(customIncrement, 10) || 0;
    if (incVal > 0) {
      handleLogClick(incVal);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick(500, 0.06);
    const newGoalVal = parseInt(goalInput, 10) || 0;
    if (newGoalVal > 0) {
      onUpdateGoal(newGoalVal);
      setIsEditingGoal(false);
    }
  };

  // Helper formatting timestamp
  const formatTime = (epochMs: number) => {
    const d = new Date(epochMs);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative h-full">
      <div>
        {/* Title Block */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-display text-sm uppercase tracking-[0.2em] font-semibold text-neutral-400">
              REPETITION TRACKER
            </h2>
            <p className="text-[11px] text-neutral-600 tracking-wider">Pace your strength metrics</p>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-850 text-neutral-300 text-[10px] font-mono px-3 py-1.5 rounded-xl font-medium tracking-wider uppercase">
            <Flame size={12} className="text-blue-500" fill="currentColor" />
            Active Streak
          </div>
        </div>

        {/* Dynamic Target Minimalism Large Indicator - Styled like Design HTML */}
        <div className="bg-neutral-950 border border-neutral-900/60 rounded-2xl p-6 mb-6 flex flex-col items-center text-center relative overflow-hidden">
          
          <div className="text-[10px] text-neutral-500 uppercase tracking-[0.25em] font-semibold mb-2">
            DAILY REPS TOTAL
          </div>

          <div className="flex flex-col items-center justify-center">
            {isEditingGoal ? (
              <form onSubmit={handleSaveGoal} className="flex gap-2 items-center my-4">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-24 text-center py-1.5 px-2.5 rounded-lg bg-neutral-905 border border-neutral-800 text-sm font-mono focus:border-neutral-700 focus:outline-none text-white animate-pulse"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white text-black font-bold rounded-lg text-xs hover:bg-neutral-200 transition cursor-pointer"
                >
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGoalInput(dailyGoal.toString());
                    setIsEditingGoal(false);
                  }}
                  className="text-neutral-500 hover:text-neutral-300 text-xs px-2 cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center">
                {/* Huge bold rep count */}
                <div className="text-[5.5rem] sm:text-[6.5rem] font-bold tracking-tighter leading-none text-white tabular-nums">
                  {totalCompletedToday}
                </div>
                
                {/* Goal indicator button */}
                <div className="mt-3">
                  <span className="text-neutral-500 text-xs tracking-wider font-mono">TARGET GOAL: </span>
                  <button
                    onClick={() => setIsEditingGoal(true)}
                    className="font-mono text-blue-400 text-xs hover:text-blue-300 hover:border-blue-400/50 border-b border-dashed border-neutral-800 cursor-pointer font-bold"
                    title="Click to change target"
                  >
                    {dailyGoal} reps
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Achievement Status Message */}
          <div className="text-neutral-500 text-[11px] mt-4 font-mono">
            {percentOfGoal >= 100 ? (
              <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                DAILY TARGET LIFTOFF ACHIEVED
              </span>
            ) : (
              `Remaining: ${Math.max(dailyGoal - totalCompletedToday, 0)} reps needed`
            )}
          </div>

          {/* Graphical segments represent target fulfillment */}
          <div className="grid grid-cols-5 gap-1.5 w-60 h-1.5 mt-5 opacity-40">
            {Array.from({ length: 5 }).map((_, i) => {
              const boundary = (i + 1) * 20;
              const hasMetPart = percentOfGoal >= boundary;
              return (
                <div
                  key={i}
                  className={`h-full rounded-sm transition-all duration-500 ${
                    hasMetPart ? "bg-blue-500" : "bg-neutral-800"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Exercise Category Preset Selection Row */}
        <div className="mb-6">
          <div className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-semibold mb-2 text-center md:text-left">
            STRENGTH CLUSTER SELECTION
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
            {exercisePresets.map((ex) => (
              <button
                key={ex.name}
                onClick={() => {
                  soundEngine.playClick(720, 0.03);
                  setSelectedExercise(ex.name);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[11px] font-mono transition duration-155 cursor-pointer ${
                  selectedExercise === ex.name
                    ? "bg-neutral-900 border-neutral-700 text-white font-bold"
                    : "bg-neutral-950 border-neutral-900 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
                }`}
              >
                <span>{ex.icon}</span>
                <span>{ex.name.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Log Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleLogClick(25)}
            className="group flex flex-col items-center justify-center p-5 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition rounded-2xl shadow-lg border border-white/25 cursor-pointer"
          >
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80">Quick Rep Log</span>
            <span className="text-3xl font-sans font-black mt-1 inline-flex items-center gap-1 uppercase">
              +25 <span className="text-sm font-semibold tracking-wider">Reps</span>
            </span>
            <span className="text-[10px] mt-1.5 font-mono uppercase tracking-widest opacity-60">
              {selectedExercise}
            </span>
          </button>

          {/* Quick Option Selector Button Cluster (10, 50, etc) */}
          <div className="flex flex-col gap-2.5 justify-between">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleLogClick(5)}
                className="bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-850 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center py-3 cursor-pointer"
              >
                +5 REPS
              </button>
              <button
                onClick={() => handleLogClick(10)}
                className="bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-850 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center py-3 cursor-pointer"
              >
                +10 REPS
              </button>
            </div>
            
            <form onSubmit={handleCustomLogSubmit} className="flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="CUSTOM AMOUNT"
                value={customIncrement}
                onChange={(e) => setCustomIncrement(e.target.value)}
                className="w-full text-center py-2.5 rounded-xl bg-neutral-950 border border-neutral-900 text-xs font-mono placeholder:text-neutral-700 focus:border-neutral-800 focus:outline-none text-white uppercase tracking-wider"
              />
              <button
                type="submit"
                className="px-4 bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-850 rounded-xl transition flex items-center justify-center cursor-pointer"
                title="Log custom amount"
              >
                <Plus size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* History Log Column */}
      <div className="flex-1 flex flex-col justify-end mt-4 pt-4 border-t border-neutral-900">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
            METRIC LOG ACTIVITY
          </div>
          <span className="text-neutral-500 font-mono text-[10px]">
            {records.length} inputs
          </span>
        </div>

        {records.length === 0 ? (
          <div className="py-6 text-center text-neutral-600 text-xs border border-dashed border-neutral-900 rounded-xl bg-neutral-950/20 font-mono">
            Empty daily dataset.<br />
            Input training logs above to preview.
          </div>
        ) : (
          <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
            {records.slice().reverse().map((record) => {
              const matchingPreset = exercisePresets.find(p => p.name === record.exercise);
              const emoji = matchingPreset ? matchingPreset.icon : "⚡";

              return (
                <div
                  key={record.id}
                  className="flex justify-between items-center bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 rounded-xl p-2.5 transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm bg-neutral-900 px-1 py-0.5 rounded">{emoji}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-200">
                        +{record.amount} {record.exercise || "General"}
                      </span>
                      <span className="text-[10px] text-neutral-600">
                        {formatTime(record.timestamp)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playClick(300, 0.1);
                      onRemoveRecord(record.id);
                    }}
                    className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-neutral-600 border border-transparent rounded-lg transition opacity-60 hover:opacity-100 cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
