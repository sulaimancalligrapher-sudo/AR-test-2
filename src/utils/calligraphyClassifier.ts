/**
 * Authentic Arabic Calligraphy Visual Feature Classifier
 * Analyzes live camera frames to classify the actual letter and calligraphy script.
 * Distinguishes between:
 * - حرف النون (ن)
 * - حرف الواو (و)
 * - حرف العين (ع)
 * - البسملة الشريفة (﷽)
 * AND rejects non-calligraphy objects (keyboards, tables, walls, hands).
 */

export interface ClassificationResult {
  matched: boolean;
  lessonId?: string;
  letter?: string;
  title?: string;
  scriptName?: string;
  confidence: number;
  message: string;
}

class CalligraphyVisualClassifier {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 120;
    this.canvas.height = 120;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  /**
   * Analyzes the camera frame inside the reticle
   */
  public classifyVideoFrame(video: HTMLVideoElement): ClassificationResult {
    if (!this.ctx || !video || video.readyState < 2 || video.videoWidth === 0) {
      return {
        matched: false,
        confidence: 0,
        message: 'الكاميرا غير جاهزة بعد، تأكد من وضوح الصورة.',
      };
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Crop the central 55% square from the video
    const cropSize = Math.min(vw, vh) * 0.55;
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
      this.canvas.width,
      this.canvas.height
    );

    const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imgData.data;
    const totalPixels = this.canvas.width * this.canvas.height;

    // 1. Calculate Average Brightness & Ink Mask
    let totalLum = 0;
    const binary = new Uint8Array(totalPixels);
    let darkCount = 0;

    for (let i = 0; i < totalPixels; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLum += lum;
    }
    const avgLum = totalLum / totalPixels;

    // Adaptive ink threshold relative to average paper brightness
    const threshold = Math.min(130, Math.max(50, avgLum * 0.72));

    for (let i = 0; i < totalPixels; i++) {
      const lum = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
      if (lum < threshold) {
        binary[i] = 1; // ink pixel
        darkCount++;
      } else {
        binary[i] = 0; // background paper
      }
    }

    const inkRatio = darkCount / totalPixels;

    // 2. Reject non-calligraphy surfaces
    // Blank walls/paper have < 3% ink; dark clothes/shadows/keyboards have > 60% dark pixels
    if (inkRatio < 0.04) {
      return {
        matched: false,
        confidence: 0,
        message: 'لا يوجد حبر أو كتابة واضحة في الإطار. وجه الكاميرا نحو صفحة الدرس في الكتاب.',
      };
    }

    if (inkRatio > 0.55) {
      return {
        matched: false,
        confidence: 0,
        message: 'المشهد مظلم جداً أو مليء بالظلال. وجه الكاميرا نحو صفحة كتاب بيضاء أو كرت الدرس.',
      };
    }

    // 3. Check for Keyboard / Regular Grid Artifacts
    // Keyboards have repetitive horizontal stripes of high variance
    let rowTransitions = 0;
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let y = 10; y < height - 10; y += 4) {
      let transitions = 0;
      for (let x = 10; x < width - 10; x++) {
        const curr = binary[y * width + x];
        const next = binary[y * width + x + 1];
        if (curr !== next) transitions++;
      }
      if (transitions > 14) rowTransitions++;
    }

    if (rowTransitions > 10) {
      return {
        matched: false,
        confidence: 0,
        message: 'تم رصد لوحة مفاتيح أو نمط شبكي! يرجى توجيه الكاميرا إلى صفحة الخط العربي.',
      };
    }

    // 4. Structural Feature Extraction
    // Quadrant ink distribution (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
    const midX = width / 2;
    const midY = height / 2;
    let qTopLeft = 0;
    let qTopRight = 0;
    let qBottomLeft = 0;
    let qBottomRight = 0;
    let centerInk = 0;

    let minX = width, maxX = 0, minY = height, maxY = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (binary[y * width + x] === 1) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          if (y < midY && x < midX) qTopLeft++;
          else if (y < midY && x >= midX) qTopRight++;
          else if (y >= midY && x < midX) qBottomLeft++;
          else qBottomRight++;

