/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, BookOpen, Layers, Flame, Plus } from 'lucide-react';

export type ActiveTab = 'syllabus' | 'deliverables' | 'timeline' | 'heatmap';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenImport: () => void;
  totalCoursesCount: number;
  upcomingDeliverablesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenImport,
  totalCoursesCount,
  upcomingDeliverablesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E8E2D5] px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element in serif display) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('syllabus')}
            className="text-xl font-serif font-bold tracking-tight text-[#2D2A26] hover:text-[#C2410C] transition-colors whitespace-nowrap text-left"
          >
            SyllabusPilot
          </button>
          <span className="hidden sm:inline-block text-xs text-[#8C8275] border-l border-[#DCD5C6] pl-3 py-0.5">
            {totalCoursesCount} {totalCoursesCount === 1 ? 'Course' : 'Courses'} · {upcomingDeliverablesCount} Due
          </span>
        </div>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6B6357]" aria-label="Main Navigation">
          <button
            onClick={() => onTabChange('syllabus')}
            className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'syllabus'
                ? 'text-[#2D2A26] border-[#C2410C] font-semibold'
                : 'border-transparent hover:text-[#2D2A26] hover:border-[#D8D0C0]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8C8275]" />
            <span>Syllabus Ingestion</span>
          </button>

          <button
            onClick={() => onTabChange('deliverables')}
            className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'deliverables'
                ? 'text-[#2D2A26] border-[#C2410C] font-semibold'
                : 'border-transparent hover:text-[#2D2A26] hover:border-[#D8D0C0]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#8C8275]" />
            <span>Deliverables Matrix</span>
          </button>

          <button
            onClick={() => onTabChange('timeline')}
            className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'timeline'
                ? 'text-[#2D2A26] border-[#C2410C] font-semibold'
                : 'border-transparent hover:text-[#2D2A26] hover:border-[#D8D0C0]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#8C8275]" />
            <span>Study Timeline & Calendar</span>
          </button>

          <button
            onClick={() => onTabChange('heatmap')}
            className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'heatmap'
                ? 'text-[#2D2A26] border-[#C2410C] font-semibold'
                : 'border-transparent hover:text-[#2D2A26] hover:border-[#D8D0C0]'
            }`}
          >
            <Flame className="w-4 h-4 text-[#8C8275]" />
            <span>Workload Heatmap</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenImport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FAF7F0] bg-[#2D2A26] hover:bg-[#1A1816] active:scale-[0.98] rounded-md shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Import Syllabus</span>
          </button>
        </div>
      </div>
    </header>
  );
};
