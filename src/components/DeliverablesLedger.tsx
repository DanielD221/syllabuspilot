/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, Deliverable, DeliverableType } from '../types';
import {
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Percent,
  Sliders,
  FileText,
} from 'lucide-react';

interface DeliverablesLedgerProps {
  course: Course;
  onUpdateDeliverables: (deliverables: Deliverable[]) => void;
  onProceedToPlanning: () => void;
}

const DELIVERABLE_TYPE_LABELS: Record<DeliverableType, string> = {
  exam: 'Exam',
  midterm: 'Midterm',
  final: 'Final Exam',
  quiz: 'Quiz',
  essay: 'Essay / Paper',
  project: 'Project',
  homework: 'Problem Set',
  lab: 'Lab Report',
  presentation: 'Presentation',
  other: 'Assignment',
};

export const DeliverablesLedger: React.FC<DeliverablesLedgerProps> = ({
  course,
  onUpdateDeliverables,
  onProceedToPlanning,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<Deliverable>>({
    title: '',
    type: 'homework',
    dueDate: '2026-11-20',
    weightPercent: 15,
    description: '',
  });
  const [showAddRow, setShowAddRow] = useState(false);

  const deliverables = course.deliverables;
  const totalWeight = deliverables.reduce((sum, d) => sum + (Number(d.weightPercent) || 0), 0);
  const completedCount = deliverables.filter((d) => d.isCompleted).length;

  const handleToggleComplete = (id: string) => {
    const updated = deliverables.map((d) =>
      d.id === id ? { ...d, isCompleted: !d.isCompleted } : d
    );
    onUpdateDeliverables(updated);
  };

  const handleDelete = (id: string) => {
    const updated = deliverables.filter((d) => d.id !== id);
    onUpdateDeliverables(updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<Deliverable>) => {
    const updated = deliverables.map((d) => (d.id === id ? { ...d, ...updates } : d));
    onUpdateDeliverables(updated);
  };

  const handleAddNewDeliverable = () => {
    if (!newItem.title?.trim()) return;

    const created: Deliverable = {
      id: `deliv-${Date.now().toString(36)}`,
      title: newItem.title.trim(),
      type: (newItem.type as DeliverableType) || 'homework',
      dueDate: newItem.dueDate || '2026-11-25',
      weightPercent: Number(newItem.weightPercent) || 10,
      description: newItem.description || '',
      isCompleted: false,
    };

    onUpdateDeliverables([...deliverables, created]);
    setNewItem({
      title: '',
      type: 'homework',
      dueDate: '2026-11-20',
      weightPercent: 15,
      description: '',
    });
    setShowAddRow(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E2D5] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-serif italic text-[#8C8275] mb-1">
            <span>Module 02</span>
            <span aria-hidden="true">·</span>
            <span>Course Deliverables Matrix</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">
            {course.code}: Graded Items & Weight Breakdown
          </h1>
          <p className="mt-1 text-sm text-[#6B6357]">
            {course.name} · Instructor: {course.instructor || 'Staff'} · {deliverables.length} graded items identified
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAddRow(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2D2A26] bg-white border border-[#DCD5C6] hover:bg-[#FAF7F0] rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>

          <button
            onClick={onProceedToPlanning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-md shadow-sm transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Plan Study Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grade Weight Audit Strip */}
      <div className="p-4 bg-white border border-[#E5DFD3] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#2D2A26] font-medium">
            <Percent className="w-4 h-4 text-[#8C8275]" />
            <span>Total Weight Accounting:</span>
          </div>
          <span
            className={`font-mono text-sm font-bold tabular-nums ${
              totalWeight === 100
                ? 'text-emerald-700'
                : totalWeight < 100
                ? 'text-amber-700'
                : 'text-red-700'
            }`}
          >
            {totalWeight}% of Course Grade
          </span>
          {totalWeight !== 100 && (
            <div className="flex items-center gap-1 text-xs text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>
                {totalWeight < 100
                  ? `Missing ${(100 - totalWeight)}% (Syllabus may omit attendance or small quizzes)`
                  : `Over by ${(totalWeight - 100)}%`}
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-[#8C8275] font-mono tabular-nums">
          Completed: {completedCount} of {deliverables.length} deliverables
        </div>
      </div>

      {/* Deliverables Table */}
      <div className="bg-white border border-[#E5DFD3] rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#6B6357] font-serif">
                <th className="py-3 px-4 w-10 text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-[#2D2A26]">Deliverable & Topics</th>
                <th className="py-3 px-4 font-semibold text-[#2D2A26] w-32">Category</th>
                <th className="py-3 px-4 font-semibold text-[#2D2A26] w-36">Due Date</th>
                <th className="py-3 px-4 font-semibold text-[#2D2A26] w-24 text-right">Weight</th>
                <th className="py-3 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEAE0]">
              {deliverables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C8275]">
                    No deliverables found yet. Upload a syllabus or add items manually.
                  </td>
                </tr>
              ) : (
                deliverables.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#FCFBF8] transition-colors ${
                        item.isCompleted ? 'bg-[#F9F7F2]/50 text-[#8C8275]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleComplete(item.id)}
                          className="text-[#8C8275] hover:text-[#C2410C] transition-colors"
                          title={item.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                          aria-label={item.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {item.isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#C8C0B0]" />
                          )}
                        </button>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-[#C2410C] rounded text-xs text-[#2D2A26]"
                            />
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) =>
                                handleUpdateItem(item.id, { description: e.target.value })
                              }
                              placeholder="Notes / description"
                              className="w-full px-2 py-1 bg-white border border-[#E5DFD3] rounded text-[11px] text-[#6B6357]"
                            />
                          </div>
                        ) : (
                          <div>
                            <span
                              className={`font-semibold text-xs text-[#2D2A26] ${
                                item.isCompleted ? 'line-through text-[#8C8275]' : ''
                              }`}
                            >
                              {item.title}
                            </span>
                            {item.description && (
                              <p className="text-[11px] text-[#8C8275] mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                            {item.topics && item.topics.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#A89F91]">
                                <span>Topics:</span>
                                <span>{item.topics.join(' · ')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <select
                            value={item.type}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                type: e.target.value as DeliverableType,
                              })
                            }
                            className="w-full px-2 py-1 bg-white border border-[#E5DFD3] rounded text-xs"
                          >
                            {Object.entries(DELIVERABLE_TYPE_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-[#6B6357] font-medium">
                            {DELIVERABLE_TYPE_LABELS[item.type] || item.type}
                          </span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 font-mono tabular-nums">
                        {isEditing ? (
                          <input
                            type="date"
                            value={item.dueDate}
                            onChange={(e) => handleUpdateItem(item.id, { dueDate: e.target.value })}
                            className="px-2 py-1 bg-white border border-[#E5DFD3] rounded text-xs"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-[#2D2A26]">
                            <Calendar className="w-3.5 h-3.5 text-[#8C8275]" />
                            <span>{item.dueDate}</span>
                          </div>
                        )}
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.weightPercent}
                              onChange={(e) =>
                                handleUpdateItem(item.id, {
                                  weightPercent: Number(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1 bg-white border border-[#E5DFD3] rounded text-xs text-right"
                            />
                            <span>%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#2D2A26]">{item.weightPercent}%</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingId(isEditing ? null : item.id)}
                            className="text-[11px] text-[#6B6357] hover:text-[#C2410C] underline underline-offset-2"
                          >
                            {isEditing ? 'Save' : 'Edit'}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-[#8C8275] hover:text-red-700 transition-colors"
                            title="Delete item"
                            aria-label="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Inline Add Row */}
              {showAddRow && (
                <tr className="bg-[#FAF7F0] border-t-2 border-[#C2410C]/30">
                  <td className="py-3 px-4 text-center text-[#8C8275]">+</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      placeholder="e.g. Midterm 2 / Lab Report 3"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white border border-[#E5DFD3] rounded text-xs"
                      autoFocus
                    />
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={newItem.type}
                      onChange={(e) =>
                        setNewItem({ ...newItem, type: e.target.value as DeliverableType })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-[#E5DFD3] rounded text-xs"
                    >
                      {Object.entries(DELIVERABLE_TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="date"
                      value={newItem.dueDate}
                      onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                      className="px-2 py-1.5 bg-white border border-[#E5DFD3] rounded text-xs font-mono"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newItem.weightPercent}
                      onChange={(e) =>
                        setNewItem({ ...newItem, weightPercent: Number(e.target.value) })
                      }
                      className="w-16 px-2 py-1.5 bg-white border border-[#E5DFD3] rounded text-xs font-mono text-right"
                    />
                    <span className="ml-1">%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={handleAddNewDeliverable}
                        className="px-2 py-1 bg-[#2D2A26] text-white text-[11px] font-medium rounded hover:bg-[#1A1816]"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddRow(false)}
                        className="px-1.5 py-1 text-[#8C8275] text-[11px] hover:text-[#2D2A26]"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
