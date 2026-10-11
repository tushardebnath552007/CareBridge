// Synthesized audio feedback using standard browser Web Audio API

class SoundEffects {
  private ctx: AudioContext | null = null;
  private alarmOscillator: OscillatorNode | null = null;
  private alarmGain: GainNode | null = null;
  private isAlarmPlaying = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a gentle two-tone chime for medication or check-in
  playChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Note 1 (E5 - 659.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Note 2 (G#5 - 830.61Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(830.61, now + 0.15);
      gain2.gain.setValueAtTime(0.18, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.9);
    } catch {
      // Audio playback fails gracefully if browser restricts autoplay
    }
  }

  // Play success tone
  playSuccess() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio silent fallback
    }
  }

  // Start SOS emergency alarm beacon
  startSosAlarm() {
    if (this.isAlarmPlaying) return;
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      this.alarmOscillator = ctx.createOscillator();
      this.alarmGain = ctx.createGain();

      this.alarmOscillator.type = 'sawtooth';
      this.alarmOscillator.frequency.setValueAtTime(440, now);

      // Frequency modulation for siren sweep
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(1.5, now); // 1.5 Hz siren pulse
      lfoGain.gain.setValueAtTime(200, now); // swing between 240Hz and 640Hz
      lfo.connect(this.alarmOscillator.frequency);
      lfo.start(now);

      this.alarmGain.gain.setValueAtTime(0.15, now);
      this.alarmOscillator.connect(this.alarmGain);
      this.alarmGain.connect(ctx.destination);

      this.alarmOscillator.start(now);
      this.isAlarmPlaying = true;
    } catch {
      // Audio silent fallback
    }
  }

  // Stop SOS emergency alarm
  stopSosAlarm() {
    if (!this.isAlarmPlaying) return;
    try {
      if (this.alarmGain && this.ctx) {
        this.alarmGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
        setTimeout(() => {
          this.alarmOscillator?.stop();
          this.alarmOscillator?.disconnect();
          this.alarmGain?.disconnect();
          this.alarmOscillator = null;
          this.alarmGain = null;
          this.isAlarmPlaying = false;
        }, 220);
      } else {
        this.isAlarmPlaying = false;
      }
    } catch {
      this.isAlarmPlaying = false;
    }
  }

  isSosPlaying() {
    return this.isAlarmPlaying;
  }
}

export const sound = new SoundEffects();
