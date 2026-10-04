import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Camera, 
  Rotate3d, 
  Sparkles, 
  Eye, 
  Compass, 
  CameraOff, 
  SwitchCamera, 
  Layers, 
  CheckCircle2, 
  ScanLine,
  ExternalLink,
  AlertCircle,
  PlayCircle,
  RefreshCw,
  Box
} from 'lucide-react';
import { CalligraphyLesson, MaterialType } from '../types/calligraphy';
import { buildLesson3DGroup } from '../utils/calligraphy3D';

interface ARCameraViewProps {
  lesson: CalligraphyLesson;
  materialType: MaterialType;
  showPointsScale: boolean;
  showPenAngle: boolean;
  onTogglePointsScale: () => void;
  onTogglePenAngle: () => void;
  onChangeMaterial: (mat: MaterialType) => void;
  onOpenTargetModal: () => void;
}

type ViewMode = 'idle' | 'ar' | 'studio';

export const ARCameraView: React.FC<ARCameraViewProps> = ({
  lesson,
  materialType,
  showPointsScale,
  showPenAngle,
  onTogglePointsScale,
  onTogglePenAngle,
  onChangeMaterial,
  onOpenTargetModal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // States
  const [viewMode, setViewMode] = useState<ViewMode>('idle');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTargetLocked, setIsTargetLocked] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const camera3DRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Touch / Mouse interaction states for rotating 3D letter
  const isDraggingRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const modelRotationRef = useRef<{ x: number; y: number }>({ x: 0.1, y: 0 });

  // Start Camera explicitly on user request
  const startCamera = async (targetFacing?: 'environment' | 'user') => {
    const facing = targetFacing || cameraFacing;
    setIsLoadingCamera(true);
    setCameraError(null);

    // Stop previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('المتصفح لا يدعم الوصول المباشر للكاميرا');
      }

      let stream: MediaStream;
      try {
        // Try requested facing mode (ideal for mobile back camera)
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e) {
        // Fallback for laptops/webcams where facingMode might fail
        console.warn('Fallback to default video device:', e);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      setViewMode('ar');
    } catch (err: any) {
      console.error('Camera activation error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('تم رفض إذن الكاميرا في المتصفح. اضغط على رمز القفل/الكاميرا في شريط عنوان المتصفح للسماح بالكاميرا، أو افتح الرابط المباشر على الهاتف.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('لم يتم العثور على كاميرا موصولة بجهازك. يمكنك استخدام وضع استوديو 3D.');
      } else {
        setCameraError(err.message || 'تعذر تشغيل الكاميرا.');
      }
      setViewMode('idle');
    } finally {
      setIsLoadingCamera(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setViewMode('idle');
  };

  // Switch Facing (Front / Back)
  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (viewMode === 'ar') {
      await startCamera(nextFacing);
    }
  };

  // Enter 3D Studio mode without camera
  const enterStudioMode = () => {
    stopCamera();
    setViewMode('studio');
  };

  // Initialize Three.js Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    camera3DRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    keyLight.position.set(4, 6, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 1.8);
    rimLight.position.set(-4, -2, 4);
    scene.add(rimLight);

    const bottomFill = new THREE.PointLight(0xfbbf24, 1.2, 10);
    bottomFill.position.set(0, -3, 3);
    scene.add(bottomFill);

    // Initial 3D Model
    const modelGroup = buildLesson3DGroup(lesson, materialType, showPointsScale, showPenAngle);
    scene.add(modelGroup);
    currentModelGroupRef.current = modelGroup;

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (currentModelGroupRef.current) {
        currentModelGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
        currentModelGroupRef.current.rotation.x = modelRotationRef.current.x;
        currentModelGroupRef.current.rotation.y = modelRotationRef.current.y + Math.sin(elapsedTime * 0.4) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update 3D Model when lesson, material, or options change
  useEffect(() => {
    if (!sceneRef.current) return;

    if (currentModelGroupRef.current) {
      sceneRef.current.remove(currentModelGroupRef.current);
      currentModelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });
    }

    const newGroup = buildLesson3DGroup(lesson, materialType, showPointsScale, showPenAngle);
    sceneRef.current.add(newGroup);
    currentModelGroupRef.current = newGroup;
  }, [lesson, materialType, showPointsScale, showPenAngle]);

  // Touch and Mouse Drag to rotate 3D letter
  const handlePointerDown = (e: React.PointerEvent) => {
    if (viewMode === 'idle') return;
    isDraggingRef.current = true;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevPointerRef.current.x;
    const deltaY = e.clientY - prevPointerRef.current.y;

    modelRotationRef.current.y += deltaX * 0.008;
    modelRotationRef.current.x += deltaY * 0.008;
    modelRotationRef.current.x = Math.max(-0.8, Math.min(0.8, modelRotationRef.current.x));

    prevPointerRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const resetRotation = () => {
    modelRotationRef.current = { x: 0.1, y: 0 };
  };

  // Re-scan simulation
  const handleRescan = () => {
    setIsScanning(true);
    setIsTargetLocked(false);
    setTimeout(() => {
      setIsScanning(false);
      setIsTargetLocked(true);
    }, 1000);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[66vh] md:h-[74vh] bg-stone-950 overflow-hidden rounded-2xl border border-stone-800 shadow-2xl select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 1. Live Camera Video Feed (Active when viewMode === 'ar') */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          viewMode === 'ar' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 2. Studio Background (Active when viewMode === 'studio') */}
      {viewMode === 'studio' && (
        <div 
          className="absolute inset-0 bg-radial from-stone-900 via-stone-950 to-black"
          style={{
            backgroundImage: `radial-gradient(circle at center, #1c1917 0%, #0c0a09 100%)`,
          }}
        />
      )}

      {/* 3. Three.js WebGL Canvas for 3D Calligraphy (Visible in 'ar' and 'studio') */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full z-10 ${
          viewMode === 'idle' ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-grab active:cursor-grabbing pointer-events-auto'
        }`}
      />

      {/* 4. Idle Screen / Camera Launcher Dashboard (When viewMode === 'idle') */}
      {viewMode === 'idle' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-stone-900/95 via-stone-950/98 to-black">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-xl shadow-amber-500/10">
            <Camera className="w-10 h-10 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تجربة الواقع المعزز للكتاب التعليمي</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mb-2 font-['Amiri',serif]">
            {lesson.title} ({lesson.scriptNameArabic}) - صفحة {lesson.pageNumber}
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 max-w-md leading-relaxed mb-6">
            اضغط على زر <strong className="text-amber-300">تشغيل الكاميرا</strong> لتوجيه الهاتف نحو صفحة الدرس في الكتاب ومشاهدة الحرف ثلاثي الأبعاد يرتفع مباشرة في الغرفة فوق الورقة!
          </p>

          {/* Camera Error Alert if any */}
          {cameraError && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs max-w-lg text-right shadow-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed space-y-2">
                  <p className="font-bold text-amber-300 text-sm">
                    سبب عدم ظهور نافذة طلب الإذن:
                  </p>
                  <p className="text-stone-300">
                    المتصفح يحجب نافذة الإذن تلقائياً لأنك تتصفح من داخل <strong>إطار المعاينة الداخلي (iFrame)</strong> لحماية خصوصيتك.
                  </p>
                  <p className="text-amber-300 font-semibold">
                    لظهور نافذة طلب الإذن فوراً: اضغط على الزر أدناه لفتح التطبيق في صفحة مستقلة أو جربه على هاتفك:
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      فتح في نافذة مستقلة لطلب الإذن
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
            {/* Start Live Camera Button */}
            <button
              onClick={() => startCamera()}
              disabled={isLoadingCamera}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/25 transition transform active:scale-95 cursor-pointer"
            >
              {isLoadingCamera ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>جاري طلب إذن الكاميرا...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>تشغيل كاميرا الواقع المعزز</span>
                </>
              )}
            </button>

            {/* Direct Window Button */}
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-3.5 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 font-semibold rounded-2xl text-sm flex items-center justify-center gap-2 transition"
              title="فتح التطبيق في علامة تبويب كاملة بدون إطار"
            >
              <ExternalLink className="w-4 h-4" />
              <span>نافذة مستقلة (موصى به)</span>
            </a>

            {/* 3D Studio inspection mode without camera */}
            <button
              onClick={enterStudioMode}
              className="w-full sm:w-auto px-4 py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 hover:border-stone-500 font-semibold rounded-2xl text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Box className="w-4 h-4 text-stone-400" />
              <span>استوديو 3D</span>
            </button>
          </div>

          {/* Quick link to Target Card */}
          <div className="mt-5 flex items-center gap-4 text-xs text-stone-400">
            <button
              onClick={onOpenTargetModal}
              className="hover:text-amber-400 flex items-center gap-1 underline transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              عرض بطاقة صفحة الدرس {lesson.pageNumber} للطباعة
            </button>
          </div>
        </div>
      )}

      {/* 5. In-Camera AR Controls & Reticle (Active when viewMode === 'ar' or 'studio') */}
      {viewMode !== 'idle' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3.5 sm:p-4">
          {/* Top Status Header */}
          <div className="flex items-center justify-between pointer-events-auto">
            {/* Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950/85 backdrop-blur-md border border-stone-700 text-xs">
              {viewMode === 'ar' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    الكاميرا الحية نشطة • مجسم الحرف فوق الصفحة
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-sky-300 font-bold flex items-center gap-1">
                    <Box className="w-3.5 h-3.5" />
                    وضع استوديو 3D (معاينة الحرف وزوايا القلم)
                  </span>
                </>
              )}
            </div>

            {/* Camera Actions */}
            <div className="flex items-center gap-1.5">
              {viewMode === 'ar' && (
                <button
                  onClick={toggleCameraFacing}
                  title="تبديل الكاميرا الخلفية / الأمامية"
                  className="p-2 rounded-xl bg-stone-900/85 backdrop-blur-md border border-stone-700 text-stone-200 hover:text-amber-400 transition"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              )}

              {viewMode === 'ar' && (
                <button
                  onClick={handleRescan}
                  title="إعادة مسح وضبط مكان الحرف"
                  className="px-2.5 py-1.5 rounded-xl bg-stone-900/85 backdrop-blur-md border border-stone-700 text-stone-200 hover:text-amber-400 transition text-xs flex items-center gap-1 font-medium"
                >
                  <ScanLine className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">إعادة ضبط</span>
                </button>
              )}

              {/* Stop / Exit camera button */}
              <button
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-stone-300 hover:text-red-400 border border-stone-700 transition text-xs font-semibold flex items-center gap-1.5"
                title="إيقاف الكاميرا والعودة"
              >
                <CameraOff className="w-3.5 h-3.5 text-red-400" />
                <span>إيقاف</span>
              </button>
            </div>
          </div>

          {/* AR Target Reticle (Only in AR mode) */}
          {viewMode === 'ar' && (
            <div className="relative mx-auto w-56 h-56 sm:w-72 sm:h-72 border-2 border-dashed border-amber-400/40 rounded-3xl flex items-center justify-center transition-all">
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />

              <div className="absolute -bottom-7 text-center w-full">
                <span className="text-[11px] text-stone-200 bg-stone-950/80 px-3 py-1 rounded-full border border-stone-800 backdrop-blur">
                  وجّه الكاميرا نحو صفحة الكتاب واسحب لتدوير الحرف
                </span>
              </div>
            </div>
          )}

          {/* Studio hint */}
          {viewMode === 'studio' && (
            <div className="text-center">
              <span className="text-xs text-amber-300 bg-stone-950/80 px-3 py-1.5 rounded-full border border-stone-800 backdrop-blur">
                اسحب الشاشة لتدوير الحرف 360 درجة وفحص ميزان النقاط
              </span>
            </div>
          )}

          {/* Bottom Floating Controls */}
          <div className="flex items-center justify-between gap-2 pointer-events-auto pt-2">
            {/* Toggles */}
            <div className="flex items-center gap-1.5 bg-stone-950/85 backdrop-blur-md p-1.5 rounded-2xl border border-stone-800">
              <button
                onClick={onTogglePointsScale}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                  showPointsScale
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="إظهار / إخفاء ميزان النقاط"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ميزان النقاط</span>
              </button>

              <button
                onClick={onTogglePenAngle}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                  showPenAngle
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="إظهار زاوية قطة القلم"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>القطة ({lesson.penAngleDegrees}°)</span>
              </button>

              <button
                onClick={resetRotation}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition"
                title="إعادة ضبط زاوية الرؤية"
              >
                <Rotate3d className="w-4 h-4" />
              </button>
            </div>

            {/* Material switcher */}
            <div className="flex items-center gap-1 bg-stone-950/85 backdrop-blur-md p-1.5 rounded-2xl border border-stone-800">
              {(['gold', 'ink', 'bronze', 'emerald'] as MaterialType[]).map((mat) => {
                const colors = {
                  gold: 'bg-amber-400',
                  ink: 'bg-stone-800 border border-stone-600',
                  bronze: 'bg-amber-700',
                  emerald: 'bg-emerald-600',
                };
                const titles = {
                  gold: 'ذهب مذهب',
                  ink: 'حبر أسود صيني',
                  bronze: 'نحاس معتق',
                  emerald: 'زمرد لازوردي',
                };
                return (
                  <button
                    key={mat}
                    onClick={() => onChangeMaterial(mat)}
                    className={`w-6 h-6 rounded-full ${colors[mat]} transition transform ${
                      materialType === mat ? 'ring-2 ring-white scale-110' : 'opacity-65 hover:opacity-100'
                    }`}
                    title={titles[mat]}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
