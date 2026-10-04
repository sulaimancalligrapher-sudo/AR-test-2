import React from 'react';
import { X, CheckCircle, Github, Globe, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface VercelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelGuideModal: React.FC<VercelGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-stone-100 text-sm sm:text-base font-['Amiri',serif]">
              دليل النشر المجاني 100% على GitHub و Vercel
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-stone-300 leading-relaxed">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-emerald-300">
            <p className="font-bold flex items-center gap-1.5 mb-1 text-sm">
              <CheckCircle className="w-4 h-4" />
              هذا المشروع مصمم ليعمل مجاناً للأبد بدون أي سنت
            </p>
            <p className="text-[11px] text-emerald-200/90">
              تم بناء التطبيق بتقنيات الواجهة الأمامية بالكامل (Vite + React + Three.js + Web Speech API + WebAR Camera)، ولا يحتاج أي خادم (Serverless / Static) ولا أي اشتراكات مدفوعة.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-amber-200 text-sm font-['Amiri',serif]">
              خطوات النشر على Vercel مجاناً في دقيقتين:
            </h4>

            <div className="flex items-start gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
              <div className="w-6 h-6 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-stone-100">ارفع الكود إلى مستودع GitHub</p>
                <p className="text-stone-400 text-[11px] mt-0.5">
                  انسخ ملفات المشروع وضعها في مستودع GitHub الخاص بك (Public أو Private مجاناً).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
              <div className="w-6 h-6 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-stone-100">سجل الدخول في Vercel بحساب GitHub</p>
                <p className="text-stone-400 text-[11px] mt-0.5">
                  توجه إلى vercel.com واضغط "Import Project" واختر مستودع الخط العربي.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
              <div className="w-6 h-6 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-stone-100">اضغط Deploy فقط (تلقائي 100%)</p>
                <p className="text-stone-400 text-[11px] mt-0.5">
                  Vercel سيتعرف تلقائياً على مشروع Vite وسيقوم ببنائه ويعطيك رابطاً مجانياً مشفراً (HTTPS) يدعم فتح الكاميرا في هواتف الطلاب مباشرة!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-[11px] text-stone-400">
            <span className="text-amber-300 font-bold">لماذا HTTPS مهم؟</span>
            <p className="mt-1">
              جميع الهواتف الذكية (آيفون وأندرويد) تشترط أن يكون الموقع يعمل بشهادة أمان HTTPS حتى تسمح بتشغيل الكاميرا، وVercel يمنحك HTTPS مجاناً وتلقائياً مدى الحياة.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition"
          >
            فهمت، شكراً لك
          </button>
        </div>
      </div>
    </div>
  );
};
