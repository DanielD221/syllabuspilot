/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Course } from '../types';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface CourseSelectorProps {
  courses: Course[];
  activeCourseId: string;
  onSelectCourse: (id: string) => void;
  onAddNewCourse: () => void;
  onDeleteCourse: (id: string) => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  activeCourseId,
  onSelectCourse,
  onAddNewCourse,
  onDeleteCourse,
}) => {
  return (
    <div className="border-b border-[#E8E2D5] bg-[#F5F0E4]/60 px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto pb-1 sm:pb-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-serif italic text-[#8C8275] whitespace-nowrap mr-1">
            Enrolled Courses:
          </span>

          {courses.map((c) => {
            const isActive = c.id === activeCourseId;
            const completedCount = c.deliverables.filter((d) => d.isCompleted).length;
            const totalCount = c.deliverables.length;

            return (
              <div
                key={c.id}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white border-[#C2410C]/40 text-[#2D2A26] shadow-sm font-semibold'
                    : 'bg-white/50 border-[#E4DEC\-D0] text-[#6B6357] hover:bg-white hover:text-[#2D2A26]'
                }`}
                onClick={() => onSelectCourse(c.id)}
              >
                {/* Visual course color square */}
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: c.color }}
                  aria-hidden="true"
                />

                <span>{c.code}</span>

                <span className="text-[11px] text-[#8C8275] font-mono tabular-nums">
                  ({completedCount}/{totalCount})
                </span>

                {courses.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove course ${c.code}? This will remove its study schedule.`)) {
                        onDeleteCourse(c.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-700 transition-opacity ml-1"
                    title={`Delete ${c.code}`}
                    aria-label={`Delete ${c.code}`}
                  >
                    <Trash2 className="w-3 h-3 text-[#A89F91] hover:text-red-600" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={onAddNewCourse}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-dashed border-[#C8C0B0] text-[#7A7062] hover:text-[#2D2A26] hover:border-[#8C8275] hover:bg-white/60 text-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-3 h-3" />
            <span>Add Course</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-[#8C8275] shrink-0 font-mono tabular-nums">
          <span>Active Semester: Fall 2026</span>
        </div>
      </div>
    </div>
  );
};
