/**
 * Real-time Optical Book Page & Calligraphy Detector
 * Runs 100% client-side via HTML5 Canvas Pixel Analysis.
 * Zero external libraries, zero backend, works offline and free on Vercel.
 */

export interface DetectionResult {
  detected: boolean;
  confidence: number; // 0.0 to 1.0
  reason?: string;
}

class CalligraphyPageDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private sampleWidth: number = 80;
  private sampleHeight: number = 80;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.sampleWidth;
    this.canvas.height = this.sampleHeight;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Analyzes the center area of the camera video feed to detect a calligraphy page:
   * 1. Detects high-contrast black/dark calligraphic ink on light/cream book paper.
   * 2. Checks center-weighted distribution of letter strokes.
   * 3. Analyzes edge density and gradient variance typical of Arabic letter curves.
   */
  public analyzeFrame(video: HTMLVideoElement): DetectionResult {
    if (!this.ctx || !video || video.readyState < 2 || video.videoWidth === 0) {
      return { detected: false, confidence: 0, reason: 'الفيديو غير جاهز بعد' };
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Crop center 45% of the video corresponding to the reticle viewfinder
    const cropSize = Math.min(vw, vh) * 0.45;
    const cropX = (vw - cropSize) / 2;
    const cropY = (vh - cropSize) / 2;

    this.ctx.drawImage(
      video,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      this.sampleWidth,
      this.sampleHeight
    );

    const imgData = this.ctx.getImageData(0, 0, this.sampleWidth, this.sampleHeight);
    const data = imgData.data;
    const totalPixels = this.sampleWidth * this.sampleHeight;

    let totalLuminance = 0;
    let darkPixelCount = 0;
    let centerDarkCount = 0;
    let edgeEnergy = 0;

    const centerX = this.sampleWidth / 2;
    const centerY = this.sampleHeight / 2;
    const centerRadiusSq = Math.pow(this.sampleWidth * 0.35, 2);

    // 1. Analyze brightness & dark ink strokes
    for (let y = 0; y < this.sampleHeight; y++) {
      for (let x = 0; x < this.sampleWidth; x++) {
        const idx = (y * this.sampleWidth + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Rec. 709 luminance
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        totalLuminance += lum;

        // Dark threshold for calligraphic ink (black on paper)
        if (lum < 110) {
          darkPixelCount++;

          // Check if dark pixel is within center of the reticle
          const distSq = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);
          if (distSq < centerRadiusSq) {
            centerDarkCount++;
          }
        }

        // Horizontal Edge gradient
        if (x < this.sampleWidth - 1) {
          const nextIdx = (y * this.sampleWidth + (x + 1)) * 4;
          const nextLum = 0.2126 * data[nextIdx] + 0.7152 * data[nextIdx + 1] + 0.0722 * data[nextIdx + 2];
          edgeEnergy += Math.abs(lum - nextLum);
        }
      }
    }

    const avgLuminance = totalLuminance / totalPixels;
    const darkRatio = darkPixelCount / totalPixels;
    const centerDarkRatio = darkPixelCount > 0 ? centerDarkCount / darkPixelCount : 0;
    const avgEdgeGradient = edgeEnergy / totalPixels;

    // Criteria for a calligraphy book page or target card:
    // 1. Paper is reasonably illuminated (avgLuminance between 90 and 240)
    // 2. Contains dark ink strokes (darkRatio between 4% and 55%)
    // 3. Center concentration of the letter (centerDarkRatio > 40%)
    // 4. Clear sharp edges of the ink curves (avgEdgeGradient > 12)

    let score = 0;

    // Paper luminance score
    if (avgLuminance > 90 && avgLuminance < 245) {
      score += 0.25;
    } else if (avgLuminance >= 65) {
      score += 0.1;
    }

    // Ink presence score (needs actual ink, not a blank white wall or pitch dark room)
    if (darkRatio >= 0.05 && darkRatio <= 0.50) {
      score += 0.35;
    } else if (darkRatio > 0.02 && darkRatio <= 0.65) {
      score += 0.20;
    }

    // Centered calligraphy glyph score
    if (centerDarkRatio > 0.45) {
      score += 0.25;
    } else if (centerDarkRatio > 0.30) {
      score += 0.15;
    }

    // Edge gradient score (distinct pen strokes)
    if (avgEdgeGradient > 14) {
      score += 0.15;
    } else if (avgEdgeGradient > 8) {
      score += 0.08;
    }

    const confidence = Math.min(1.0, Math.max(0, score));
    const isMatch = confidence >= 0.62;

    return {
      detected: isMatch,
      confidence,
      reason: isMatch 
        ? 'تم العثور على حبر الحرف وصفحة الدرس في إطار المسح' 
        : 'وجه الكاميرا نحو صفحة الدرس في الكتاب أو البطاقة',
    };
  }
}

export const cvDetector = new CalligraphyPageDetector();

/**
 * Plays a pleasant AR lock chime using native Web Audio API
 */
export function playARSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
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
    // ignore audio restrictions
  }
}
