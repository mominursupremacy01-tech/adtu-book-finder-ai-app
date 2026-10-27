import React, { useState, useEffect } from 'react';
import { Book, BookStatus } from '../types';
import { X, BookPlus, Edit3, Save, AlertCircle } from 'lucide-react';
import { sanitizeInput } from '../lib/sanitize';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Book, 'id'>) => Promise<void>;
  initialData?: Book | null;
}

const COMMON_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Mechanical & Civil Engineering',
  'Pharmacy & Pharmaceutical Sciences',
  'Nursing',
  'Paramedical & Allied Health',
  'Management & Commerce',
  'Biotechnology',
  'Humanities & Social Sciences',
  'Applied Sciences',
  'General Reference',
];

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [customDept, setCustomDept] = useState('');
  const [shelfNo, setShelfNo] = useState('');
  const [copiesAvailable, setCopiesAvailable] = useState<number>(1);
  const [status, setStatus] = useState<BookStatus>('Available');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAuthor(initialData.author);
      setSubject(initialData.subject);
      if (COMMON_DEPARTMENTS.includes(initialData.department)) {
        setDepartment(initialData.department);
        setCustomDept('');
      } else {
        setDepartment('Other');
        setCustomDept(initialData.department);
      }
      setShelfNo(initialData.shelfNo);
      setCopiesAvailable(initialData.copiesAvailable);
      setStatus(initialData.status);
    } else {
      setTitle('');
      setAuthor('');
      setSubject('');
      setDepartment('Computer Science & Engineering');
      setCustomDept('');
      setShelfNo('');
      setCopiesAvailable(1);
      setStatus('Available');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = sanitizeInput(title, 200);
    const cleanAuthor = sanitizeInput(author, 200);
    const cleanSubject = sanitizeInput(subject, 100);
    const selectedDept = department === 'Other' ? customDept : department;
    const cleanDept = sanitizeInput(selectedDept, 100);
    const cleanShelf = sanitizeInput(shelfNo, 50);

    if (!cleanTitle) {
      setError('Title is required.');
      return;
    }
    if (!cleanAuthor) {
      setError('Author is required.');
      return;
    }
    if (!cleanSubject) {
      setError('Subject is required.');
      return;
    }
    if (!cleanDept) {
      setError('Department is required.');
      return;
    }
    if (!cleanShelf) {
      setError('Shelf Number is required.');
      return;
    }
    if (copiesAvailable < 0) {
      setError('Copies available cannot be negative.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: cleanTitle,
        author: cleanAuthor,
        subject: cleanSubject,
        department: cleanDept,
        shelfNo: cleanShelf,
        copiesAvailable: Number(copiesAvailable),
        status: Number(copiesAvailable) === 0 ? 'Issued' : status,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save book catalog entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              {initialData ? <Edit3 className="w-5 h-5 text-blue-200" /> : <BookPlus className="w-5 h-5 text-blue-200" />}
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">
                {initialData ? 'Edit Book Details' : 'Add New Book'}
              </h2>
              <p className="text-xs text-blue-200">Central Library Repertoire</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Algorithms"
              required
              maxLength={200}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Cormen, Leiserson, Rivest"
                required
                maxLength={200}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures &amp; Algorithms"
                required
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Department selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              {COMMON_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
              <option value="Other">Other / Custom Department</option>
            </select>

            {department === 'Other' && (
              <input
                type="text"
                value={customDept}
                onChange={(e) => setCustomDept(e.target.value)}
                placeholder="Enter department name"
                required
                maxLength={100}
                className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Shelf Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Shelf No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shelfNo}
                onChange={(e) => setShelfNo(e.target.value)}
                placeholder="e.g. CS-04-B"
                required
                maxLength={50}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Copies Available */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Copies Available <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="999"
                value={copiesAvailable}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setCopiesAvailable(val);
                  if (val === 0) setStatus('Issued');
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
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
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Book' : 'Add Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
