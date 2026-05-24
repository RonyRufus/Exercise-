/**
 * Web Audio API synthesizer for zero-dependency sound effects, chimes, and alarms,
 * accompanied by optional Text-to-Speech feedback.
 */

class AudioSynth {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private speechEnabled: boolean = true;

  constructor() {
    // AudioContext is initialized lazily upon first user interaction due to browser policies.
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleSound(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public toggleSpeech(enabled: boolean) {
    this.speechEnabled = enabled;
  }

  // Plays a simple high-quality click sound for tactical feedback
  public playClick(pitch: number = 800, duration: number = 0.05) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context Click failed:", e);
    }
  }

  // Plays a beautiful chord sequence (C Major 7 / G major vibes) signaling timer completion
  public playAlarmChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initContext();
      
      // We will play a series of staggered notes to create a premium-sounding arpeggio
      const notes = [
        { freq: 261.63, delay: 0.0 }, // C4
        { freq: 329.63, delay: 0.15 }, // E4
        { freq: 392.00, delay: 0.30 }, // G4
        { freq: 523.25, delay: 0.45 }, // C5
        { freq: 659.25, delay: 0.60 }, // E5
        { freq: 1046.50, delay: 0.75 } // C6
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.delay);

        // Slow attack, quick decay
        gain.gain.setValueAtTime(0, ctx.currentTime + note.delay);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + note.delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.delay + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + note.delay);
        osc.stop(ctx.currentTime + note.delay + 0.82);
      });
    } catch (e) {
      console.warn("Audio Context Chime failed:", e);
    }
  }

  // Plays a premium success flourish when a progress milestone or daily goal is reached
  public playSuccessFlourish() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initContext();
      const notes = [
        { freq: 523.25, delay: 0.0 },  // C5
        { freq: 587.33, delay: 0.1 },  // D5
        { freq: 659.25, delay: 0.2 },  // E5
        { freq: 783.99, delay: 0.3 },  // G5
        { freq: 1046.50, delay: 0.4 }, // C6
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.delay);

        gain.gain.setValueAtTime(0, ctx.currentTime + note.delay);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + note.delay + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.delay + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + note.delay);
        osc.stop(ctx.currentTime + note.delay + 0.65);
      });
    } catch (e) {
      console.warn("Success flourish audio failed:", e);
    }
  }

  // Announcements using the Speech Synthesis API
  public speak(text: string) {
    if (!this.speechEnabled) return;
    try {
      // Cancel outstanding speech requests
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 1.1; // slightly faster and energetic
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis failed:", e);
    }
  }
}

export const soundEngine = new AudioSynth();
