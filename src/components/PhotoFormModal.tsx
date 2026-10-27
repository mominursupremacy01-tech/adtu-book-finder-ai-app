import React, { useState, useEffect } from 'react';
import { GalleryPhoto } from '../types';
import { X, ImagePlus, Edit3, Save, AlertCircle, Upload, Link as LinkIcon } from 'lucide-react';
import { sanitizeInput } from '../lib/sanitize';

interface PhotoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<GalleryPhoto, 'id' | 'addedAt' | 'addedBy'>) => Promise<void>;
  initialData?: GalleryPhoto | null;
}

const CATEGORIES: GalleryPhoto['category'][] = [
  'Library',
  'Campus',
  'Study Hall',
  'Digital Center',
  'Events',
];

export const PhotoFormModal: React.FC<PhotoFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryPhoto['category']>('Library');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setImageUrl(initialData.imageUrl);
      setCaption(initialData.caption || '');
    } else {
      setTitle('');
      setCategory('Library');
      setImageUrl('');
      setCaption('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size should be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = sanitizeInput(title, 150);
    const cleanUrl = imageUrl.trim();
    const cleanCaption = sanitizeInput(caption, 300);

    if (!cleanTitle) {
      setError('Photo title is required.');
      return;
    }
    if (!cleanUrl) {
      setError('Please provide an image URL or upload an image file.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: cleanTitle,
        category,
        imageUrl: cleanUrl,
        caption: cleanCaption,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save photo.');
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
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              {initialData ? <Edit3 className="w-5 h-5 text-blue-200" /> : <ImagePlus className="w-5 h-5 text-blue-200" />}
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">
                {initialData ? 'Edit Campus Photo' : 'Add Library / Campus Photo'}
              </h2>
              <p className="text-xs text-blue-200">ADTU Website Showcase</p>
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Photo Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Central Library Main Reading Hall"
              required
              maxLength={150}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GalleryPhoto['category'])}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Image source: URL or File Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Photo Image <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste Image URL (e.g. https://...)"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">or upload from device:</span>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Choose Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview Box */}
            {imageUrl && (
              <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Image Preview:</span>
                <img
                  src={imageUrl}
                  alt="Preview"
                  onError={() => setError('Image URL could not be loaded. Please verify the URL.')}
                  className="w-full h-36 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Caption / Description
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Students engaged in group study and reference research in the second floor atrium."
              rows={2}
              maxLength={300}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Photo' : 'Add Photo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
