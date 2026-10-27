import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Book } from '../types';
import { X, QrCode, Download, Printer, Copy, Check, MapPin, Building2, Bookmark, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export const BookQrModal: React.FC<BookQrModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      // Create a structured payload that can also be scanned as a link or text
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const qrPayload = JSON.stringify({
        app: 'ADTU BookFinder',
        university: 'Assam down town University',
        bookId: book.id,
        title: book.title,
        author: book.author,
        shelfNo: book.shelfNo,
        department: book.department,
        status: book.status,
        url: `${currentUrl}/?bookId=${book.id}`,
      });

      QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code:', err));
    } else {
      setQrDataUrl('');
    }
  }, [isOpen, book]);

  if (!isOpen || !book) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    const safeTitle = book.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
    link.download = `ADTU_QR_${book.shelfNo}_${safeTitle}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `ADTU Library\nTitle: ${book.title}\nAuthor: ${book.author}\nShelf: ${book.shelfNo}\nDepartment: ${book.department}\nStatus: ${book.status} (${book.copiesAvailable} copies available)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <QrCode className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">Book Shelf QR Code</h2>
              <p className="text-xs text-blue-200">ADTU Central Library Locator</p>
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
        <div className="p-6 text-center space-y-4">
          {/* QR Code Preview Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block shadow-inner mx-auto">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Book QR Code"
                className="w-52 h-52 mx-auto rounded-xl shadow-xs bg-white p-2"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          {/* Book Information Summary */}
          <div className="text-left bg-blue-50/60 p-4 rounded-2xl border border-blue-100/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 truncate">
                {book.department}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  book.status === 'Available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {book.status} ({book.copiesAvailable} left)
              </span>
            </div>

            <h3 className="font-black text-slate-900 text-base leading-snug">{book.title}</h3>
            <p className="text-xs font-medium text-slate-600">by {book.author}</p>

            <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Shelf No: {book.shelfNo}</span>
              </div>
              <span className="text-slate-500 font-medium">Subject: {book.subject}</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Save PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Print Label</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy Info</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Assam down town University</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
