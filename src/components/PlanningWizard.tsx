/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, StudyPreferences } from '../types';
import { generateStudyPlanForCourse } from '../utils/planner';
import {
  Clock,
  Calendar,
  Compass,
  ArrowRight,
  Sparkles,
  Check,
  Sun,
  Sunset,
  Moon,
  Info,
} from 'lucide-react';

interface PlanningWizardProps {
  course: Course;
  onUpdateCourse: (updated: Course) => void;
  onPlanGenerated: () => void;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const PlanningWizard: React.FC<PlanningWizardProps> = ({
  course,
  onUpdateCourse,
  onPlanGenerated,
}) => {
  const [weeklyHours, setWeeklyHours] = useState(course.preferences?.weeklyHours || 6);
  const [preferredDays, setPreferredDays] = useState<string[]>(
    course.preferences?.preferredDays || ['Mon', 'Wed', 'Sat']
  );
  const [studyTimeOfDay, setStudyTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>(
    course.preferences?.studyTimeOfDay || 'evening'
  );
  const [bufferDays, setBufferDays] = useState(course.preferences?.bufferDaysBeforeExam || 10);
  const [targetIntensity, setTargetIntensity] = useState<'balanced' | 'rigorous' | 'light'>(
    course.preferences?.targetIntensity || 'balanced'
  );

  const toggleDay = (day: string) => {
    if (preferredDays.includes(day)) {
      if (preferredDays.length > 1) {
        setPreferredDays(preferredDays.filter((d) => d !== day));
      }
    } else {
      setPreferredDays([...preferredDays, day]);
    }
  };

  const handleGeneratePlan = () => {
    const preferences: StudyPreferences = {
      weeklyHours,
      preferredDays,
      studyTimeOfDay,
      bufferDaysBeforeExam: bufferDays,
      targetIntensity,
    };

    const newBlocks = generateStudyPlanForCourse(course, preferences);

    const updatedCourse: Course = {
      ...course,
      preferences,
      studyBlocks: newBlocks,
    };

    onUpdateCourse(updatedCourse);
    onPlanGenerated();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#E8E2D5] pb-5">
        <div className="flex items-center gap-2 text-xs font-serif italic text-[#8C8275] mb-1">
          <span>Module 03</span>
          <span aria-hidden="true">·</span>
          <span>Adaptive Study Strategy</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">
          Configure Your Study Plan for {course.code}
        </h1>
        <p className="mt-1.5 text-sm text-[#6B6357]">
          Answer 3 quick questions about your schedule. SyllabusPilot will calculate the exact study sessions required before each exam and deliverable.
        </p>
      </div>

      {/* 3 Questions Container */}
      <div className="space-y-6">
        {/* Question 1: Hours per week */}
        <div className="p-6 bg-white border border-[#E5DFD3] rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-serif italic text-[#C2410C]">
                <span>Question 01 of 03</span>
              </div>
              <h2 className="text-base font-serif font-bold text-[#2D2A26] mt-0.5">
                How many hours a week can you realistically commit to {course.code}?
              </h2>
              <p className="text-xs text-[#8C8275] mt-1">
                We distribute prep sessions evenly so you never have to pull an all-nighter before the midterm.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono text-2xl font-bold text-[#2D2A26] tabular-nums">
                {weeklyHours}
              </span>
              <span className="text-xs text-[#8C8275] ml-1">hrs/week</span>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="2"
            max="16"
            step="1"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            className="w-full accent-[#C2410C] cursor-pointer"
          />

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-[#8C8275] mr-1">Suggested presets:</span>
            {[
              { label: 'Light (4h)', val: 4 },
              { label: 'Balanced (6h · Recommended)', val: 6 },
              { label: 'Intensive (8h)', val: 8 },
              { label: 'Deep Focus (12h)', val: 12 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setWeeklyHours(p.val)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  weeklyHours === p.val
                    ? 'bg-[#2D2A26] text-white border-[#2D2A26]'
                    : 'bg-[#FAF7F0] text-[#6B6357] border-[#E5DFD3] hover:bg-[#F3EFE6]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Preferred Days and Time */}
        <div className="p-6 bg-white border border-[#E5DFD3] rounded-lg space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-serif italic text-[#C2410C]">
              <span>Question 02 of 03</span>
            </div>
            <h2 className="text-base font-serif font-bold text-[#2D2A26] mt-0.5">
              Which days and times fit your study routine best?
            </h2>
            <p className="text-xs text-[#8C8275] mt-1">
              Select the days you prefer to sit down and study. We will place study blocks on these days.
            </p>
          </div>

          {/* Day Selector Buttons */}
          <div>
            <label className="text-xs font-semibold text-[#2D2A26] block mb-2">
              Preferred Study Days ({preferredDays.length} selected):
            </label>
            <div className="grid grid-cols-7 gap-2">
              {ALL_DAYS.map((day) => {
                const isSelected = preferredDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-1 text-xs font-medium rounded-md border text-center transition-all ${
                      isSelected
                        ? 'bg-[#2D2A26] text-white border-[#2D2A26] shadow-xs'
                        : 'bg-[#FAF7F0] text-[#6B6357] border-[#E5DFD3] hover:bg-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time of Day */}
          <div>
            <label className="text-xs font-semibold text-[#2D2A26] block mb-2">
              Preferred Study Window:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'morning', label: 'Mornings (9:00 AM)', icon: Sun, desc: 'Early deep work before classes' },
                { id: 'afternoon', label: 'Afternoons (2:00 PM)', icon: Sunset, desc: 'Post-lecture study sessions' },
                { id: 'evening', label: 'Evenings (7:00 PM)', icon: Moon, desc: 'Quiet library evening hours' },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = studyTimeOfDay === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setStudyTimeOfDay(t.id as any)}
                    className={`text-left p-3.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#FAF7F0] border-[#C2410C] text-[#2D2A26] shadow-xs'
                        : 'bg-white border-[#E5DFD3] text-[#6B6357] hover:border-[#8C8275]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C2410C]' : 'text-[#8C8275]'}`} />
                      <span className="font-semibold text-xs text-[#2D2A26]">{t.label}</span>
                    </div>
                    <p className="text-[11px] text-[#8C8275]">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question 3: Buffer Runway */}
        <div className="p-6 bg-white border border-[#E5DFD3] rounded-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-serif italic text-[#C2410C]">
                <span>Question 03 of 03</span>
              </div>
              <h2 className="text-base font-serif font-bold text-[#2D2A26] mt-0.5">
                How many days before major exams & essays should study blocks ramp up?
              </h2>
              <p className="text-xs text-[#8C8275] mt-1">
                The agent generates progressive study milestones (flashcards, mock exam, synthesis) inside this runway window.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono text-2xl font-bold text-[#2D2A26] tabular-nums">
                {bufferDays}
              </span>
              <span className="text-xs text-[#8C8275] ml-1">days prior</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { val: 7, title: '7 Days Before', desc: 'Short sprint for weekly quizzes & essays' },
              { val: 10, title: '10 Days Before (Recommended)', desc: 'Ideal for 25-30% weight midterms' },
              { val: 14, title: '14 Days Before', desc: 'Extended multi-stage runway for cumulative finals' },
            ].map((b) => (
              <button
                key={b.val}
                onClick={() => setBufferDays(b.val)}
                className={`text-left p-3.5 rounded-lg border transition-all ${
                  bufferDays === b.val
                    ? 'bg-[#FAF7F0] border-[#C2410C] text-[#2D2A26] shadow-xs'
                    : 'bg-white border-[#E5DFD3] text-[#6B6357] hover:border-[#8C8275]'
                }`}
              >
                <span className="font-semibold text-xs text-[#2D2A26] block mb-0.5">
                  {b.title}
                </span>
                <span className="text-[11px] text-[#8C8275]">{b.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Generation Summary & CTA */}
      <div className="p-6 bg-[#FAF7F0] border border-[#E5DFD3] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D2A26]">
            <Sparkles className="w-4 h-4 text-[#C2410C]" />
            <span>Ready to compute week-by-week calendar schedule</span>
          </div>
          <p className="text-xs text-[#6B6357]">
            {course.deliverables.length} graded items · {weeklyHours}h/week · {preferredDays.join(', ')} · {bufferDays}-day runway
          </p>
        </div>

        <button
          onClick={handleGeneratePlan}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-md shadow-sm transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer"
        >
          <span>Generate Study Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
