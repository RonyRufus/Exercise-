/**
 * Types representing the state of reps and interval timers.
 */

export interface LoggedRepRecord {
  id: string;
  timestamp: number; // epoch timestamp
  amount: number;    // e.g. 25
  exercise?: string; // category, e.g., "Pushups", "Squats"
}

export interface DayProgress {
  dateString: string; // YYYY-MM-DD
  totalReps: number;
}

export interface TimerConfig {
  id: string;
  label: string;
  durationSeconds: number;
}
