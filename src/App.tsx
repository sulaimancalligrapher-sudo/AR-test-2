/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_LESSONS } from './data/lessons';
import { CalligraphyLesson, MaterialType } from './types/calligraphy';
import { Navbar } from './components/Navbar';
import { ARCameraView } from './components/ARCameraView';
import { LessonHUD } from './components/LessonHUD';
import { TargetCardModal } from './components/TargetCardModal';
import { CustomLessonModal } from './components/CustomLessonModal';
import { VercelGuideModal } from './components/VercelGuideModal';
import { InstructionsBanner } from './components/InstructionsBanner';
import { narrator } from './utils/audioNarrator';

export default function App() {
  const [lessons, setLessons] = useState<CalligraphyLesson[]>(() => {
    try {
      const saved = localStorage.getItem('calligraphy_custom_lessons');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...INITIAL_LESSONS, ...parsed];
      }
    } catch (e) {
      console.warn('Error reading saved lessons:', e);
    }
    return INITIAL_LESSONS;
  });

  const [currentLesson, setCurrentLesson] = useState<CalligraphyLesson>(lessons[0]);
  const [materialType, setMaterialType] = useState<MaterialType>('gold');
  const [showPointsScale, setShowPointsScale] = useState<boolean>(true);
  const [showPenAngle, setShowPenAngle] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Modals state
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState<boolean>(false);
  const [isVercelGuideOpen, setIsVercelGuideOpen] = useState<boolean>(false);

  // Handle Audio toggle
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      narrator.stop();
      setIsPlayingAudio(false);
    } else {
      narrator.speak(
        currentLesson.audioNarrationText,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        currentLesson.audioUrl
      );
    }
  };

  // Switch lesson
  const handleSelectLesson = (lesson: CalligraphyLesson) => {
    narrator.stop();
    setIsPlayingAudio(false);
    setCurrentLesson(lesson);
  };

  // Add custom lesson from teacher
  const handleAddLesson = (newLesson: CalligraphyLesson) => {
    const updated = [newLesson, ...lessons];
    setLessons(updated);
    setCurrentLesson(newLesson);

    try {
      const customOnly = updated.filter(
        l => !INITIAL_LESSONS.some(init => init.id === l.id)
      );
      localStorage.setItem('calligraphy_custom_lessons', JSON.stringify(customOnly));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };

  // Stop audio on unmount or lesson change
  useEffect(() => {
    return () => {
      narrator.stop();
    };
  }, [currentLesson]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-['Tajawal',sans-serif]">
      {/* 1. Navbar */}
      <Navbar
        lessons={lessons}
        currentLesson={currentLesson}
        onSelectLesson={handleSelectLesson}
        onOpenAddLesson={() => setIsAddLessonOpen(true)}
        onOpenTargetCard={() => setIsTargetModalOpen(true)}
        onOpenVercelGuide={() => setIsVercelGuideOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Quick Instructions Banner */}
        <InstructionsBanner onOpenTargetCard={() => setIsTargetModalOpen(true)} />

        {/* Real-time AR Camera View with 3D Calligraphy Overlay */}
        <ARCameraView
          lesson={currentLesson}
          materialType={materialType}
          showPointsScale={showPointsScale}
          showPenAngle={showPenAngle}
          onTogglePointsScale={() => setShowPointsScale(!showPointsScale)}
          onTogglePenAngle={() => setShowPenAngle(!showPenAngle)}
          onChangeMaterial={(mat) => setMaterialType(mat)}
          onOpenTargetModal={() => setIsTargetModalOpen(true)}
        />

        {/* In-Camera Educational HUD (Rules, Audio Player, Video Modal, Anatomy) */}
        <LessonHUD
          lesson={currentLesson}
          isPlayingAudio={isPlayingAudio}
          onToggleAudio={handleToggleAudio}
        />
      </main>

      {/* 3. Footer */}
      <footer className="w-full bg-stone-950 border-t border-stone-850 py-4 px-6 text-center text-xs text-stone-500">
        <p>
          نظام الواقع المعزز التفاعلي لكتب فن الخط العربي • متوافق 100% مع حساب GitHub وموقع Vercel المجاني (بدون أي تكاليف أو اشتراكات).
        </p>
      </footer>

      {/* Modals */}
      <TargetCardModal
        lesson={currentLesson}
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
      />

      <CustomLessonModal
        isOpen={isAddLessonOpen}
        onClose={() => setIsAddLessonOpen(false)}
        onAddLesson={handleAddLesson}
      />

      <VercelGuideModal
        isOpen={isVercelGuideOpen}
        onClose={() => setIsVercelGuideOpen(false)}
      />
    </div>
  );
}
