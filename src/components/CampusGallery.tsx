import React, { useState } from 'react';
import { GalleryPhoto } from '../types';
import {
  Image as ImageIcon,
  Building2,
  BookOpen,
  Sparkles,
  Maximize2,
  X,
  Plus,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CampusGalleryProps {
  photos: GalleryPhoto[];
  isAdmin: boolean;
  onAddPhotoClick: () => void;
  onManagePhotosClick?: () => void;
}

export const CampusGallery: React.FC<CampusGalleryProps> = ({
  photos,
  isAdmin,
  onAddPhotoClick,
  onManagePhotosClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);

  const categories = ['All', 'Library', 'Campus', 'Study Hall', 'Digital Center', 'Events'];

  const filteredPhotos = photos.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <section className="space-y-4 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Assam down town University Experience</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Campus &amp; Central Library Showcase
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Explore the learning spaces, modern reading halls, and scenic Panikhaiti campus.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddPhotoClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photo</span>
            </button>
            {onManagePhotosClick && (
              <button
                type="button"
                onClick={onManagePhotosClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
              >
                <span>Manage Gallery</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Pills */}
      {photos.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Gallery Showcase Content */}
      {photos.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-900/5 via-slate-50 to-indigo-900/5 rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Library &amp; Campus Photo Showcase
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            University administrators can upload high-resolution photos of the library reading rooms, digital reference pods, and ADTU campus vistas to make the website vibrant.
          </p>

          {isAdmin ? (
            <div className="mt-5">
              <button
                type="button"
                onClick={onAddPhotoClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Photo</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Librarian gallery uploads will appear here automatically</span>
            </div>
          )}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs sm:text-sm">
          No photos found under category "{selectedCategory}".
        </div>
      ) : (
        /* Photo Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setLightboxPhoto(photo)}
              className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Photo Image with overlay */}
              <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/90 backdrop-blur-xs text-slate-900 shadow-xs">
                    {photo.category}
                  </span>
                </div>

                {/* Enlarge Hint Icon */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Bottom title on image */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="font-bold text-sm sm:text-base leading-snug drop-shadow-xs">
                    {photo.title}
                  </h4>
                </div>
              </div>

              {/* Caption */}
              {photo.caption && (
                <div className="p-3 bg-slate-50/80 border-t border-slate-100">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white my-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white backdrop-blur-xs transition-colors cursor-pointer"
              aria-label="Close photo view"
            >
              <X className="w-5 h-5" />
            </button>

            {/* High res image */}
            <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain mx-auto"
              />
            </div>

            {/* Meta details */}
            <div className="p-6 bg-slate-900 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white">
                  {lightboxPhoto.category}
                </span>
                <span className="text-xs text-slate-400">Assam down town University</span>
              </div>
              <h3 className="text-xl font-black text-white">{lightboxPhoto.title}</h3>
              {lightboxPhoto.caption && (
                <p className="text-sm text-slate-300 leading-relaxed pt-1">
                  {lightboxPhoto.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
