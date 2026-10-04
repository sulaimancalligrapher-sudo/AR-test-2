import { CalligraphyLesson } from '../types/calligraphy';

export const INITIAL_LESSONS: CalligraphyLesson[] = [
  {
    id: 'thuluth-noon',
    title: 'حرف النون المفردة',
    letter: 'ن',
    script: 'thuluth',
    scriptNameArabic: 'خط الثلث الجلي',
    pageNumber: 14,
    difficulty: 'متوسط',
    penAngleDegrees: 70,
    pointScale: {
      widthDots: 3,
      heightDots: 2.5,
      depthDots: 2,
      description: 'اتساع الكأس ثلاث نقاط بقلم الثلث، والعمق نقطتان ونصف، ونقطة النون مستقرة في المنتصف العلوي مائلة لليمين قليلاً.'
    },
    summary: 'يعتبر كاس النون في خط الثلث من أهم الكؤوس الأساسية، وعليها تبنى كؤوس اللام والقاف والصاد والسين.',
    detailedRules: [
      'تبدأ بحلية النون (الترويس) من الأعلى بزاوية 70 درجة تقريباً بمقدار نقطة.',
      'الهبوط بانسيابية مع تدوير القلم تدريجياً ليكون في أعمق نقطة أسفل السطر بمقدار نقطتين ونصف.',
      'الصعود في الطرف الأخير يكون رفيعاً ويتجه نحو الداخل بزاوية حادة.',
      'نقطة النون توضع في الثلث العلوي معلقة ولا تلتصق بالبدن بميلان خفيف.'
    ],
    anatomy: [
      { id: 'tarwees', name: 'الترويس والبداية', description: 'حلية رأس النون بقطة قلم مائلة بمقدار نقطة واحدة.', strokeOrder: 1 },
      { id: 'landing', name: 'النزول والتقويس', description: 'انحدار رشيق يتسع تدريجياً مع ضغط القصبة.', strokeOrder: 2 },
      { id: 'kaas', name: 'قاع الكأس', description: 'أثقل جزء في الحرف ويستقر تحت سطر الميزان بنصف نقطة.', strokeOrder: 3 },
      { id: 'tail', name: 'الطرف الصاعد', description: 'صعود مدبب ينتهي برأس القلم في اتجاه الداخل.', strokeOrder: 4 }
    ],
    targetImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    audioNarrationText: 'أهلاً بكم في درس حرف النون بخط الثلث. انتبه لزاوية قطة القلم عند سبعين درجة. تبدأ الحلية ثم الهبوط بانسيابية مع تدوير القلم، ويتسع الكأس لثلاث نقاط كاملة.',
    videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    videoTitle: 'شرح ميزان وتشريح حرف النون بخط الثلث',
    exemplarImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    colorScheme: {
      primary: '#d97706',
      secondary: '#b45309',
      accent: '#fbbf24'
    }
  },
  {
    id: 'ruqah-waw',
    title: 'حرف الواو المستقرة',
    letter: 'و',
    script: 'ruqah',
    scriptNameArabic: 'خط الرقعة',
    pageNumber: 22,
    difficulty: 'مبتدئ',
    penAngleDegrees: 85,
    pointScale: {
      widthDots: 2,
      heightDots: 2,
      depthDots: 0,
      description: 'رأس الواو مطموس بحجم نقطتين، مع استقرار تام على سطر الكتابة دون هبوط تحته.'
    },
    summary: 'خط الرقعة يمتاز بالسرعة والرشاقة، ورأس الواو فيه يُرسم مطموساً ومثلثي الشكل تقريباً مع زاوية ميلان حادة للقلم.',
    detailedRules: [
      'قطة القلم شبه عمودية بين 80 إلى 85 درجة.',
      'رأس الواو مصمت (مطموس الحشا) يُبنى بحركة دائرية سريعة بحجم نقطتين.',
      'عنق الحرف قصير للغاية يربط الرأس بالجسم بانحناء طفيف.',
      'ذيل الواو ينتهي بسحب خفيف يستقر مباشرة على السطر الأساسي للخط.'
    ],
    anatomy: [
      { id: 'head', name: 'الرأس المطموس', description: 'دوران مصمت لا فراغ فيه، كأنه نقطة مدورة.', strokeOrder: 1 },
      { id: 'neck', name: 'العنق القصير', description: 'نزول سريع بزاوية 50 درجة بمقدار نصف نقطة.', strokeOrder: 2 },
      { id: 'base', name: 'الجسم والمستقر', description: 'امتداد يشبه حرف الراء يستقر مستوياً على السطر.', strokeOrder: 3 }
    ],
    targetImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
    audioNarrationText: 'درس حرف الواو في خط الرقعة. تميز الواو هنا بأن رأسها مطموس تماماً دون بياض في الوسط، ويستقر الحرف بكامله فوق السطر.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoTitle: 'أسرار كتابة حرف الواو والراء في خط الرقعة',
    colorScheme: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#34d399'
    }
  },
  {
    id: 'naskh-ayn',
    title: 'حرف العين المفردة (الحاجب)',
    letter: 'ع',
    script: 'naskh',
    scriptNameArabic: 'خط النسخ',
    pageNumber: 38,
    difficulty: 'متقدم',
    penAngleDegrees: 60,
    pointScale: {
      widthDots: 4,
      heightDots: 5,
      depthDots: 3,
      description: 'حاجب العين نقطتان، وتجويف الجسم يستقر تحته نصف دائرة بميزان أربع نقاط اتساعاً.'
    },
    summary: 'يُسمى رأس العين في خط النسخ بـ "حاجب العين" لما يحمله من تقويس يشبه حاجب الإنسان، وجسمها ينزل تحت السطر برحابة.',
    detailedRules: [
      'زاوية قطة القلم في خط النسخ تبلغ 60 درجة تقريباً.',
      'يبدأ رسم الحاجب من اليسار صعوداً خفيفاً ثم انحداراً مقوساً نحو اليمين.',
      'العودة من أسفل الحاجب بسماكة أقل تمهد لجسم الحرف.',
      'الجسم ينزل تحت السطر بنصف بيضاوية واسعة تتسع لأربع نقاط وبطول خمس نقاط.'
    ],
    anatomy: [
      { id: 'hajib', name: 'حاجب العين', description: 'تقوس علوي مرن يشبه حاجب العين الطبيعي بمقدار نقطتين.', strokeOrder: 1 },
      { id: 'jafn', name: 'العنق والجفن', description: 'وصلة انسيابية راجعة ترتكز عليها العين.', strokeOrder: 2 },
      { id: 'belly', name: 'بطن العين', description: 'نزول هلالي تحت السطر ينتهي برأس نحيف مقوس نحو الأعلى.', strokeOrder: 3 }
    ],
    targetImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    audioNarrationText: 'مرحباً في درس حرف العين المفردة بخط النسخ. نلاحظ التقوس الجميل في حاجب العين، ثم الانحدار الهلالي الممتد تحت السطر.',
    videoUrl: 'https://www.youtube.com/embed/tgbNymZ7vqY',
    videoTitle: 'تشريح حاجب وبطن حرف العين بخط النسخ الأكاديمي',
    colorScheme: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      accent: '#60a5fa'
    }
  },
  {
    id: 'thuluth-bismillah',
    title: 'تركيب البسملة الشريفة',
    letter: '﷽',
    script: 'thuluth',
    scriptNameArabic: 'خط الثلث المركب',
    pageNumber: 5,
    difficulty: 'متقدم',
    penAngleDegrees: 70,
    pointScale: {
      widthDots: 12,
      heightDots: 7,
      depthDots: 4,
      description: 'تركيب هندسي متكامل تتداخل فيه السين مع الميم ومدات الألف واللام في لفظ الجلالة والرحمن والرحيم.'
    },
    summary: 'قمة الإعجاز في فن الخط العربي الكلاسيكي، تبرز فيه التراكيب الهرمية وتوازن الكتل والفراغات وتناغم الحركات الإعرابية.',
    detailedRules: [
      'توزيع الحروف في طبقات متراكبة مع الحفاظ على مقروئية النص من الأسفل للأعلى أو في سياق انسيابي.',
      'تطابق زوايا قطة القلم في كافة الألفات واللامات الصاعدة بزاوية 70 درجة متوازية.',
      'استخدام حركات التزيين (الظفر، الترويس، الشدات، الصفر المستدير) لملء الفراغات البصرية بتوازن.'
    ],
    anatomy: [
      { id: 'base-line', name: 'كرسي البسملة', description: 'السطر الأساسي الذي يحمل كلمة باسم ومدتها.', strokeOrder: 1 },
      { id: 'allah', name: 'لفظ الجلالة', description: 'صعود الألف واللامات المتوازية مع هاء الاستقرار.', strokeOrder: 2 },
      { id: 'rahman-rahim', name: 'الرحمن والرحيم', description: 'التوازن والمدات المتناغمة في الجانب الأيسر.', strokeOrder: 3 }
    ],
    targetImageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
    audioNarrationText: 'نستعرض هنا التركيب البديع للبسملة الشريفة بخط الثلث. لاحظ توازي الصواعد وانسجام الفراغات ونقاط الميزان المتقنة.',
    videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    videoTitle: 'تحليل التركيب الهندسي للبسملة في الخط العربي',
    colorScheme: {
      primary: '#9333ea',
      secondary: '#7e22ce',
      accent: '#c084fc'
    }
  }
];
