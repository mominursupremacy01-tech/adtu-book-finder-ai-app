import React from 'react';
import { Book as BookType } from '../types';
import { Bookmark, MapPin, Copy, Edit2, Trash2, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';

interface BookCardProps {
  book: BookType;
  isAdmin?: boolean;
  onEdit?: (book: BookType) => void;
  onDelete?: (book: BookType) => void;
  onViewQr?: (book: BookType) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isAdmin = false,
  onEdit,
  onDelete,
  onViewQr,
}) => {
  const isAvailable = book.copiesAvailable > 0 && book.status === 'Available';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Banner with Department & Status */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 max-w-[70%] truncate">
            {book.department || 'General'}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shrink-0 ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isAvailable ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Available</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Issued</span>
              </>
            )}
          </span>
        </div>

        {/* Title & Author */}
        <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm font-medium text-slate-600 mt-1 line-clamp-1">
          by <span className="text-slate-800">{book.author}</span>
        </p>

        {/* Subject tag */}
        {book.subject && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Bookmark className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">Subject: <span className="font-medium text-slate-700">{book.subject}</span></span>
          </div>
        )}
      </div>

      {/* Meta Specs: Shelf & Copies Available */}
      <div className="bg-slate-50/70 border-t border-slate-100 p-4 pt-3 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Shelf No */}
          <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Shelf No.</span>
              <span className="font-bold text-slate-800 text-xs sm:text-sm">{book.shelfNo || 'N/A'}</span>
            </div>
          </div>

          {/* Copies Available */}
          <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <Copy className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Copies</span>
              <span className="font-bold text-slate-800 text-xs sm:text-sm">
                {book.copiesAvailable}{' '}
                <span className="text-[10px] font-normal text-slate-500">
                  {book.copiesAvailable === 1 ? 'copy' : 'copies'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Action Button for Students and Admins */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onViewQr?.(book)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors active:scale-98 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>View Shelf QR Code</span>
          </button>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mt-1 pt-2 border-t border-slate-200/60 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(book)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors active:scale-98 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(book)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-red-600 font-semibold text-xs rounded-xl shadow-2xs transition-colors active:scale-98 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
