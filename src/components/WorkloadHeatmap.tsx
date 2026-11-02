/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Course } from '../types';
import { computeWorkloadHeatmap } from '../utils/planner';
import {
  Flame,
  AlertTriangle,
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  Info,
} from 'lucide-react';

interface WorkloadHeatmapProps {
  courses: Course[];
  onOpenRescheduleModal: () => void;
}

export const WorkloadHeatmap: React.FC<WorkloadHeatmapProps> = ({
  courses,
  onOpenRescheduleModal,
}) => {
  const weeks = computeWorkloadHeatmap(courses);

  const totalDeliverables = courses.reduce((sum, c) => sum + c.deliverables.length, 0);
  const clashCount = weeks.filter((w) => w.hasClash).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D5] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-serif italic text-[#8C8275] mb-1">
            <span>Module 05</span>
            <span aria-hidden="true">·</span>
            <span>Multi-Course Workload Balancing</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">
            Semester Workload Heatmap
          </h1>
          <p className="mt-1 text-sm text-[#6B6357]">
            Simultaneous pressure analysis across {courses.length} courses · {totalDeliverables} graded milestones
          </p>
        </div>

        {clashCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{clashCount} High-Pressure Conflict Week(s) Detected</span>
          </div>
        )}
      </div>

      {/* Advisory Insight Banner */}
      <div className="p-4 bg-white border border-[#E5DFD3] rounded-lg flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#C2410C] mt-0.5 shrink-0" />
        <div className="text-xs text-[#6B6357] space-y-1">
          <p className="font-semibold text-[#2D2A26]">
            Multi-Course Study Balance Rationale:
          </p>
          <p className="leading-relaxed">
            By aggregating your study blocks across BIO 101, CS 200, and other enrolled courses, SyllabusPilot highlights where academic bottlenecks occur before you get blindsided. If two heavy exams fall in the same week, we recommend spreading review sessions 1–2 weeks earlier.
          </p>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-3">
        {weeks.map((week) => {
          // Determine color based on intensity
          let intensityBadge = 'bg-[#FAF7F0] text-[#6B6357] border-[#E8E2D5]';
          let intensityLabel = 'Moderate';
          let barColor = 'bg-[#D6CEC0]';

          if (week.hasClash || week.intensityScore >= 70) {
            intensityBadge = 'bg-red-50 text-red-800 border-red-200';
            intensityLabel = 'Critical Load';
            barColor = 'bg-red-500';
          } else if (week.intensityScore >= 40) {
            intensityBadge = 'bg-amber-50 text-amber-800 border-amber-200';
            intensityLabel = 'Elevated';
            barColor = 'bg-amber-500';
          } else if (week.totalStudyHours === 0 && week.deliverablesDue.length === 0) {
            intensityLabel = 'Rest / Buffer';
            barColor = 'bg-emerald-300';
          }

          return (
            <div
              key={week.startDate}
              className={`p-4 bg-white border rounded-lg transition-all ${
                week.hasClash ? 'border-amber-300 shadow-xs' : 'border-[#E5DFD3]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Week Label & Dates */}
                <div className="flex items-center gap-3">
                  <div className="w-16 shrink-0">
                    <span className="font-serif font-bold text-sm text-[#2D2A26]">
                      Week {week.weekNumber}
                    </span>
                  </div>

                  <div className="text-xs font-mono tabular-nums text-[#8C8275]">
                    {week.startDate} → {week.endDate}
                  </div>

                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${intensityBadge}`}>
                    {intensityLabel}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-[#6B6357]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#8C8275]" />
                    {week.totalStudyHours}h study
                  </span>

                  <span>·</span>

                  <span className="flex items-center gap-1 font-semibold text-[#2D2A26]">
                    <Calendar className="w-3.5 h-3.5 text-[#8C8275]" />
                    {week.deliverablesDue.length} due
                  </span>
                </div>
              </div>

              {/* Intensity progress bar */}
              <div className="w-full bg-[#FAF7F0] h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full ${barColor} transition-all duration-300`}
                  style={{ width: `${Math.max(5, week.intensityScore)}%` }}
                />
              </div>

              {/* Clash or Warnings */}
              {week.hasClash && (
                <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded text-xs text-amber-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="font-medium">{week.clashReason}</span>
                  </div>
                  <button
                    onClick={onOpenRescheduleModal}
                    className="text-[11px] font-semibold text-[#C2410C] hover:underline whitespace-nowrap"
                  >
                    Reschedule Sessions →
                  </button>
                </div>
              )}

              {/* Deliverables Due in this week */}
              {week.deliverablesDue.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#F2ECE1] flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[#8C8275] text-[11px] mr-1">Due:</span>
                  {week.deliverablesDue.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-[#FAF7F0] px-2.5 py-1 rounded border border-[#E5DFD3]"
                    >
                      <span
                        className="w-2 h-2 rounded-sm shrink-0"
                        style={{ backgroundColor: d.courseColor }}
                      />
                      <span className="font-semibold text-[#2D2A26]">{d.courseCode}</span>
                      <span className="text-[#6B6357]">{d.title}</span>
                      <span className="text-[#8C8275] font-mono tabular-nums">
                        ({d.dueDate.slice(5)} · {d.weightPercent}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
