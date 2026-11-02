/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, Deliverable, StudyBlock } from './types';
import { INITIAL_PREPOPULATED_COURSES } from './data/sampleSyllabi';
import { Navbar, ActiveTab } from './components/Navbar';
import { CourseSelector } from './components/CourseSelector';
import { SyllabusUploader } from './components/SyllabusUploader';
import { DeliverablesLedger } from './components/DeliverablesLedger';
import { PlanningWizard } from './components/PlanningWizard';
import { StudyTimelineView } from './components/StudyTimelineView';
import { WorkloadHeatmap } from './components/WorkloadHeatmap';
import { SickDayRescheduleModal } from './components/SickDayRescheduleModal';
import { NewCourseModal } from './components/NewCourseModal';
import { DailyFocusCard } from './components/DailyFocusCard';

const STORAGE_KEY = 'syllabuspilot_courses_v1';

export default function App() {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load courses from localStorage', e);
    }
    return INITIAL_PREPOPULATED_COURSES;
  });

  const [activeCourseId, setActiveCourseId] = useState<string>(
    courses[0]?.id || INITIAL_PREPOPULATED_COURSES[0].id
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('syllabus');
  const [isPlanningWizardMode, setIsPlanningWizardMode] = useState<boolean>(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState<boolean>(false);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses to localStorage', e);
    }
  }, [courses]);

  const activeCourse =
    courses.find((c) => c.id === activeCourseId) || courses[0] || INITIAL_PREPOPULATED_COURSES[0];

  // Course handlers
  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const handleUpdateAllCourses = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
  };

  const handleAddNewCourse = (newCourse: Course) => {
    setCourses((prev) => [...prev, newCourse]);
    setActiveCourseId(newCourse.id);
    setActiveTab('syllabus');
    setIsPlanningWizardMode(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    const remaining = courses.filter((c) => c.id !== courseId);
    if (remaining.length > 0) {
      setCourses(remaining);
      if (activeCourseId === courseId) {
        setActiveCourseId(remaining[0].id);
      }
    }
  };

  const handleUpdateDeliverables = (updatedDeliverables: Deliverable[]) => {
    handleUpdateCourse({
      ...activeCourse,
      deliverables: updatedDeliverables,
    });
  };

  // Toggle study block from Daily Focus Card
  const handleToggleBlock = (block: StudyBlock) => {
    const parent = courses.find((c) => c.id === block.courseId);
    if (!parent) return;

    const updatedBlocks = parent.studyBlocks.map((b) =>
      b.id === block.id ? { ...b, isCompleted: !b.isCompleted } : b
    );
    handleUpdateCourse({
      ...parent,
      studyBlocks: updatedBlocks,
    });
  };

  // Deliverables count for navbar
  const allDeliverables = courses.flatMap((c) => c.deliverables);
  const upcomingCount = allDeliverables.filter((d) => !d.isCompleted).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2D2A26] selection:bg-[#EADBCE]">
      {/* Strict 3-Zone Top Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsPlanningWizardMode(false);
        }}
        onOpenImport={() => {
          setActiveTab('syllabus');
          setIsPlanningWizardMode(false);
        }}
        totalCoursesCount={courses.length}
        upcomingDeliverablesCount={upcomingCount}
      />

      {/* Course Selector Tabs */}
      <CourseSelector
        courses={courses}
        activeCourseId={activeCourseId}
        onSelectCourse={(id) => {
          setActiveCourseId(id);
          setIsPlanningWizardMode(false);
        }}
        onAddNewCourse={() => setIsNewCourseModalOpen(true)}
        onDeleteCourse={handleDeleteCourse}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-8">
        {/* Daily Focus Card shown on Timeline or Syllabus tabs */}
        {(activeTab === 'timeline' || activeTab === 'syllabus') && (
          <DailyFocusCard courses={courses} onToggleBlock={handleToggleBlock} />
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'syllabus' && (
          <SyllabusUploader
            currentCourse={activeCourse}
            onUpdateCourse={handleUpdateCourse}
            onNavigateToDeliverables={() => setActiveTab('deliverables')}
          />
        )}

        {activeTab === 'deliverables' && (
          <DeliverablesLedger
            course={activeCourse}
            onUpdateDeliverables={handleUpdateDeliverables}
            onProceedToPlanning={() => {
              setIsPlanningWizardMode(true);
              setActiveTab('timeline');
            }}
          />
        )}

        {activeTab === 'timeline' && (
          <>
            {isPlanningWizardMode ? (
              <PlanningWizard
                course={activeCourse}
                onUpdateCourse={handleUpdateCourse}
                onPlanGenerated={() => setIsPlanningWizardMode(false)}
              />
            ) : (
              <StudyTimelineView
                courses={courses}
                activeCourseId={activeCourseId}
                onUpdateCourse={handleUpdateCourse}
                onOpenRescheduleModal={() => setIsRescheduleModalOpen(true)}
                onNavigateToPlanning={() => setIsPlanningWizardMode(true)}
              />
            )}
          </>
        )}

        {activeTab === 'heatmap' && (
          <WorkloadHeatmap
            courses={courses}
            onOpenRescheduleModal={() => setIsRescheduleModalOpen(true)}
          />
        )}
      </main>

      {/* Quiet Academic Footer */}
      <footer className="mt-auto border-t border-[#E8E2D5] bg-[#F5F0E4]/40 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C8275]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#2D2A26]">SyllabusPilot</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Academic Syllabus Agent</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>GDG Riga + GDG on Campus RTU Hackathon</span>
            <span aria-hidden="true">·</span>
            <span>Multimodal Gemini 3.8 Flash</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                if (confirm('Reset to initial sample courses? This will reload BIO 101 and CS 200.')) {
                  setCourses(INITIAL_PREPOPULATED_COURSES);
                  setActiveCourseId(INITIAL_PREPOPULATED_COURSES[0].id);
                  localStorage.removeItem(STORAGE_KEY);
                }
              }}
              className="hover:text-[#C2410C] underline underline-offset-2"
            >
              Reset Sample Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SickDayRescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        courses={courses}
        onUpdateAllCourses={handleUpdateAllCourses}
      />

      <NewCourseModal
        isOpen={isNewCourseModalOpen}
        onClose={() => setIsNewCourseModalOpen(false)}
        onAddCourse={handleAddNewCourse}
      />
    </div>
  );
}