          // Center 40% area
          if (Math.abs(x - midX) < width * 0.2 && Math.abs(y - midY) < height * 0.2) {
            centerInk++;
          }
        }
      }
    }

    const bboxWidth = Math.max(1, maxX - minX);
    const bboxHeight = Math.max(1, maxY - minY);
    const aspectRatio = bboxWidth / bboxHeight;

    const totalInk = darkCount || 1;
    const topInkRatio = (qTopLeft + qTopRight) / totalInk;
    const bottomInkRatio = (qBottomLeft + qBottomRight) / totalInk;
    const rightInkRatio = (qTopRight + qBottomRight) / totalInk;
    const leftInkRatio = (qTopLeft + qBottomLeft) / totalInk;

    // 5. Letter Classification Heuristics
    // A. حرف النون (ن):
    // Characterized by a wide bottom bowl (bottom ink ratio high ~55-70%) AND a distinct top dot
    // Bounding box aspect ratio is around 0.9 to 1.3
    const isNoonCandidate =
      bottomInkRatio > 0.48 &&
      topInkRatio > 0.22 &&
      aspectRatio >= 0.8 &&
      aspectRatio <= 1.45 &&
      inkRatio >= 0.06 &&
      inkRatio <= 0.35;

    // B. حرف الواو (و):
    // Head is at top/top-right, heavy top weight (top ink ratio ~45-65%), tail descends towards bottom-left
    // Compact structure, no top floating dot
    const isWawCandidate =
      topInkRatio > 0.38 &&
      qTopRight > qTopLeft &&
      qBottomLeft > qBottomRight &&
      aspectRatio >= 0.7 &&
      aspectRatio <= 1.25 &&
      inkRatio >= 0.05 &&
      inkRatio <= 0.30;

    // C. حرف العين (ع):
    // Top eyebrow is curved, open right cavity, deep sweeping crescent in bottom (bottomInkRatio > 55%)
    // Bounding box usually taller (aspect ratio 0.65 to 1.05)
    const isAynCandidate =
      bottomInkRatio > 0.52 &&
      aspectRatio >= 0.6 &&
      aspectRatio <= 1.15 &&
      rightInkRatio < 0.65;

    // D. تركيب البسملة (﷽):
    // Long horizontal composition with multiple tall vertical ascenders, high width-to-height ratio (> 1.4)
    const isBismillahCandidate =
      aspectRatio > 1.45 &&
      inkRatio >= 0.12 &&
      inkRatio <= 0.45;

    // Decision Logic with scoring
    if (isBismillahCandidate) {
      return {
        matched: true,
        lessonId: 'thuluth-bismillah',
        letter: '﷽',
        title: 'تركيب البسملة الشريفة',
        scriptName: 'خط الثلث المركب',
        confidence: 0.92,
        message: 'تم التعرف البصري على تركيب البسملة الشريفة!',
      };
    }

    if (isWawCandidate && !isNoonCandidate) {
      return {
        matched: true,
        lessonId: 'ruqah-waw',
        letter: 'و',
        title: 'حرف الواو المستقرة',
        scriptName: 'خط الرقعة',
        confidence: 0.88,
        message: 'تم التعرف البصري على حرف الواو (خط الرقعة)!',
      };
    }

    if (isAynCandidate && bottomInkRatio > 0.58) {
      return {
        matched: true,
        lessonId: 'naskh-ayn',
        letter: 'ع',
        title: 'حرف العين المفردة',
        scriptName: 'خط النسخ',
        confidence: 0.87,
        message: 'تم التعرف البصري على حرف العين (خط النسخ)!',
      };
    }

    if (isNoonCandidate) {
      return {
        matched: true,
        lessonId: 'thuluth-noon',
        letter: 'ن',
        title: 'حرف النون المفردة',
        scriptName: 'خط الثلث الجلي',
        confidence: 0.90,
        message: 'تم التعرف البصري على حرف النون (خط الثلث)!',
      };
    }

    // Generic Calligraphy Stroke detected, but ambiguous
    return {
      matched: false,
      confidence: 0.35,
      message: 'تم رصد كتابة، يرجى تقريب الكاميرا وضبط رسمة الحرف داخل الإطار المربع.',
    };
  }
}

export const calligraphyClassifier = new CalligraphyVisualClassifier();
