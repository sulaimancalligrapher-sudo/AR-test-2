/**
 * Audio narration helper using Web Speech API (Client-side, 100% free)
 * and custom audio file playback
 */

class AudioNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeakingSpeech: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    audioUrl?: string
  ): void {
    this.stop();

    if (audioUrl) {
      this.currentAudio = new Audio(audioUrl);
      if (onStart) this.currentAudio.onplay = () => onStart();
      if (onEnd) {
        this.currentAudio.onended = () => onEnd();
        this.currentAudio.onerror = () => {
          // Fallback to speech synthesis if audio file fails
          this.speakText(text, onStart, onEnd);
        };
      }
      this.currentAudio.play().catch(() => {
        this.speakText(text, onStart, onEnd);
      });
      return;
    }

    this.speakText(text, onStart, onEnd);
  }

  private speakText(text: string, onStart?: () => void, onEnd?: () => void): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.88; // Calm and clear educational pace
    utterance.pitch = 1.0;

    // Try finding an Arabic voice
    const voices = this.synth.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingSpeech = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeakingSpeech = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeakingSpeech = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingSpeech = false;
    }
  }

  public isPlaying(): boolean {
    if (this.currentAudio && !this.currentAudio.paused) return true;
    return this.isSpeakingSpeech;
  }
}

export const narrator = new AudioNarrator();
