import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Plus, 
  HelpCircle, 
  Layers, 
  ChevronDown,
  Printer,
  ShieldCheck,
  Feather
} from 'lucide-react';
import { CalligraphyLesson } from '../types/calligraphy';

interface NavbarProps {
  lessons: CalligraphyLesson[];
  currentLesson: CalligraphyLesson;
  onSelectLesson: (lesson: CalligraphyLesson) => void;
  onOpenAddLesson: () => void;
  onOpenTargetCard: () => void;
  onOpenVercelGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lessons,
  currentLesson,
  onSelectLesson,
  onOpenAddLesson,
  onOpenTargetCard,
  onOpenVercelGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20 font-bold text-xl">
            <Feather className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-stone-100 font-['Amiri',serif] tracking-wide">
                خطاط AR
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                كتاب تفاعلي مجاني 100%
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              الواقع المعزز لمرافقة صفحات كتاب فن الخط العربي
            </p>
          </div>
        </div>

        {/* Center: Lesson Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentLesson.id}
              onChange={(e) => {
                const found = lessons.find(l => l.id === e.target.value);
                if (found) onSelectLesson(found);
              }}
              className="appearance-none bg-stone-900 border border-stone-700 hover:border-amber-500/50 text-stone-200 text-xs font-semibold py-2 px-3 pl-8 rounded-xl focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[240px] truncate"
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  ص {lesson.pageNumber}: {lesson.title} ({lesson.scriptNameArabic})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Target Card Button */}
          <button
            onClick={onOpenTargetCard}
            className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            title="عرض أو طباعة صفحة الدرس لتوجيه الكاميرا نحوها"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">بطاقة الصفحة {currentLesson.pageNumber}</span>
          </button>

          {/* Add Custom Lesson */}
          <button
            onClick={onOpenAddLesson}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-600/20"
            title="إضافة صفحة درس جديدة من كتابك"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة درس جديد</span>
          </button>

          {/* Vercel Free Guide */}
          <button
            onClick={onOpenVercelGuide}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-emerald-400 border border-stone-800 transition"
            title="دليل النشر المجاني على GitHub و Vercel"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
