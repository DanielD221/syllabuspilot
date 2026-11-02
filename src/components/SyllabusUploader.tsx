/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Course } from '../types';
import { SAMPLE_SYLLABI, SampleSyllabus } from '../data/sampleSyllabi';
import {
  UploadCloud,
  FileText,
  Sparkles,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Info,
  Clock,
  Layers,
} from 'lucide-react';

interface SyllabusUploaderProps {
  currentCourse: Course;
  onUpdateCourse: (updated: Course) => void;
  onNavigateToDeliverables: () => void;
}

export const SyllabusUploader: React.FC<SyllabusUploaderProps> = ({
  currentCourse,
  onUpdateCourse,
  onNavigateToDeliverables,
}) => {
  const [syllabusText, setSyllabusText] = useState(currentCourse.syllabusRawText || '');
  const [fileName, setFileName] = useState(currentCourse.syllabusFileName || '');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage(null);

    // If text file
    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSyllabusText(text);
      };
      reader.readAsText(file);
    } else {
      // PDF or Image
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Strip data:mime;base64,
        const base64Content = result.split(',')[1];
        setFileBase64(base64Content);
        setFileMimeType(file.type || 'application/pdf');
        setSyllabusText(`[Attached file: ${file.name} (${Math.round(file.size / 1024)} KB)]`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSample = (sample: SampleSyllabus) => {
    setSyllabusText(sample.rawText);
    setFileName(`${sample.code}_official_syllabus.pdf`);
    setFileBase64(null);
    setFileMimeType(null);
    setErrorMessage(null);

    // Update basic course metadata
    onUpdateCourse({
      ...currentCourse,
      name: sample.name,
      code: sample.code,
      instructor: sample.instructor,
      term: sample.term,
      color: sample.color,
      syllabusRawText: sample.rawText,
      syllabusFileName: `${sample.code}_official_syllabus.pdf`,
    });
  };

  const handleParseSyllabus = async () => {
    if (!syllabusText.trim() && !fileBase64) {
      setErrorMessage('Please paste your syllabus text or upload a PDF / slide photo.');
      return;
    }

    setIsParsing(true);
    setErrorMessage(null);
    setParseStatus('Inspecting syllabus structure and grading criteria...');

    try {
      const payload: any = {
        text: syllabusText,
        referenceDate: '2026-11-02',
      };

      if (fileBase64 && fileMimeType) {
        payload.fileData = {
          base64: fileBase64,
          mimeType: fileMimeType,
        };
      }

      setParseStatus('Extracting all exam dates, essay deadlines, and percentages...');
      const res = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const result = await res.json();
      if (result.success && result.data) {
        const { courseName, courseCode, instructor, deliverables } = result.data;

        const updatedCourse: Course = {
          ...currentCourse,
          name: courseName || currentCourse.name,
          code: courseCode || currentCourse.code,
          instructor: instructor || currentCourse.instructor,
          syllabusRawText: syllabusText,
          syllabusFileName: fileName || 'Uploaded_Syllabus.pdf',
          deliverables: deliverables && deliverables.length > 0 ? deliverables : currentCourse.deliverables,
        };

        onUpdateCourse(updatedCourse);
        setParseStatus(`Identified ${deliverables?.length || 0} graded deliverables! Redirecting...`);
        setTimeout(() => {
          setIsParsing(false);
          onNavigateToDeliverables();
        }, 600);
      } else {
        throw new Error(result.error || 'Failed to extract syllabus data');
      }
    } catch (err: any) {
      console.error('Extraction failed:', err);
      setIsParsing(false);
      setErrorMessage(
        err.message || 'Error communicating with parser. You can also edit deliverables manually.'
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#E8E2D5] pb-6">
        <div className="flex items-center gap-2 text-xs font-serif italic text-[#8C8275] mb-1">
          <span>Module 01</span>
          <span aria-hidden="true">·</span>
          <span>Syllabus Parsing & Deadline Ingestion</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#2D2A26] tracking-tight">
          Import Course Syllabus
        </h1>
        <p className="mt-2 text-sm text-[#6B6357] max-w-2xl leading-relaxed">
          Upload any course syllabus in whatever format you received it — multi-page PDF, photo of a lecture slide, or broken email text. SyllabusPilot extracts every exam, essay, and percentage weight directly.
        </p>
      </div>

      {/* Challenge Quick Test Syllabi Showcase */}
      <div className="bg-[#FAF4E8] border border-[#E4DCB8] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#C2410C]" />
          <h2 className="text-sm font-serif font-bold text-[#2D2A26]">
            Try Authentic Messy Syllabi (1-Click Test)
          </h2>
          <span className="text-xs text-[#8C8275]">From GDG Riga Challenge</span>
        </div>
        <p className="text-xs text-[#6B6357] mb-3">
          Click any sample below to instantly load real university syllabi and test how the agent finds buried dates:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_SYLLABI.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              className="group text-left p-3.5 bg-white border border-[#E5DFD3] hover:border-[#C2410C] rounded-md transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-semibold text-xs text-[#2D2A26] group-hover:text-[#C2410C] transition-colors">
                  {sample.code}
                </span>
                <span className="text-[10px] text-[#8C8275] font-mono uppercase">
                  {sample.term}
                </span>
              </div>
              <p className="text-xs font-serif text-[#4A4339] line-clamp-1 mb-1">
                {sample.name}
              </p>
              <p className="text-[11px] text-[#8C8275] line-clamp-2">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Dropzone & Paste Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#D6CEC0] hover:border-[#C2410C] bg-white/70 hover:bg-white rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#E8E2D5] flex items-center justify-center mb-3 text-[#78716C]">
              <UploadCloud className="w-6 h-6 text-[#C2410C]" />
            </div>
            <h3 className="text-sm font-serif font-bold text-[#2D2A26] mb-1">
              Choose or Drop Syllabus File
            </h3>
            <p className="text-xs text-[#8C8275] max-w-xs mb-3">
              Accepts PDF (up to 20 pages), photos of lecture slides (PNG, JPG), or plaintext syllabus files.
            </p>
            <span className="inline-block px-3 py-1 bg-[#FAF7F0] text-[#2D2A26] text-xs font-medium border border-[#E2DDD3] rounded">
              Browse Local Files
            </span>
          </div>

          {fileName && (
            <div className="flex items-center gap-3 p-3 bg-white border border-[#E8E2D5] rounded-md text-xs">
              <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[#2D2A26] truncate">{fileName}</p>
                <p className="text-[11px] text-[#8C8275]">Ready for AI extraction</p>
              </div>
            </div>
          )}

          <div className="bg-[#FAF7F0] border border-[#E8E2D5] rounded-md p-4 text-xs text-[#6B6357] space-y-2">
            <div className="flex items-center gap-1.5 font-medium text-[#2D2A26]">
              <Info className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>What SyllabusPilot Extracts:</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-[11px] text-[#7A7062]">
              <li>All midterm and final exam dates</li>
              <li>Essay and project milestones</li>
              <li>Grade percentage weights (e.g. 30%, 20%)</li>
              <li>Buried dates on deep pages or slide tables</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Syllabus Text Editor */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="syllabus-text" className="text-xs font-serif font-bold text-[#2D2A26]">
              Or Paste Raw Syllabus Content (Text, Email, or Notes)
            </label>
            <span className="text-[11px] text-[#8C8275] font-mono tabular-nums">
              {syllabusText.length} characters
            </span>
          </div>

          <textarea
            id="syllabus-text"
            rows={12}
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            placeholder="Paste syllabus text here (course description, schedule table, grading breakdown, midterm dates)..."
            className="w-full p-4 bg-white border border-[#E5DFD3] focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] rounded-lg text-xs font-mono text-[#3D372F] leading-relaxed resize-y placeholder:text-[#A89F91]"
          />

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#8C8275]">
              Powered by Gemini 3.8 Flash multimodal reasoning
            </span>

            <button
              onClick={handleParseSyllabus}
              disabled={isParsing || (!syllabusText.trim() && !fileBase64)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] disabled:bg-[#D5CEBF] text-white text-xs font-semibold rounded-md shadow-sm transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            >
              {isParsing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{parseStatus || 'Extracting dates...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract Graded Deliverables</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
