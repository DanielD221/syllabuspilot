/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course } from '../types';
import { X, BookPlus } from 'lucide-react';

interface NewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (newCourse: Course) => void;
}

const PRESET_COLORS = [
  '#059669', // Emerald
  '#0284C7', // Cerulean
  '#B45309', // Amber
  '#7C3AED', // Purple
  '#BE185D', // Rose
  '#475569', // Slate
];

export const NewCourseModal: React.FC<NewCourseModalProps> = ({
  isOpen,
  onClose,
  onAddCourse,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const newCourse: Course = {
      id: `course-${Date.now().toString(36)}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      instructor: instructor.trim() || 'Instructor',
      term: term.trim() || 'Fall 2026',
      color,
      createdAt: new Date().toISOString(),
      deliverables: [],
      studyBlocks: [],
      preferences: {
        weeklyHours: 6,
        preferredDays: ['Mon', 'Wed', 'Fri'],
        studyTimeOfDay: 'evening',
        bufferDaysBeforeExam: 10,
        targetIntensity: 'balanced',
      },
    };

    onAddCourse(newCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5DFD3] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-[#C2410C]" />
            <h2 className="text-lg font-serif font-bold text-[#2D2A26]">Add New Course</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C8275] hover:text-[#2D2A26] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#2D2A26] block mb-1">
              Course Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MATH 240, PSYC 101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2 bg-[#FAF7F0] border border-[#E5DFD3] rounded text-xs text-[#2D2A26] focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2D2A26] block mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Multivariable Calculus & Linear Algebra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-[#FAF7F0] border border-[#E5DFD3] rounded text-xs text-[#2D2A26] focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#6B6357] block mb-1">
                Instructor
              </label>
              <input
                type="text"
                placeholder="Dr. Smith"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full p-2 bg-[#FAF7F0] border border-[#E5DFD3] rounded text-xs text-[#2D2A26]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B6357] block mb-1">
                Semester / Term
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full p-2 bg-[#FAF7F0] border border-[#E5DFD3] rounded text-xs text-[#2D2A26]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2D2A26] block mb-2">
              Color Identifier:
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-md transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-[#2D2A26] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#6B6357] hover:text-[#2D2A26]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2D2A26] hover:bg-[#1A1816] text-white text-xs font-semibold rounded-md shadow-sm transition-all"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
