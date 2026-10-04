import React from 'react';
import { X, Printer, ExternalLink, QrCode, Sparkles, BookOpen } from 'lucide-react';
import { CalligraphyLesson } from '../types/calligraphy';

interface TargetCardModalProps {
  lesson: CalligraphyLesson;
  isOpen: boolean;
  onClose: () => void;
}

export const TargetCardModal: React.FC<TargetCardModalProps> = ({
  lesson,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-stone-100 text-sm sm:text-base font-['Amiri',serif]">
              بطاقة صفحة الدرس {lesson.pageNumber} في الكتاب
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Card Body (Styled like an authentic Arabic calligraphy book page) */}
        <div className="p-6 bg-stone-950">
          <div 
            id="printable-calligraphy-card"
            className="relative bg-amber-50/95 text-stone-900 p-8 rounded-2xl border-4 border-amber-900/30 shadow-xl flex flex-col items-center justify-between text-center min-h-[380px]"
            style={{
              backgroundImage: `radial-gradient(#d97706 0.75px, transparent 0.75px), radial-gradient(#d97706 0.75px, #fdfbf7 0.75px)`,
              backgroundSize: '30px 30px',
              backgroundPosition: '0 0, 15px 15px',
            }}
          >
            {/* Traditional Calligraphy Border */}
            <div className="absolute inset-2 border-2 border-amber-800/40 rounded-xl pointer-events-none" />
            <div className="absolute inset-3 border border-dashed border-amber-700/30 rounded-lg pointer-events-none" />

            {/* Top Header of the Page */}
            <div className="w-full flex items-center justify-between border-b border-amber-900/20 pb-2 z-10 text-xs font-semibold text-amber-900">
              <span>كتاب فن الخط العربي التفاعلي</span>
              <span>صفحة #{lesson.pageNumber}</span>
            </div>

            {/* Center: The Massive Calligraphic Letter with ink splash */}
            <div className="my-6 z-10 flex flex-col items-center">
              <span className="text-[120px] font-bold text-stone-950 leading-none select-none font-['Amiri',serif] drop-shadow-md">
                {lesson.letter}
              </span>
              <span className="text-lg font-bold text-amber-950 mt-2 font-['Amiri',serif]">
                {lesson.title} - {lesson.scriptNameArabic}
              </span>
              <span className="text-xs text-amber-900/90 mt-1">
                ميزان الاتساع: {lesson.pointScale.widthDots} نقاط • زاوية القلم: {lesson.penAngleDegrees}°
              </span>
            </div>

            {/* Natural Image Target Footer */}
            <div className="w-full pt-3 border-t border-amber-900/20 z-10 flex items-center justify-between text-xs text-amber-950">
              <span className="font-semibold font-['Amiri',serif]">
                ✓ الكاميرا تتعرف مباشرة على رسمة حرف ({lesson.letter})
              </span>
              <span className="font-bold font-mono">
                صفحة #{lesson.pageNumber}
              </span>
            </div>
          </div>

          {/* Instructions for Real Image Tracking */}
          <div className="mt-4 bg-stone-900/80 p-3.5 rounded-xl border border-stone-800 text-xs text-stone-300 leading-relaxed">
            <p className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              تتبع الصورة الطبيعية (Natural Image Tracking):
            </p>
            <p className="text-[11px] text-stone-400">
              وجه كاميرا الهاتف نحو رسمة حرف <strong className="text-amber-200">({lesson.letter})</strong> في هذه الصفحة؛ سيتعرف النظام تلقائياً على شكل الحرك وانحناءات الحبر ويرتفع المجسم ثلاثي الأبعاد فوق الصفحة مباشرة دون أي باركود!
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-end gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            طباعة كصفحة حقيقية
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-xl transition"
          >
            تم ومتابعة التجربة
          </button>
        </div>
      </div>
    </div>
  );
};
