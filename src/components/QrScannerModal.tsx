import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, RefreshCw, QrCode } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'adtu-qr-reader-container';

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        const s = scannerRef.current;
        scannerRef.current = null;
        if (s.isScanning) {
          s.stop()
            .then(() => {
              try { s.clear(); } catch {}
            })
            .catch(() => {});
        } else {
          try { s.clear(); } catch {}
        }
      }
      setIsScanning(false);
      setScannerError(null);
      setManualCode('');
      return;
    }

    let isMounted = true;

    // Delay start slightly to let modal DOM render
    const timer = setTimeout(() => {
      const container = document.getElementById(containerId);
      if (!container || !isMounted) return;

      try {
        const html5Qr = new Html5Qrcode(containerId);
        scannerRef.current = html5Qr;

        html5Qr
          .start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (html5Qr.isScanning) {
                html5Qr.stop()
                  .then(() => {
                    try { html5Qr.clear(); } catch {}
                  })
                  .catch(() => {});
              }
              onScanSuccess(decodedText);
              onClose();
            },
            () => {
              // Frame scanning pass, ignore
            }
          )
          .then(() => {
            if (isMounted) {
              setIsScanning(true);
              setScannerError(null);
            }
          })
          .catch((err) => {
            console.warn('Camera error or permission denied:', err);
            if (isMounted) {
              setIsScanning(false);
              setScannerError(
                'Camera could not be activated. You can still look up books by Shelf Number or Title below.'
              );
            }
          });
      } catch (e) {
        console.warn('QR Scanner init exception:', e);
        if (isMounted) {
          setIsScanning(false);
          setScannerError('Camera scanner not supported on this device. Use manual lookup below.');
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        const s = scannerRef.current;
        scannerRef.current = null;
        if (s.isScanning) {
          s.stop()
            .then(() => {
              try { s.clear(); } catch {}
            })
            .catch(() => {});
        } else {
          try { s.clear(); } catch {}
        }
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
    onClose();
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
              <Camera className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">Scan Shelf / Book QR</h2>
              <p className="text-xs text-blue-200">ADTU Library Camera Scanner</p>
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
        <div className="p-6 space-y-4">
          {/* Camera Scanner Viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
            <div id={containerId} className="w-full h-full" />

            {!isScanning && !scannerError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                <span className="text-xs font-medium">Starting camera sensor...</span>
              </div>
            )}

            {/* Target Reticle overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-blue-400/80 rounded-2xl relative animate-pulse shadow-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center">
            Point camera at the QR code on a library shelf or physical book label.
          </p>

          {scannerError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{scannerError}</span>
            </div>
          )}

          {/* Manual Lookup option */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Or Lookup by Shelf No. / Title / Code
            </label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. CS-04-B or Algorithms..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Find
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
