import React, { useState } from 'react';
import { X, Database, Save, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  removeSavedFirebaseConfig,
  initFirebase
} from '../lib/firebase';
import { FirebaseConfigState } from '../types';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const current = getSavedFirebaseConfig();
  const [apiKey, setApiKey] = useState(current?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(current?.authDomain || '');
  const [projectId, setProjectId] = useState(current?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(current?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(current?.messagingSenderId || '');
  const [appId, setAppId] = useState(current?.appId || '');
  const [jsonInput, setJsonInput] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleJsonPaste = (text: string) => {
    setJsonInput(text);
    try {
      // Clean up common format like "const firebaseConfig = { ... };"
      let clean = text.trim();
      if (clean.includes('{') && clean.includes('}')) {
        clean = clean.substring(clean.indexOf('{'), clean.lastIndexOf('}') + 1);
      }
      // If keys don't have double quotes, try relaxing or parsing standard JSON
      // Handle standard JSON or relaxed object literal
      let parsed: any;
      try {
        parsed = JSON.parse(clean);
      } catch {
        // try converting unquoted keys to quotes
        const jsonStandard = clean
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"');
        parsed = JSON.parse(jsonStandard);
      }

      if (parsed) {
        if (parsed.apiKey) setApiKey(parsed.apiKey);
        if (parsed.authDomain) setAuthDomain(parsed.authDomain);
        if (parsed.projectId) setProjectId(parsed.projectId);
        if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
        if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
        if (parsed.appId) setAppId(parsed.appId);
        setMsg({ type: 'success', text: 'Firebase config fields parsed successfully!' });
      }
    } catch {
      // not valid JSON yet
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setMsg({ type: 'error', text: 'API Key and Project ID are required.' });
      return;
    }

    const config: FirebaseConfigState = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
    };

    saveFirebaseConfig(config);
    initFirebase();
    onConfigUpdated();
    setMsg({ type: 'success', text: 'Firebase configuration saved and activated!' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    removeSavedFirebaseConfig();
    setApiKey('');
    setAuthDomain('');
    setProjectId('');
    setStorageBucket('');
    setMessagingSenderId('');
    setAppId('');
    setJsonInput('');
    initFirebase();
    onConfigUpdated();
    setMsg({ type: 'success', text: 'Cleared Firebase configuration. Switched to clean local storage.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Database className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Firebase Project Connection</h2>
              <p className="text-xs text-blue-200">Connect to your Firebase Console project</p>
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

        <div className="p-6 space-y-4">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs sm:text-sm flex items-start gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            Paste your Firebase Web App configuration object from{' '}
            <strong className="text-slate-800">Firebase Console &gt; Project Settings &gt; General &gt; Your Apps</strong>.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quick Paste (`firebaseConfig` snippet)
            </label>
            <textarea
              rows={3}
              value={jsonInput}
              onChange={(e) => handleJsonPaste(e.target.value)}
              placeholder='Paste { apiKey: "...", authDomain: "...", projectId: "..." } here to auto-fill...'
              className="w-full font-mono text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="adtu-bookfinder"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="adtu-bookfinder.firebaseapp.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear / Reset Local</span>
              </button>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save &amp; Connect</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
