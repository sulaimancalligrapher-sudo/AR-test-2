import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Video, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  Image as ImageIcon,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Award
} from 'lucide-react';
import { CalligraphyLesson } from '../types/calligraphy';
import { narrator } from '../utils/audioNarrator';

interface LessonHUDProps {
  lesson: CalligraphyLesson;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
}

export const LessonHUD: React.FC<LessonHUDProps> = ({
  lesson,
  isPlayingAudio,
  onToggleAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'anatomy' | 'scale'>('rules');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="w-full bg-stone-900/95 backdrop-blur-xl border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all">
      {/* 1. Header with Lesson Letter & Script Identity */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-800 pb-3.5 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg text-2xl font-bold font-['Amiri',serif]">
            {lesson.letter}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-amber-100 font-['Amiri',serif]">
                {lesson.title}
              </h2>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                {lesson.scriptNameArabic}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                صفحة {lesson.pageNumber}
              </span>
            </div>
            <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
              {lesson.summary}
            </p>
          </div>
        </div>

        {/* Action Buttons: Audio and Video */}
        <div className="flex items-center gap-2">
          {/* Audio narration button */}
          <button
            onClick={onToggleAudio}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              isPlayingAudio
                ? 'bg-amber-500 text-stone-950 animate-pulse shadow-lg shadow-amber-500/20'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700'
            }`}
            title="استماع للشرح الصوتي للدرس"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">إيقاف الصوت</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">صوت الشرح</span>
              </>
            )}
          </button>

          {/* Video modal button */}
          {lesson.videoUrl && (
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 flex items-center gap-2 transition"
              title="مشاهدة فيديو كتابة الحرف بالقصبة"
            >
              <Video className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">فيديو الدرس</span>
            </button>
          )}

          {/* Exemplar image button */}
          {lesson.exemplarImage && (
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition"
              title="عرض لوحة الحرف الأصلية"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          )}

          {/* Toggle expand/collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Collapsible Tabs & Content */}
      {isExpanded && (
        <div>
          {/* Sub Tabs */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'rules'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              قواعد الكتابة ومسار القلم
            </button>
            <button
              onClick={() => setActiveTab('anatomy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'anatomy'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              تشريح أجزاء الحرف ({lesson.anatomy.length})
            </button>
            <button
              onClick={() => setActiveTab('scale')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'scale'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              ميزان النقاط وزاوية القطة
            </button>
          </div>

          {/* Tab 1: Rules */}
          {activeTab === 'rules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {lesson.detailedRules.map((rule, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-2.5 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80 text-xs leading-relaxed text-stone-300"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Anatomy Breakdown */}
          {activeTab === 'anatomy' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {lesson.anatomy.map((part) => (
                <div
                  key={part.id}
                  className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-amber-200 font-['Amiri',serif]">
                      {part.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                      حركة #{part.strokeOrder}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    {part.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Scale & Pen Angle */}
          {activeTab === 'scale' && (
            <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/80 text-xs text-stone-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-amber-200">ميزان الحرف بالنقط المعينة:</span>
                </div>
                <p className="text-stone-300 text-xs leading-relaxed">
                  {lesson.pointScale.description}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 bg-stone-900/90 p-2.5 rounded-xl border border-stone-800">
                <div className="text-center">
                  <div className="text-xs text-stone-400">اتساع العرض</div>
                  <div className="text-lg font-bold text-sky-400">{lesson.pointScale.widthDots} نقاط</div>
                </div>
                <div className="w-px h-8 bg-stone-800" />
                <div className="text-center">
                  <div className="text-xs text-stone-400">العمق الرأسي</div>
                  <div className="text-lg font-bold text-rose-400">{lesson.pointScale.heightDots} نقاط</div>
                </div>
                <div className="w-px h-8 bg-stone-800" />
                <div className="text-center">
                  <div className="text-xs text-stone-400">قطة القلم</div>
                  <div className="text-lg font-bold text-amber-400">{lesson.penAngleDegrees}°</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. In-Camera Video Modal (Without leaving the page) */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-stone-100 text-sm sm:text-base font-['Amiri',serif]">
                  {lesson.videoTitle || `فيديو طريقة كتابة ${lesson.title}`}
                </h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video bg-black">
              {lesson.videoUrl?.includes('youtube.com') || lesson.videoUrl?.includes('youtu.be') ? (
                <iframe
                  src={lesson.videoUrl}
                  title={lesson.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={lesson.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Modal Footer Note */}
            <div className="p-3 bg-stone-950 text-xs text-stone-400 flex items-center justify-between">
              <span>يمكنك إغلاق الفيديو في أي لحظة للعودة المباشرة إلى كاميرا الواقع المعزز.</span>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition"
              >
                إغلاق والعودة للكاميرا
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Exemplar Calligraphy Art Modal */}
      {isImageModalOpen && lesson.exemplarImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3.5 border-b border-stone-800">
              <span className="font-bold text-amber-200 text-sm font-['Amiri',serif]">
                النموذج الأصلي من كراسة الخط العربي
              </span>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-stone-950 flex items-center justify-center">
              <img
                src={lesson.exemplarImage}
                alt={lesson.title}
                className="max-h-[60vh] object-contain rounded-xl border border-stone-800 shadow"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
