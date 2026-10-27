import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  BookPlus,
  AlertCircle,
  CheckCircle2,
  User,
  Hash,
  BookOpen,
  PenTool,
  FileText,
  Building2,
  GraduationCap
} from 'lucide-react';
import { sanitizeInput, isValidEnrollmentNumber } from '../lib/sanitize';
import { submitBookRequest } from '../lib/firebase';

interface RequestBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBookTitle?: string;
  initialAuthor?: string;
}

const ADTU_DEPARTMENTS = [
  'Faculty of Engineering & Technology (CSE/Civil/Mechanical)',
  'Faculty of Pharmaceutical Science (Pharmacy)',
  'Faculty of Nursing',
  'Faculty of Paramedical & Allied Health Sciences',
  'Faculty of Management & Commerce',
  'Faculty of Science (Biotechnology/Microbiology)',
  'Faculty of Humanities & Social Sciences',
  'Other / Department not listed',
];

export const RequestBookModal: React.FC<RequestBookModalProps> = ({
  isOpen,
  onClose,
  initialBookTitle = '',
  initialAuthor = '',
}) => {
  const [studentName, setStudentName] = useState('');
  const [department, setDepartment] = useState(ADTU_DEPARTMENTS[0]);
  const [customDepartment, setCustomDepartment] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [bookTitle, setBookTitle] = useState(initialBookTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBookTitle(initialBookTitle);
      setAuthor(initialAuthor);
      setError(null);
      setIsSuccess(false);
    }
  }, [isOpen, initialBookTitle, initialAuthor]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Sanitize inputs
    const cleanName = sanitizeInput(studentName, 100);
    const selectedDept = department === 'Other / Department not listed' ? customDepartment : department;
    const cleanDept = sanitizeInput(selectedDept, 100);
    const cleanEnrollment = sanitizeInput(enrollmentNumber, 50);
    const cleanTitle = sanitizeInput(bookTitle, 200);
    const cleanAuthor = sanitizeInput(author, 200);
    const cleanReason = sanitizeInput(reason, 500);

    // Strict validation
    if (!cleanName) {
      setError('Student Name is required.');
      return;
    }
    if (!cleanDept) {
      setError('Please select or specify your department.');
      return;
    }
    if (!cleanEnrollment) {
      setError('University Enrollment Number is required.');
      return;
    }
    if (!isValidEnrollmentNumber(cleanEnrollment)) {
      setError('Please enter a valid Enrollment Number (e.g., ADTU/2023/CSE042 or 2301040101).');
      return;
    }
    if (!cleanTitle) {
      setError('Book Title is required.');
      return;
    }
    if (!cleanAuthor) {
      setError('Author is required.');
      return;
    }
    if (!cleanReason) {
      setError('Please provide a reason for requesting this book.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitBookRequest({
        studentName: cleanName,
        department: cleanDept,
        enrollmentNumber: cleanEnrollment,
        bookTitle: cleanTitle,
        author: cleanAuthor,
        reason: cleanReason,
      });

      setIsSuccess(true);
      setStudentName('');
      setEnrollmentNumber('');
      setBookTitle('');
      setAuthor('');
      setReason('');
      setCustomDepartment('');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit book requisition. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <BookPlus className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Student Book Requisition</h2>
              <p className="text-xs text-blue-200">Assam down town University Library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Request Submitted!</h3>
              <p className="text-slate-600 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                Thank you. Your requisition for procurement has been recorded with your Department and Enrollment details.
              </p>
              <div className="mt-4 p-3 bg-blue-50/80 rounded-xl text-blue-800 text-xs text-left max-w-sm mx-auto border border-blue-200/60">
                <p className="font-semibold mb-1">Student Privacy &amp; Procurement Note:</p>
                <p className="text-blue-700/90 leading-relaxed">
                  Per library rules, students cannot view or edit requests. The ADTU acquisition committee reviews requisitions every cycle.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all active:scale-98"
                >
                  Return to Catalog
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Bikash Sharma"
                    required
                    maxLength={100}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Department (NEW requirement) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / Faculty <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  >
                    {ADTU_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                {department === 'Other / Department not listed' && (
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="Specify your department or program name"
                    required
                    maxLength={100}
                    className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                )}
              </div>

              {/* Enrollment Number (UPDATED requirement: not roll number) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enrollment Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="e.g. ADTU/2023/CSE042 or 2301040101"
                    required
                    maxLength={50}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Official university enrollment number assigned by Assam down town University.
                </span>
              </div>

              {/* Book Title & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. Operating System Concepts"
                      required
                      maxLength={200}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <PenTool className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Abraham Silberschatz"
                      required
                      maxLength={200}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Request <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Core textbook for 4th Semester distributed systems research and semester exam preparation."
                    required
                    rows={3}
                    maxLength={500}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                  <span>Help the procurement desk assess urgency.</span>
                  <span>{reason.length}/500</span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors active:scale-98"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm shadow-sm transition-all active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Requisition'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
