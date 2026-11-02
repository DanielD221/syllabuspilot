/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course } from '../types';
import { rebalanceScheduleForMissedDays } from '../utils/planner';
import { RefreshCw, X, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SickDayRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onUpdateAllCourses: (courses: Course[]) => void;
}

export const SickDayRescheduleModal: React.FC<SickDayRescheduleModalProps> = ({
  isOpen,
  onClose,
  courses,
  onUpdateAllCourses,
}) => {
  const [startDate, setStartDate] = useState('2026-11-04');
  const [endDate, setEndDate] = useState('2026-11-06');
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (days: number) => {
    const today = new Date('2026-11-02');
    const start = new Date(today);
    start.setDate(today.getDate() + 2); // 2026-11-04

    const end = new Date(start);
    end.setDate(start.getDate() + (days - 1));

    const toStr = (d: Date) => d.toISOString().split('T')[0];
    setStartDate(toStr(start));
    setEndDate(toStr(end));
    setResultMessage(null);
  };

  const handleRebalance = () => {
    const result = rebalanceScheduleForMissedDays(courses, startDate, endDate);
    onUpdateAllCourses(result.updatedCourses);
    setResultMessage(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5DFD3] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FAF4E8] border border-[#E4DCB8] flex items-center justify-center text-[#C2410C]">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#2D2A26]">
                Adaptive Schedule Rebalance
              </h2>
              <p className="text-xs text-[#8C8275]">
                "I was sick for 3 days" / Fell Behind Recovery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#8C8275] hover:text-[#2D2A26] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanatory text */}
        <p className="text-xs text-[#6B6357] leading-relaxed">
          Life happens. When illness, personal emergencies, or busy travel interrupt your study routine, SyllabusPilot recalculates and shifts uncompleted prep blocks forward into upcoming open study days — without pushing past the actual exam deadlines.
        </p>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#2D2A26]">Quick Presets:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Sick 2 Days', days: 2 },
              { label: 'Sick 3 Days (Recommended)', days: 3 },
              { label: 'Sick 5 Days', days: 5 },
            ].map((p) => (
              <button
                key={p.days}
                onClick={() => handleApplyPreset(p.days)}
                className="px-2.5 py-1.5 bg-[#FAF7F0] hover:bg-[#F3EFE6] border border-[#E5DFD3] text-xs font-medium text-[#2D2A26] rounded text-center transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-medium text-[#6B6357] block mb-1">
              Missed Window Start:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setResultMessage(null);
              }}
              className="w-full p-2 bg-[#FAF7F0] border border-[#E5DFD3] rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#6B6357] block mb-1">
              Missed Window End:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setResultMessage(null);
              }}
              className="w-full p-2 bg-[#FAF7F0] border border-[#E5DFD3] rounded text-xs font-mono"
            />
          </div>
        </div>

        {/* Result Message */}
        {resultMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <span className="leading-relaxed">{resultMessage}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#6B6357] hover:text-[#2D2A26]"
          >
            {resultMessage ? 'Done' : 'Cancel'}
          </button>

          <button
            onClick={handleRebalance}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-md shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rebalance My Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
