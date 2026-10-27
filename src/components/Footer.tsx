import React from 'react';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
          {/* University info */}
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>ADTU BookFinder</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Central Library System &bull; Assam down town University
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Panikhaiti, Guwahati, Assam 781026
            </p>
          </div>

          {/* Privacy & Rules note */}
          <div className="text-xs text-slate-400 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full text-slate-300 font-medium border border-slate-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>RBAC &amp; Firestore Security Enforced</span>
            </div>
            <p className="mt-2 text-slate-500">
              Public search &bull; Authenticated admin management
            </p>
          </div>

          {/* Creator Attribution - CRITICAL REQUIREMENT */}
          <div className="flex flex-col items-center md:items-end justify-center">
            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 rounded-xl text-white font-semibold text-sm shadow-sm">
              <span>Created by MIP</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Assam down town University &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
