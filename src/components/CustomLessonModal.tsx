import React, { useState } from 'react';
import { X, Plus, BookOpen, Video, Volume2, Sparkles } from 'lucide-react';
import { CalligraphyLesson, CalligraphyScript } from '../types/calligraphy';

interface CustomLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLesson: (newLesson: CalligraphyLesson) => void;
}

export const CustomLessonModal: React.FC<CustomLessonModalProps> = ({
  isOpen,
  onClose,
  onAddLesson,
}) => {
  const [title, setTitle] = useState('');
  const [letter, setLetter] = useState('');
  const [script, setScript] = useState<CalligraphyScript>('thuluth');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [penAngle, setPenAngle] = useState<number>(70);
  const [widthDots, setWidthDots] = useState<number>(3);
  const [heightDots, setHeightDots] = useState<number>(3);
  const [summary, setSummary] = useState('');
  const [rule1, setRule1] = useState('');
  const [rule2, setRule2] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [narrationText, setNarrationText] = useState('');

  if (!isOpen) return null;

  const scriptNames: Record<CalligraphyScript, string> = {
    thuluth: 'خط الثلث الجلي',
    naskh: 'خط النسخ',
    ruqah: 'خط الرقعة',
    diwani: 'الخط الديواني',
    kufi: 'الخط الكوفي',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !letter) return;

    // Convert youtube watch links to embed links if needed
    let formattedVideo = videoUrl.trim();
    if (formattedVideo.includes('youtube.com/watch?v=')) {
      const videoId = formattedVideo.split('v=')[1]?.split('&')[0];
      if (videoId) formattedVideo = `https://www.youtube.com/embed/${videoId}`;
    } else if (formattedVideo.includes('youtu.be/')) {
      const videoId = formattedVideo.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) formattedVideo = `https://www.youtube.com/embed/${videoId}`;
    }

    const newLesson: CalligraphyLesson = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      letter: letter.trim(),
      script,
      scriptNameArabic: scriptNames[script],
      pageNumber: Number(pageNumber) || 1,
      difficulty: 'متوسط',
      penAngleDegrees: Number(penAngle) || 70,
      pointScale: {
        widthDots: Number(widthDots) || 3,
        heightDots: Number(heightDots) || 3,
        description: `ميزان الحرف بعرض ${widthDots} نقاط وارتفاع ${heightDots} نقاط بزاوية قلم ${penAngle} درجة.`,
      },
      summary: summary.trim() || `درس تعليمي لحرف ${letter} من كتاب الخط العربي.`,
      detailedRules: [
        rule1.trim() || 'الانتباه لزاوية قطة القلم وانسيابية نزول الحبر.',
        rule2.trim() || 'التأكد من استقرار الحرف وميزان النقاط المعينة بدقة.',
      ],
      anatomy: [
        { id: 'p1', name: 'رأس وبداية الحرف', description: 'البداية بقطة قلم محكمة.', strokeOrder: 1 },
        { id: 'p2', name: 'جسم الحرف والعمق', description: 'انحدار رشيق وفق ميزان النقاط.', strokeOrder: 2 },
      ],
      targetImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
      audioNarrationText: narrationText.trim() || `أهلاً بكم في درس ${title}. ركز على مسار القلم وميزان الحرف.`,
      videoUrl: formattedVideo || undefined,
      videoTitle: `فيديو شرح درس ${title}`,
      colorScheme: {
        primary: '#d97706',
        secondary: '#b45309',
        accent: '#fbbf24',
      },
    };

    onAddLesson(newLesson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-stone-100 text-sm sm:text-base font-['Amiri',serif]">
              إضافة صفحة درس جديدة من كتابك
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                عنوان الدرس <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثلاً: حرف الباء المفردة"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                الحرف أو الكلمة (للشكل ثلاثي الأبعاد) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={4}
                placeholder="مثلاً: ب"
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 text-center font-bold text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">نوع الخط</label>
              <select
                value={script}
                onChange={(e) => setScript(e.target.value as CalligraphyScript)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="thuluth">خط الثلث</option>
                <option value="naskh">خط النسخ</option>
                <option value="ruqah">خط الرقعة</option>
                <option value="diwani">الخط الديواني</option>
                <option value="kufi">الخط الكوفي</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">رقم الصفحة في كتابك</label>
              <input
                type="number"
                min={1}
                value={pageNumber}
                onChange={(e) => setPageNumber(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">زاوية قطة القلم (بالدرجات)</label>
              <input
                type="number"
                min={45}
                max={90}
                value={penAngle}
                onChange={(e) => setPenAngle(Number(e.target.value))}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-stone-950/60 p-3 rounded-xl border border-stone-800">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">ميزان العرض (عدد النقاط)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={widthDots}
                onChange={(e) => setWidthDots(Number(e.target.value))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-stone-300 font-semibold mb-1">ميزان الارتفاع (عدد النقاط)</label>
              <input
                type="number"
                min={1}
                max={12}
                value={heightDots}
                onChange={(e) => setHeightDots(Number(e.target.value))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">نبذة مختصرة عن الدرس</label>
            <textarea
              rows={2}
              placeholder="اكتب فكرة سريعة عن الحرف وموقعه في خط الثلث أو الرقعة..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-stone-300 font-semibold">قواعد كتابة الحرف (تظهر للطالب):</label>
            <input
              type="text"
              placeholder="القاعدة 1: مثلاً زاوية النزول ومقدار الاستقرار"
              value={rule1}
              onChange={(e) => setRule1(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              placeholder="القاعدة 2: مثلاً حركة صعود الذيل واستقرار النقطة"
              value={rule2}
              onChange={(e) => setRule2(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-red-400" />
                رابط فيديو يوتيوب للشرح (اختياري)
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                نص الشرح الصوتي التلقائي (اختياري)
              </label>
              <input
                type="text"
                placeholder="الجملة التي يقرؤها التطبيق بصوت عربي واضح عند الضغط على استماع..."
                value={narrationText}
                onChange={(e) => setNarrationText(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] leading-relaxed">
            💡 يتم حفظ الدروس التي تضيفها محلياً في متصفحك مجاناً وبدون أي قواعد بيانات مدفوعة، ويمكنك استعراضها وطباعة بطاقاتها فوراً!
          </div>

          <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-medium transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              حفظ الدرس وتوليد مجسمه ثلاثي الأبعاد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
