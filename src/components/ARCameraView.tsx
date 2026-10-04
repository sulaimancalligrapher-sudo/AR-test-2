import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Box,
  Zap,
  Check
} from 'lucide-react';
import { CalligraphyLesson, MaterialType } from '../types/calligraphy';
import { buildLesson3DGroup } from '../utils/calligraphy3D';
import { cvDetector, playARSuccessChime } from '../utils/cvDetector';

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

  // Real-time Optical Target Tracking States
  const [isTargetDetected, setIsTargetDetected] = useState<boolean>(false);
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const consecutiveMatchesRef = useRef<number>(0);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const camera3DRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const modelScaleRef = useRef<number>(0);

  // Touch / Mouse interaction states for rotating 3D letter
  const isDraggingRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const modelRotationRef = useRef<{ x: number; y: number }>({ x: 0.1, y: 0 });

  // Start Camera explicitly on user request
  const startCamera = async (targetFacing?: 'environment' | 'user') => {
    const facing = targetFacing || cameraFacing;
    setIsLoadingCamera(true);
    setCameraError(null);
    setIsTargetDetected(false);
    setDetectionConfidence(0);
    consecutiveMatchesRef.current = 0;
    modelScaleRef.current = 0;

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
        // Try back camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (e) {
        // Fallback for laptops/webcams
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
    setIsTargetDetected(false);
    setDetectionConfidence(0);
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
    setIsTargetDetected(true);
    modelScaleRef.current = 1;
    setViewMode('studio');
  };

  // Manual Trigger / Force Lock Override
  const forceLockTarget = () => {
    setIsTargetDetected(true);
    setDetectionConfidence(1.0);
    playARSuccessChime();
  };

  // Reset Scan
  const resetScan = () => {
    setIsTargetDetected(false);
    setDetectionConfidence(0);
    consecutiveMatchesRef.current = 0;
    modelScaleRef.current = 0;
  };

  // Optical Detection Loop (Active when in 'ar' mode and target is not yet locked)
  useEffect(() => {
    if (viewMode !== 'ar' || isTargetDetected) return;

    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      const result = cvDetector.analyzeFrame(videoRef.current);
      setDetectionConfidence(result.confidence);

      if (result.detected) {
        consecutiveMatchesRef.current += 1;
        // Require 2 consecutive frames for stability
        if (consecutiveMatchesRef.current >= 2) {
          setIsTargetDetected(true);
          playARSuccessChime();
        }
      } else {
        consecutiveMatchesRef.current = Math.max(0, consecutiveMatchesRef.current - 1);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [viewMode, isTargetDetected]);

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
        // Handle visibility and scale
        // In AR mode: only visible when isTargetDetected is true
        // In studio mode: always visible
        const targetScale = (viewMode === 'studio' || isTargetDetected) ? 1.0 : 0.0;
        modelScaleRef.current += (targetScale - modelScaleRef.current) * 0.12;

        if (modelScaleRef.current > 0.01) {
          currentModelGroupRef.current.visible = true;
          currentModelGroupRef.current.scale.set(
            modelScaleRef.current,
            modelScaleRef.current,
            modelScaleRef.current
          );
          currentModelGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
          currentModelGroupRef.current.rotation.x = modelRotationRef.current.x;
          currentModelGroupRef.current.rotation.y = modelRotationRef.current.y + Math.sin(elapsedTime * 0.4) * 0.05;
        } else {
          currentModelGroupRef.current.visible = false;
        }
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
  }, [viewMode, isTargetDetected]);

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
    newGroup.visible = isTargetDetected || viewMode === 'studio';
    sceneRef.current.add(newGroup);
    currentModelGroupRef.current = newGroup;
  }, [lesson, materialType, showPointsScale, showPenAngle, isTargetDetected, viewMode]);

  // Touch and Mouse Drag to rotate 3D letter
  const handlePointerDown = (e: React.PointerEvent) => {
    if (viewMode === 'idle' || (!isTargetDetected && viewMode === 'ar')) return;
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

      {/* 3. Three.js WebGL Canvas for 3D Calligraphy (Visible when target is detected or in studio) */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full z-10 transition-opacity duration-300 ${
          viewMode === 'idle' 
            ? 'opacity-0 pointer-events-none' 
            : isTargetDetected || viewMode === 'studio'
              ? 'opacity-100 cursor-grab active:cursor-grabbing pointer-events-auto'
              : 'opacity-0 pointer-events-none'
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
            <span>التعرف البصري بالواقع المعزز (AR Image Tracking)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mb-2 font-['Amiri',serif]">
            {lesson.title} ({lesson.scriptNameArabic}) - صفحة {lesson.pageNumber}
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 max-w-md leading-relaxed mb-6">
            اضغط على زر <strong className="text-amber-300">تشغيل الكاميرا</strong>، ثم وجّه الكاميرا نحو صفحة الدرس في الكتاب أو البطاقة ليتعرف عليها النظام ويرفع الحرف ثلاثي الأبعاد فوق الصفحة!
          </p>

          {/* Camera Error Alert if any */}
          {cameraError && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs max-w-lg text-right shadow-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed space-y-2">
                  <p className="font-bold text-amber-300 text-sm">
                    تنبيه إذن الكاميرا:
                  </p>
                  <p className="text-stone-300">{cameraError}</p>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      فتح في نافذة مستقلة
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
                  <span>جاري تشغيل الكاميرا...</span>
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
              <span>نافذة مستقلة</span>
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

      {/* 5. In-Camera AR Viewfinder & Controls (Active when viewMode === 'ar' or 'studio') */}
      {viewMode !== 'idle' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3.5 sm:p-4">
          {/* Top Status Header */}
          <div className="flex items-center justify-between pointer-events-auto">
            {/* Status Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-stone-950/90 backdrop-blur-md border border-stone-700 text-xs shadow-lg">
              {viewMode === 'studio' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className="text-sky-300 font-bold flex items-center gap-1">
                    <Box className="w-3.5 h-3.5" />
                    وضع استوديو 3D (معاينة الحرف وزوايا القلم)
                  </span>
                </>
              ) : isTargetDetected ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    تم التعرف على الصفحة! مجسم {lesson.letter} مثبت الآن
                  </span>
                </>
              ) : (
                <>
                  <ScanLine className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-300 font-medium flex items-center gap-1.5">
                    <span>جاري مسح صفحة الدرس...</span>
                    <span className="text-stone-400 text-[11px] font-mono">
                      ({Math.round(detectionConfidence * 100)}%)
                    </span>
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

              {viewMode === 'ar' && isTargetDetected && (
                <button
                  onClick={resetScan}
                  title="إعادة مسح صفحة جديدة"
                  className="px-2.5 py-1.5 rounded-xl bg-stone-900/85 backdrop-blur-md border border-stone-700 text-stone-200 hover:text-amber-400 transition text-xs flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">إعادة مسح</span>
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

          {/* AR Target Reticle Viewfinder (Only in AR mode) */}
          {viewMode === 'ar' && (
            <div className="relative mx-auto w-60 h-60 sm:w-72 sm:h-72 flex flex-col items-center justify-center transition-all">
              {/* Outer Scanning Frame */}
              <div 
                className={`relative w-full h-full rounded-3xl border-2 transition-colors duration-300 flex items-center justify-center overflow-hidden ${
                  isTargetDetected 
                    ? 'border-emerald-500/80 bg-emerald-500/5' 
                    : 'border-dashed border-amber-400/60 bg-amber-500/5'
                }`}
              >
                {/* Corner Guides */}
                <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg ${isTargetDetected ? 'border-emerald-400' : 'border-amber-400'}`} />
                <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg ${isTargetDetected ? 'border-emerald-400' : 'border-amber-400'}`} />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg ${isTargetDetected ? 'border-emerald-400' : 'border-amber-400'}`} />
                <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg ${isTargetDetected ? 'border-emerald-400' : 'border-amber-400'}`} />

                {/* Animated Laser Scanning Line (Only while searching) */}
                {!isTargetDetected && (
                  <div 
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-lg shadow-amber-400/50 animate-pulse"
                    style={{
                      animation: 'scanLaser 2s ease-in-out infinite alternate',
                    }}
                  />
                )}

                {/* Prompt inside the reticle when searching */}
                {!isTargetDetected && (
                  <div className="bg-stone-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl text-center border border-amber-500/30 max-w-[85%] shadow-xl pointer-events-auto">
                    <p className="text-amber-300 text-xs font-bold font-['Amiri',serif] mb-0.5">
                      ضع صفحة {lesson.title} داخل هذا الإطار
                    </p>
                    <p className="text-[10px] text-stone-300">
                      أو وجه الكاميرا نحو الحرف في البطاقة
                    </p>
                    {/* Live confidence meter */}
                    <div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full transition-all duration-150"
                        style={{ width: `${Math.round(detectionConfidence * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-reticle Quick Action */}
              {!isTargetDetected ? (
                <div className="mt-3 flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={forceLockTarget}
                    className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95"
                    title="تجاوز المسح وتثبيت الحرف مباشرة"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>تثبيت الحرف الآن (فوري)</span>
                  </button>

                  <button
                    onClick={onOpenTargetModal}
                    className="px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-700 transition"
                  >
                    عرض البطاقة
                  </button>
                </div>
              ) : (
                <div className="mt-3 pointer-events-auto">
                  <span className="text-[11px] text-stone-200 bg-stone-950/85 px-3 py-1 rounded-full border border-stone-800 backdrop-blur">
                    اسحب الشاشة لتدوير الحرف وفحص ميزان النقاط
                  </span>
                </div>
              )}
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

          {/* Bottom Floating Controls (Enabled when target detected or in studio) */}
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
