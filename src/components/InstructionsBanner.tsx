import React, { useState } from 'react';
import { Sparkles, Camera, Eye, Video, Volume2, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface InstructionsBannerProps {
  onOpenTargetCard: () => void;
}

export const InstructionsBanner: React.FC<InstructionsBannerProps> = ({ onOpenTargetCard }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-stone-900/60 border border-stone-800 rounded-2xl p-3.5 mb-4 text-xs transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-stone-200 font-['Amiri',serif] text-sm">
            طريقة عمل التجربة للطلاب والمعلم (خطوات سريعة)
          </span>
        </div>

        <div className="flex items-center gap-2 text-stone-400">
          <span className="text-[11px] text-amber-400/90 font-medium hidden sm:inline">
            {isOpen ? 'إخفاء الدليل' : 'كيف أختبره الآن؟'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-stone-300">
          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Camera className="w-4 h-4" />
              <span>1. إذن الكاميرا</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              اسمح بفتح الكاميرا عند طلب المتصفح، أو استخدم نموذج المحاكاة ثلاثي الأبعاد المتاح تلقائياً.
            </p>
          </div>

          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Eye className="w-4 h-4" />
              <span>2. صفحة الكتاب أو البطاقة</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              اضغط على زر <button onClick={(e) => { e.stopPropagation(); onOpenTargetCard(); }} className="text-amber-400 underline font-semibold">بطاقة الصفحة</button> واعرضها على شاشة ثانية أو اطبعها ووجّه الكاميرا نحوها.
            </p>
          </div>

          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800/80">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Volume2 className="w-4 h-4" />
              <span>3. الشرح والصوت والفيديو</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              يرتفع الحرف ثلاثي الأبعاد، وتستمع للشرح الصوتي وتشاهد فيديو طريقة مسار القصبة دون الخروج من الكاميرا!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
