/**
 * Natural Feature Tracking (NFT) Engine for Calligraphy Pages
 * Directly recognizes the visual drawing of the calligraphy letter on the page.
 * ZERO QR codes, ZERO barcodes.
 */

import { imageMatcher, ImageMatchResult } from './imageFeatureMatcher';
import { INITIAL_LESSONS } from '../data/lessons';

// Register initial lesson artworks
INITIAL_LESSONS.forEach(lesson => {
  imageMatcher.registerLessonArtwork(lesson.id, lesson.letter, lesson.script);
});

export interface DetectionResult {
  detected: boolean;
  detectedLessonId?: string;
  confidence: number;
  message: string;
}

class CalligraphyPageDetector {
  public analyzeFrame(video: HTMLVideoElement, currentLessonId: string): DetectionResult {
    const res: ImageMatchResult = imageMatcher.matchLiveFrame(video, currentLessonId);
    return {
      detected: res.matched,
      detectedLessonId: res.matchedLessonId,
      confidence: res.confidence,
      message: res.details || 'جاري مطابقة صورة رسمة الحرف...',
    };
  }

  public registerCustomLesson(lessonId: string, letter: string, script: string) {
    imageMatcher.registerLessonArtwork(lessonId, letter, script);
  }
}

export const cvDetector = new CalligraphyPageDetector();

/**
 * Audio Chime when target is recognized
 */
export function playARSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 harmonic chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.09 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.09 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.55);
    });
  } catch (e) {
    // Ignore browser audio restrictions
  }
}
