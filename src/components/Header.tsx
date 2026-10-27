import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  LogOut,
  Clock,
  Menu,
  X,
  PlusCircle,
  HelpCircle,
  Database,
  Camera
} from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase';

interface HeaderProps {
  currentView: 'catalog' | 'admin';
  onNavigate: (view: 'catalog' | 'admin') => void;
  onRequestBookOpen: () => void;
  onAdminLoginOpen: () => void;
  onSetupGuideOpen: () => void;
  onConfigModalOpen: () => void;
  onScanQrOpen: () => void;
  adminUser: { uid: string; email: string } | null;
  onLogout: () => void;
  inactivityRemainingSeconds: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onRequestBookOpen,
  onAdminLoginOpen,
  onSetupGuideOpen,
  onConfigModalOpen,
  onScanQrOpen,
  adminUser,
  onLogout,
  inactivityRemainingSeconds,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isCloudConnected = isFirebaseConfigured();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      {/* Top institution ribbon */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 tracking-wide font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Central Library &bull; Assam down town University</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSetupGuideOpen}
              className="flex items-center gap-1 text-blue-200 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Firebase &amp; Security Rules</span>
              <span className="sm:hidden">Rules</span>
            </button>
            <button
              onClick={onConfigModalOpen}
              className="flex items-center gap-1 text-blue-200 hover:text-white transition-colors cursor-pointer text-[11px] border-l border-blue-700/60 pl-3"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isCloudConnected ? 'Firestore Active' : 'Cloud Config'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & title */}
          <div
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-2xl text-slate-900 tracking-tight">
                  ADTU <span className="text-blue-600">BookFinder</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Assam down town University Library
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('catalog')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                currentView === 'catalog'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Catalog
            </button>

            <button
              type="button"
              onClick={onScanQrOpen}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer active:scale-98"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Scan QR</span>
            </button>

            <button
              type="button"
              onClick={onRequestBookOpen}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/60 transition-all cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Request a Book</span>
            </button>

            {adminUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {/* Inactivity indicator */}
                {inactivityRemainingSeconds !== null && (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                      inactivityRemainingSeconds <= 120
                        ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    title="Auto logout timer due to inactivity"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimer(inactivityRemainingSeconds)}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Logout Admin"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onAdminLoginOpen}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Admin Login</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onScanQrOpen}
              className="p-2 rounded-xl text-blue-700 bg-blue-50 border border-blue-200"
              title="Scan QR Code"
              aria-label="Scan QR Code"
            >
              <Camera className="w-5 h-5" />
            </button>

            {adminUser && inactivityRemainingSeconds !== null && (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  inactivityRemainingSeconds <= 120
                    ? 'bg-red-50 text-red-700 animate-pulse'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{formatTimer(inactivityRemainingSeconds)}</span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-150">
          <button
            onClick={() => {
              onNavigate('catalog');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-sm ${
              currentView === 'catalog'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Book Catalog</span>
          </button>

          <button
            onClick={() => {
              onScanQrOpen();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-sm text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200"
          >
            <Camera className="w-5 h-5 text-blue-600" />
            <span>Scan Shelf / Book QR</span>
          </button>

          <button
            onClick={() => {
              onRequestBookOpen();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-sm text-blue-700 bg-blue-50/70 hover:bg-blue-100 border border-blue-200"
          >
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>Request a Book</span>
          </button>

          {adminUser ? (
            <>
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-sm ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Admin Dashboard</span>
              </button>

              <div className="px-4 py-2 text-xs text-slate-500 bg-slate-50 rounded-xl">
                Logged in as: <span className="font-semibold text-slate-700">{adminUser.email}</span>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-sm text-red-600 bg-red-50 hover:bg-red-100"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span>Logout Administrator</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onAdminLoginOpen();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-sm bg-slate-900 text-white shadow-sm"
            >
              <Shield className="w-5 h-5 text-blue-400" />
              <span>Admin Login</span>
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                onSetupGuideOpen();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg"
            >
              Rules &amp; Guide
            </button>
            <button
              onClick={() => {
                onConfigModalOpen();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
            >
              Cloud Config
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
