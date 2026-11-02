/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, StudyBlock, Deliverable } from '../types';
import {
  make_ics,
  buildCalendarEventsFromCourse,
  downloadIcsFile,
  createGoogleCalendarUrl,
} from '../utils/calendar';
import {
  Calendar,
  Download,
  ExternalLink,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Filter,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface StudyTimelineViewProps {
  courses: Course[];
  activeCourseId: string;
  onUpdateCourse: (updated: Course) => void;
  onOpenRescheduleModal: () => void;
  onNavigateToPlanning: () => void;
}

export const StudyTimelineView: React.FC<StudyTimelineViewProps> = ({
  courses,
  activeCourseId,
  onUpdateCourse,
  onOpenRescheduleModal,
  onNavigateToPlanning,
}) => {
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  // Filter courses
  const filteredCourses =
    filterCourseId === 'all'
      ? courses
      : courses.filter((c) => c.id === filterCourseId);

  // Collect all study blocks
  const allBlocks: StudyBlock[] = [];
  const allDeliverables: Deliverable[] = [];

  filteredCourses.forEach((c) => {
    allBlocks.push(...c.studyBlocks);
    allDeliverables.push(...c.deliverables);
  });

  allBlocks.sort((a, b) => a.date.localeCompare(b.date));

  // Toggle study block completion
  const handleToggleBlockCompletion = (block: StudyBlock) => {
    const parentCourse = courses.find((c) => c.id === block.courseId);
    if (!parentCourse) return;

    const updatedBlocks = parentCourse.studyBlocks.map((b) =>
      b.id === block.id ? { ...b, isCompleted: !b.isCompleted } : b
    );

    onUpdateCourse({
      ...parentCourse,
      studyBlocks: updatedBlocks,
    });
  };

  // Export .ICS file
  const handleExportIcs = () => {
    const events = buildCalendarEventsFromCourse(allBlocks, allDeliverables);
    const icsContent = make_ics(events);
    const filename =
      filterCourseId === 'all'
        ? 'SyllabusPilot_Full_Semester_Plan.ics'
        : `${courses.find((c) => c.id === filterCourseId)?.code || 'Course'}_Plan.ics`;
    downloadIcsFile(filename, icsContent);
  };

  // Group study blocks by week
  interface WeekGroup {
    weekTitle: string;
    startDate: string;
    endDate: string;
    blocks: StudyBlock[];
    deliverables: Deliverable[];
    totalHours: number;
  }

  const groupBlocksByWeek = (): WeekGroup[] => {
    if (allBlocks.length === 0) return [];

    const weeksMap = new Map<string, WeekGroup>();

    allBlocks.forEach((block) => {
      const [y, m, d] = block.date.split('-').map(Number);
      const date = new Date(y, m - 1, d, 12, 0, 0);

      // Align to Monday
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date);
      monday.setDate(diff);

      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      const monStr = monday.toISOString().split('T')[0];
      const sunStr = sunday.toISOString().split('T')[0];

      const key = monStr;
      if (!weeksMap.has(key)) {
        const monFormat = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const sunFormat = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        weeksMap.set(key, {
          weekTitle: `${monFormat} – ${sunFormat}`,
          startDate: monStr,
          endDate: sunStr,
          blocks: [],
          deliverables: [],
          totalHours: 0,
        });
      }

      const group = weeksMap.get(key)!;
      group.blocks.push(block);
      group.totalHours += block.durationHours || 2;
    });

    // Also place deliverables in their respective weeks
    allDeliverables.forEach((deliv) => {
      for (const group of weeksMap.values()) {
        if (deliv.dueDate >= group.startDate && deliv.dueDate <= group.endDate) {
          if (!group.deliverables.some((d) => d.id === deliv.id)) {
            group.deliverables.push(deliv);
          }
        }
      }
    });

    return Array.from(weeksMap.values()).sort((a, b) => a.startDate.localeCompare(b.startDate));
  };

  const weekGroups = groupBlocksByWeek();
  const totalPlannedHours = allBlocks.reduce((acc, b) => acc + (b.durationHours || 2), 0);
  const totalCompletedHours = allBlocks
    .filter((b) => b.isCompleted)
    .reduce((acc, b) => acc + (b.durationHours || 2), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D5] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-serif italic text-[#8C8275] mb-1">
            <span>Module 04</span>
            <span aria-hidden="true">·</span>
            <span>Week-by-Week Calendar Roadmap</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">
            Study Timeline & Calendar Sync
          </h1>
          <p className="mt-1 text-sm text-[#6B6357]">
            {allBlocks.length} planned study blocks · {totalPlannedHours.toFixed(1)} total study hours · {totalCompletedHours.toFixed(1)} completed
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={onOpenRescheduleModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#C2410C] bg-[#FAF4E8] hover:bg-[#F5EDDC] border border-[#E4DCB8] rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>"I was sick" / Reschedule</span>
          </button>

          <button
            onClick={handleExportIcs}
            disabled={allBlocks.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2D2A26] hover:bg-[#1A1816] disabled:bg-[#A89F91] rounded-md shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export plan.ics</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-white border border-[#E5DFD3] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8C8275]" />
          <span className="text-[#6B6357]">Filter Scope:</span>
          <select
            value={filterCourseId}
            onChange={(e) => setFilterCourseId(e.target.value)}
            className="px-2.5 py-1 bg-[#FAF7F0] border border-[#E5DFD3] rounded text-xs font-medium text-[#2D2A26]"
          >
            <option value="all">All Enrolled Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#8C8275]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="accent-[#C2410C]"
            />
            <span>Show completed sessions</span>
          </label>
        </div>
      </div>

      {/* Zero State */}
      {weekGroups.length === 0 && (
        <div className="p-12 text-center bg-white border border-[#E5DFD3] rounded-lg space-y-3">
          <Calendar className="w-10 h-10 text-[#A89F91] mx-auto" />
          <h2 className="text-base font-serif font-bold text-[#2D2A26]">
            No study blocks generated yet
          </h2>
          <p className="text-xs text-[#8C8275] max-w-sm mx-auto">
            Answer the 3 planning questions to automatically generate study sessions for your deliverables.
          </p>
          <button
            onClick={onNavigateToPlanning}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2410C] text-white text-xs font-semibold rounded-md hover:bg-[#9A3412] transition-colors"
          >
            <span>Configure 3-Question Plan</span>
          </button>
        </div>
      )}

      {/* Week by Week Groups */}
      <div className="space-y-6">
        {weekGroups.map((week, wIdx) => {
          const visibleBlocks = showCompleted
            ? week.blocks
            : week.blocks.filter((b) => !b.isCompleted);

          if (visibleBlocks.length === 0 && week.deliverables.length === 0) return null;

          return (
            <div
              key={week.startDate}
              className="bg-white border border-[#E5DFD3] rounded-lg overflow-hidden shadow-xs"
            >
              {/* Week Header */}
              <div className="bg-[#FAF7F0] border-b border-[#E8E2D5] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-serif font-bold text-sm text-[#2D2A26]">
                    Week {wIdx + 1}
                  </span>
                  <span className="text-xs text-[#8C8275]">({week.weekTitle})</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#6B6357] font-mono tabular-nums">
                  <span>{week.totalHours.toFixed(1)} planned hrs</span>
                  {week.deliverables.length > 0 && (
                    <span className="text-[#C2410C] font-semibold">
                      · {week.deliverables.length} {week.deliverables.length === 1 ? 'due' : 'due items'}
                    </span>
                  )}
                </div>
              </div>

              {/* Deliverables Banner (if any due this week) */}
              {week.deliverables.length > 0 && (
                <div className="bg-[#FBF6ED] border-b border-[#EADFCB] px-5 py-2.5">
                  <div className="text-[11px] font-serif italic text-[#8C8275] mb-1">
                    Major Milestones & Deadlines This Week:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {week.deliverables.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-[#E2D6C0] text-xs shadow-xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#C2410C]" />
                        <span className="font-semibold text-[#2D2A26]">{d.title}</span>
                        <span className="text-[#8C8275] font-mono tabular-nums">
                          ({d.dueDate} · {d.weightPercent}%)
                        </span>
                        <a
                          href={createGoogleCalendarUrl({
                            title: `[DEADLINE] ${d.title}`,
                            description: `Course Deliverable Deadline: ${d.title} (${d.weightPercent}%). Description: ${d.description || ''}`,
                            dateStr: d.dueDate,
                            timeStr: d.dueTime || '23:59',
                            durationHours: 1,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C2410C] hover:text-[#9A3412] ml-1 p-0.5"
                          title="Add Deadline to Google Calendar"
                          aria-label="Add Deadline to Google Calendar"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Blocks List */}
              <div className="divide-y divide-[#EFEAE0]">
                {visibleBlocks.map((block) => {
                  const googleCalUrl = createGoogleCalendarUrl({
                    title: `[Study] ${block.courseCode}: ${block.title}`,
                    description: `Study Session Objective: ${block.objective}\nDeliverable Target: ${block.deliverableTitle || 'General Prep'}`,
                    dateStr: block.date,
                    timeStr: block.startTime,
                    durationHours: block.durationHours,
                  });

                  return (
                    <div
                      key={block.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FCFBF8] transition-colors ${
                        block.isCompleted ? 'bg-[#FAF7F0]/40 opacity-70' : ''
                      }`}
                    >
                      {/* Checkbox and Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleBlockCompletion(block)}
                          className="mt-0.5 text-[#8C8275] hover:text-[#C2410C] transition-colors shrink-0"
                          title={block.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                          aria-label={block.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {block.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#C8C0B0]" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="w-2 h-2 rounded-sm shrink-0"
                              style={{ backgroundColor: block.courseColor }}
                            />
                            <span className="text-xs font-semibold text-[#8C8275]">
                              {block.courseCode}
                            </span>
                            <span aria-hidden="true" className="text-[#C8C0B0]">·</span>
                            <span
                              className={`text-xs font-semibold text-[#2D2A26] ${
                                block.isCompleted ? 'line-through text-[#8C8275]' : ''
                              }`}
                            >
                              {block.title}
                            </span>
                            {block.wasRescheduled && (
                              <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                                Rescheduled
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#6B6357] mt-1 line-clamp-2">
                            {block.objective}
                          </p>

                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#8C8275] font-mono tabular-nums">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#A89F91]" />
                              {block.date} ({block.startTime})
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#A89F91]" />
                              {block.durationHours} hrs
                            </span>
                            {block.deliverableTitle && (
                              <>
                                <span>·</span>
                                <span className="truncate max-w-[200px]">
                                  Target: {block.deliverableTitle}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Google Calendar Button */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAF7F0] hover:bg-[#F0EBE0] text-[#2D2A26] border border-[#DCD5C6] rounded text-[11px] font-medium transition-colors whitespace-nowrap shadow-xs"
                          title="Open 1-Click Event in Google Calendar"
                        >
                          <ExternalLink className="w-3 h-3 text-[#C2410C]" />
                          <span>Google Cal</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
