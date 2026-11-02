/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, StudyBlock } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, Circle, Flame, BookOpen, Clock } from 'lucide-react';

interface DailyFocusCardProps {
  courses: Course[];
  onToggleBlock: (block: StudyBlock) => void;
}

const STUDY_TIPS = [
  "Spaced repetition beats cramming: 3 sessions of 90 minutes yield 40% higher retention than one 5-hour marathon.",
  "Active recall rule: Close the notes and write down everything you remember about the chapter from memory first.",
  "The Feynman Technique: Explain the concept simply in your own words as if teaching it to an introductory student.",
  "Buffer days are sacred: Keep the 48 hours before an exam for light formula review, not learning new material.",
];

export const DailyFocusCard: React.FC<DailyFocusCardProps> = ({
  courses,
  onToggleBlock,
}) => {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'study' | 'break'>('study');
  const [tipIndex, setTipIndex] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsRunning(false);
      if (sessionType === 'study') {
        setSessionType('break');
        setTimerSeconds(5 * 60);
      } else {
        setSessionType('study');
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds, sessionType]);

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimerSeconds(sessionType === 'study' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Find today's or next upcoming blocks
  const allBlocks: StudyBlock[] = [];
  courses.forEach((c) => allBlocks.push(...c.studyBlocks));
  allBlocks.sort((a, b) => a.date.localeCompare(b.date));

  // Find blocks for this week or today (reference date 2026-11-02 to 2026-11-07)
  const todayDateStr = '2026-11-02';
  const upcomingBlocks = allBlocks
    .filter((b) => b.date >= todayDateStr && !b.isCompleted)
    .slice(0, 3);

  return (
    <div className="bg-white border border-[#E5DFD3] rounded-lg p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F0EBE0] pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#C2410C]" />
          <h2 className="text-sm font-serif font-bold text-[#2D2A26]">
            Today's Focus & Study Timer
          </h2>
        </div>

        <div className="text-xs text-[#8C8275] font-mono tabular-nums">
          Mon, Nov 02, 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Pomodoro Study Timer */}
        <div className="md:col-span-5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-md p-4 flex flex-col items-center justify-center text-center">
          <div className="text-xs text-[#8C8275] uppercase font-mono tracking-wider mb-1">
            {sessionType === 'study' ? 'Deep Work Sprint (25m)' : 'Rest Interval (5m)'}
          </div>

          <div className="text-4xl font-mono font-bold text-[#2D2A26] tabular-nums my-1">
            {timeFormatted}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#2D2A26] hover:bg-[#1A1816] text-white text-xs font-semibold rounded transition-colors"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={handleResetTimer}
              className="p-1.5 text-[#8C8275] hover:text-[#2D2A26] transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Upcoming Priority Tasks */}
        <div className="md:col-span-7 space-y-2">
          <div className="text-xs font-semibold text-[#2D2A26]">
            Next Scheduled Prep Sessions:
          </div>

          {upcomingBlocks.length === 0 ? (
            <p className="text-xs text-[#8C8275] italic">
              All scheduled sessions up to date! Great job staying ahead.
            </p>
          ) : (
            <div className="space-y-1.5">
              {upcomingBlocks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-2 p-2 bg-[#FAF7F0]/60 rounded border border-[#E8E2D5] text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => onToggleBlock(b)}
                      className="text-[#8C8275] hover:text-[#C2410C]"
                    >
                      <Circle className="w-3.5 h-3.5 text-[#C8C0B0]" />
                    </button>
                    <span
                      className="w-2 h-2 rounded-xs shrink-0"
                      style={{ backgroundColor: b.courseColor }}
                    />
                    <span className="font-semibold text-[#2D2A26]">{b.courseCode}:</span>
                    <span className="text-[#6B6357] truncate">{b.title}</span>
                  </div>

                  <span className="text-[11px] font-mono tabular-nums text-[#8C8275] shrink-0">
                    {b.date.slice(5)} · {b.startTime}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Daily Study Tip */}
          <div className="pt-2 border-t border-[#F0EBE0] text-[11px] text-[#7A7062] italic flex items-center justify-between gap-2">
            <span>“{STUDY_TIPS[tipIndex]}”</span>
            <button
              onClick={() => setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length)}
              className="text-[#C2410C] hover:underline shrink-0 not-italic text-[10px]"
            >
              Next Tip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
