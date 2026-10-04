export type CalligraphyScript = 'thuluth' | 'naskh' | 'ruqah' | 'diwani' | 'kufi';

export interface PointScale {
  widthDots: number;
  heightDots: number;
  depthDots?: number;
  description: string;
}

export interface AnatomyPart {
  id: string;
  name: string;
  description: string;
  strokeOrder: number;
}

export interface CalligraphyLesson {
  id: string;
  title: string;
  letter: string;
  script: CalligraphyScript;
  scriptNameArabic: string;
  pageNumber: number;
  difficulty: 'مبتدئ' | 'متوسط' | 'متقدم';
  penAngleDegrees: number; // e.g., 70 for Thuluth, 85 for Ruq'ah
  pointScale: PointScale;
  summary: string;
  detailedRules: string[];
  anatomy: AnatomyPart[];
  targetImageUrl: string;
  audioNarrationText: string;
  audioUrl?: string;
  videoUrl?: string; // YouTube embed or video URL
  videoTitle?: string;
  exemplarImage?: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export type MaterialType = 'gold' | 'ink' | 'bronze' | 'emerald';
