import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, ShieldAlert, Check } from "lucide-react";
import { soundEngine } from "./AudioAlert";

interface TimerProps {
  onTimerComplete: () => void;
  soundEnabled: boolean;
  speechEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  setSpeechEnabled: (val: boolean) => void;
}

export default function Timer({
  onTimerComplete,
  soundEnabled,
  speechEnabled,
  setSoundEnabled,
  setSpeechEnabled,
}: TimerProps) {
  const [totalDuration, setTotalDuration] = useState<number>(3600); // default 60 mins (3600s)
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // Custom Inputs
  const [customMins, setCustomMins] = useState<string>("60");
  const [customSecs, setCustomSecs] = useState<string>("00");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Audio Setting changes
  useEffect(() => {
    soundEngine.toggleSound(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    soundEngine.toggleSpeech(speechEnabled);
  }, [speechEnabled]);

  // Handle countdown ticks
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Reached zero
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            handleAlarmTrigger();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleAlarmTrigger = () => {
    soundEngine.playAlarmChime();
    soundEngine.speak("Timer complete! Take a deep breath and start your next physical exercise.");
    onTimerComplete();
  };

  const handleStartPause = () => {
    soundEngine.playClick(600, 0.04);
    if (timeLeft === 0) {
      // If we are at 0, reset to current total duration before running
      setTimeLeft(totalDuration);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    soundEngine.playClick(400, 0.08);
    setIsRunning(false);
    setTimeLeft(totalDuration);
  };

  // Switch to a preset duration
  const applyPreset = (seconds: number) => {
    soundEngine.playClick(700, 0.04);
    setIsRunning(false);
    setTotalDuration(seconds);
    setTimeLeft(seconds);
    
    // Update custom input displays to match
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    setCustomMins(mins.toString());
    setCustomSecs(secs.toString().padStart(2, "0"));
  };

  // Apply custom typed dimensions
  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick(750, 0.05);
    const minsVal = parseInt(customMins, 10) || 0;
    const secsVal = parseInt(customSecs, 10) || 0;
    const totalSecs = (minsVal * 60) + secsVal;
    
    if (totalSecs > 0) {
      setIsRunning(false);
      setTotalDuration(totalSecs);
      setTimeLeft(totalSecs);
    }
  };

  // Format Helper: ss -> mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Percentage for progress indicators
  const percentLeft = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
  
  // Minimalist segment bars for visual feedback (5 segments like standard visual cues)
  const segments = [1, 2, 3, 4, 5];
  const activeSegments = Math.ceil((percentLeft / 100) * 5);

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden h-full">
      
      {/* Background glow when active */}
      {isRunning && (
        <div className="absolute inset-0 bg-blue-500/5 opacity-5 pointer-events-none transition-all duration-700 animate-pulse" />
      )}

      {/* Header Controls */}
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display text-sm uppercase tracking-[0.2em] font-semibold text-neutral-400">
            INTERVAL CLOCK
          </h2>
          <p className="text-[11px] text-neutral-600 tracking-wider">Pacing audio loop tool</p>
        </div>
        <div className="flex gap-1.5 z-20">
          {/* Mute Synth Sound Effects */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                : "bg-neutral-900 border-neutral-850 text-neutral-600 hover:bg-neutral-800"
            }`}
            title={soundEnabled ? "Mute synth alerts" : "Unmute synth alerts"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Mute Voice announcements */}
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`px-2.5 py-1.5 rounded-xl border transition-colors flex items-center justify-center font-mono text-[9px] font-bold cursor-pointer ${
              speechEnabled
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                : "bg-neutral-900 border-neutral-850 text-neutral-600 hover:bg-neutral-800"
            }`}
            title={speechEnabled ? "Mute Speech synthesis" : "Unmute Speech synthesis"}
          >
            TTS
          </button>
        </div>
      </div>

      {/* Modern Ultra-Minimalist Numeric Counter Container */}
      <div className="flex flex-col items-center justify-center my-6 py-4 w-full select-none">
        <div className="font-sans text-[6rem] sm:text-[8rem] lg:text-[8.5rem] font-extralight tracking-tighter leading-none text-white tabular-nums">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`h-2 w-2 rounded-full ${isRunning ? "bg-blue-500 animate-ping" : "bg-neutral-650"}`} />
          <span className={`text-[11px] font-mono tracking-[0.3em] uppercase transition-all ${
            isRunning ? "text-blue-500 font-bold" : "text-neutral-500"
          }`}>
            {isRunning ? "Interval Active" : "Paused"}
          </span>
        </div>

        {/* Minimalist Grid of custom-styled small ticks representing total countdown */}
        <div className="grid grid-cols-5 gap-1.5 w-40 h-1.5 mt-8 opacity-40">
          {segments.map((index) => {
            const isActive = index <= activeSegments;
            return (
              <div
                key={index}
                className={`h-full rounded-full transition-all duration-500 ${
                  isActive ? "bg-blue-500" : "bg-neutral-800"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Buttons */}
      <div className="flex items-center gap-3 w-full mt-2 justify-center">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-neutral-300 rounded-xl transition duration-150 border border-neutral-850 text-xs tracking-wider font-semibold uppercase cursor-pointer"
          title="Reset timer"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        <button
          onClick={handleStartPause}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-xl transition duration-150 text-xs tracking-widest uppercase cursor-pointer ${
            isRunning
              ? "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700/50"
              : "bg-white hover:bg-neutral-200 text-black shadow-lg"
          }`}
        >
          {isRunning ? (
            <>
              <Pause size={14} fill="currentColor" />
              Pause
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              Start Timer
            </>
          )}
        </button>
      </div>

      {/* Preset Pickers */}
      <div className="w-full mt-6">
        <div className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] mb-2.5 font-semibold text-center md:text-left">
          PRESET INTERVALS
        </div>
        <div className="grid grid-cols-5 gap-1.5 w-full">
          {[
            { label: "1m", sec: 60 },
            { label: "5m", sec: 300 },
            { label: "10m", sec: 600 },
            { label: "30m", sec: 1800 },
            { label: "60m", sec: 3600 },
          ].map((preset) => (
            <button
              key={preset.sec}
              onClick={() => applyPreset(preset.sec)}
              className={`py-2 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                totalDuration === preset.sec
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold"
                  : "bg-neutral-950 border-neutral-900 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Duration Setup Form */}
      <form onSubmit={handleApplyCustom} className="w-full mt-5 pt-5 border-t border-neutral-900">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1.5 block">Minutes</label>
            <input
              type="number"
              min="0"
              max="180"
              value={customMins}
              onChange={(e) => setCustomMins(e.target.value)}
              className="w-full text-center py-2 rounded-lg bg-neutral-950 border border-neutral-900 text-xs font-mono focus:border-neutral-755 focus:outline-none focus:ring-1 focus:ring-neutral-800 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1.5 block">Seconds</label>
            <input
              type="number"
              min="0"
              max="59"
              value={customSecs}
              onChange={(e) => setCustomSecs(e.target.value)}
              className="w-full text-center py-2 rounded-lg bg-neutral-950 border border-neutral-900 text-xs font-mono focus:border-neutral-755 focus:outline-none focus:ring-1 focus:ring-neutral-800 text-white"
            />
          </div>
          <button
            type="submit"
            className="h-[34px] px-4 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white border border-neutral-850 rounded-lg text-[10px] uppercase font-bold tracking-wider transition cursor-pointer"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
}
