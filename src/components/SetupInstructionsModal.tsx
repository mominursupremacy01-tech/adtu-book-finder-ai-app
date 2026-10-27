import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  Key,
  Users,
  FileCode,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface SetupInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FIRESTORE_SECURITY_RULES_CONTENT = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Default deny all unknown collections
    match /{document=**} {
      allow read, write: if false;
    }

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    // Verified administrator check
    function isAdmin() {
      return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    function isValidBook(data) {
      return data.keys().hasAll(['title', 'author', 'subject', 'department', 'shelfNo', 'copiesAvailable', 'status'])
        && data.title is string && data.title.size() >= 1 && data.title.size() <= 200
        && data.author is string && data.author.size() >= 1 && data.author.size() <= 200
        && data.subject is string && data.subject.size() >= 1 && data.subject.size() <= 100
        && data.department is string && data.department.size() >= 1 && data.department.size() <= 100
        && data.shelfNo is string && data.shelfNo.size() >= 1 && data.shelfNo.size() <= 50
        && (data.copiesAvailable is int || data.copiesAvailable is number) && data.copiesAvailable >= 0
        && (data.status == 'Available' || data.status == 'Issued');
    }

    function isValidRequest(data) {
      return data.keys().hasAll(['studentName', 'department', 'enrollmentNumber', 'bookTitle', 'author', 'reason', 'status'])
        && data.studentName is string && data.studentName.size() >= 1 && data.studentName.size() <= 100
        && data.department is string && data.department.size() >= 1 && data.department.size() <= 100
        && data.enrollmentNumber is string && data.enrollmentNumber.size() >= 1 && data.enrollmentNumber.size() <= 50
        && data.bookTitle is string && data.bookTitle.size() >= 1 && data.bookTitle.size() <= 200
        && data.author is string && data.author.size() >= 1 && data.author.size() <= 200
        && data.reason is string && data.reason.size() >= 1 && data.reason.size() <= 500
        && (data.status == 'Pending' || data.status == 'Ordered' || data.status == 'Arrived');
    }

    function isValidPhoto(data) {
      return data.keys().hasAll(['title', 'category', 'imageUrl'])
        && data.title is string && data.title.size() >= 1 && data.title.size() <= 150
        && data.category in ['Library', 'Campus', 'Study Hall', 'Digital Center', 'Events']
        && data.imageUrl is string && data.imageUrl.size() >= 5;
    }

    // 1. Books collection: Public can read; only verified admins can write
    match /books/{bookId} {
      allow read: if true;
      allow create: if isAdmin() && isValidBook(request.resource.data);
      allow update: if isAdmin() && isValidBook(request.resource.data);
      allow delete: if isAdmin();
    }

    // 2. Requests collection: Public can create requests; only admins can read, update, or delete
    match /requests/{requestId} {
      allow create: if isValidRequest(request.resource.data) && request.resource.data.status == 'Pending';
      allow read, update, delete: if isAdmin();
    }

    // 3. Gallery collection: Public can view photos; only admins can add, update, delete
    match /gallery/{photoId} {
      allow read: if true;
      allow create, update: if isAdmin() && isValidPhoto(request.resource.data);
      allow delete: if isAdmin();
    }

    // 4. Admins collection: Only admins can view or modify admin privileges
    match /admins/{adminId} {
      allow read, write: if isAdmin();
    }
  }
}`;

export const SetupInstructionsModal: React.FC<SetupInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedRules, setCopiedRules] = useState(false);

  if (!isOpen) return null;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_SECURITY_RULES_CONTENT);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-500/40 rounded-xl text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Firebase Setup &amp; Security Architecture</h2>
              <p className="text-xs text-slate-400">Production Security Rules &amp; Deployment Manual</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Quick Summary */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-xs sm:text-sm">
            <p className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>Assam down town University Library — Zero-Trust Security Protocol</span>
            </p>
            <p className="text-blue-800/90 leading-relaxed">
              This application enforces strict role-based access control (RBAC). Books can be publicly read by anyone, but mutations are restricted strictly to verified users listed in the <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-mono">admins</code> collection. Student requests are write-only for the public and read/write for administrators.
            </p>
          </div>

          {/* Step by step guide */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Step-by-Step Firebase Configuration Guide</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                  <span>Create Project &amp; Enable Cloud Firestore</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="w-3 h-3" /></a>, create a project (e.g. <code className="bg-slate-200 px-1 rounded text-slate-800">adtu-bookfinder</code>). Navigate to <strong>Build &gt; Firestore Database</strong>, click <strong>Create database</strong>, and choose your preferred region.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>Enable Email/Password Authentication</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  Navigate to <strong>Build &gt; Authentication</strong> in your Firebase Console. Click <strong>Get Started</strong>, choose the <strong>Sign-in method</strong> tab, select <strong>Email/Password</strong>, turn the switch to <strong>Enabled</strong>, and click <strong>Save</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>Create the First Administrator Account</span>
                </div>
                <div className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-8 space-y-2">
                  <p>
                    In <strong>Authentication &gt; Users</strong>, click <strong>Add user</strong> and enter your librarian email (e.g. <code className="bg-slate-200 px-1 rounded text-slate-800">admin@adtu.edu.in</code>) and password. Copy the newly created user's <strong>User UID</strong>.
                  </p>
                  <p>
                    Next, in <strong>Firestore Database</strong>, create a collection named <code className="bg-slate-200 px-1 rounded text-slate-800 font-mono font-bold">admins</code>. Add a document where the <strong>Document ID</strong> is the copied <strong>User UID</strong>, with fields:
                  </p>
                  <div className="bg-slate-900 text-slate-200 font-mono p-3 rounded-lg text-xs">
                    &#123;<br />
                    &nbsp;&nbsp;"email": "admin@adtu.edu.in",<br />
                    &nbsp;&nbsp;"role": "superadmin",<br />
                    &nbsp;&nbsp;"addedAt": "{new Date().toISOString()}"<br />
                    &#125;
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">4</span>
                  <span>Publish Firestore Security Rules</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                  In Firebase Console, go to <strong>Firestore Database &gt; Rules</strong>. Replace existing rules with the production ruleset below and click <strong>Publish</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Code block with Security Rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>Complete Firestore Security Rules (`firestore.rules`)</span>
              </label>
              <button
                type="button"
                onClick={handleCopyRules}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors"
              >
                {copiedRules ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Rules</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-72">
              {FIRESTORE_SECURITY_RULES_CONTENT}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
