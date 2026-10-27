import React, { useState } from 'react';
import { Book, BookRequest, GalleryPhoto, AdminUser, RequestStatus } from '../types';
import { BookCard } from './BookCard';
import { ConfirmModal } from './ConfirmModal';
import {
  BookOpen,
  Inbox,
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  Trash2,
  UserPlus,
  Shield,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  Calendar,
  User,
  GraduationCap,
  Building2,
  Copy,
  Image as ImageIcon,
  Edit2
} from 'lucide-react';
import { isValidEmail } from '../lib/sanitize';

interface AdminDashboardProps {
  books: Book[];
  requests: BookRequest[];
  photos: GalleryPhoto[];
  admins: AdminUser[];
  currentAdmin: { uid: string; email: string };
  onAddBookClick: () => void;
  onEditBookClick: (book: Book) => void;
  onDeleteBook: (id: string) => Promise<void>;
  onUpdateRequestStatus: (id: string, status: RequestStatus) => Promise<void>;
  onDeleteRequest: (id: string) => Promise<void>;
  onAddPhotoClick: () => void;
  onEditPhotoClick: (photo: GalleryPhoto) => void;
  onDeletePhoto: (id: string) => Promise<void>;
  onAddAdmin: (uid: string, email: string) => Promise<void>;
  onRemoveAdmin: (uid: string) => Promise<void>;
  onOpenSetupGuide: () => void;
  onViewQr: (book: Book) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  books,
  requests,
  photos,
  admins,
  currentAdmin,
  onAddBookClick,
  onEditBookClick,
  onDeleteBook,
  onUpdateRequestStatus,
  onDeleteRequest,
  onAddPhotoClick,
  onEditPhotoClick,
  onDeletePhoto,
  onAddAdmin,
  onRemoveAdmin,
  onOpenSetupGuide,
  onViewQr,
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'requests' | 'photos' | 'admins'>('books');

  // Search & filter states
  const [bookSearch, setBookSearch] = useState('');
  const [bookDeptFilter, setBookDeptFilter] = useState('All');
  const [requestFilter, setRequestFilter] = useState<'All' | RequestStatus>('All');
  const [requestSearch, setRequestSearch] = useState('');
  const [photoCategoryFilter, setPhotoCategoryFilter] = useState('All');

  // New admin form state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUid, setNewAdminUid] = useState('');
  const [adminFormError, setAdminFormError] = useState<string | null>(null);
  const [adminFormSuccess, setAdminFormSuccess] = useState<string | null>(null);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // Confirm delete modals
  const [deleteBookTarget, setDeleteBookTarget] = useState<Book | null>(null);
  const [deleteRequestTarget, setDeleteRequestTarget] = useState<BookRequest | null>(null);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<GalleryPhoto | null>(null);
  const [deleteAdminTarget, setDeleteAdminTarget] = useState<AdminUser | null>(null);

  // Statistics
  const totalCopies = books.reduce((sum, b) => sum + (b.copiesAvailable || 0), 0);
  const pendingRequestsCount = requests.filter((r) => r.status === 'Pending').length;

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const q = bookSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.subject.toLowerCase().includes(q) ||
      b.shelfNo.toLowerCase().includes(q);
    const matchesDept = bookDeptFilter === 'All' || b.department === bookDeptFilter;
    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = ['All', ...Array.from(new Set(books.map((b) => b.department).filter(Boolean)))];

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    const matchesStatus = requestFilter === 'All' || r.status === requestFilter;
    const q = requestSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.studentName.toLowerCase().includes(q) ||
      (r.enrollmentNumber && r.enrollmentNumber.toLowerCase().includes(q)) ||
      (r.department && r.department.toLowerCase().includes(q)) ||
      r.bookTitle.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filtered photos
  const filteredPhotos = photos.filter((p) => {
    return photoCategoryFilter === 'All' || p.category === photoCategoryFilter;
  });

  // Handle adding admin
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError(null);
    setAdminFormSuccess(null);

    const email = newAdminEmail.trim();
    const uid = newAdminUid.trim();

    if (!isValidEmail(email)) {
      setAdminFormError('Please enter a valid email address.');
      return;
    }
    if (!uid) {
      setAdminFormError('Firebase Auth User UID is required.');
      return;
    }
    if (admins.some((a) => a.id === uid || a.email.toLowerCase() === email.toLowerCase())) {
      setAdminFormError('An administrator with this UID or email already exists.');
      return;
    }

    try {
      setIsSubmittingAdmin(true);
      await onAddAdmin(uid, email);
      setAdminFormSuccess(`Administrator ${email} successfully registered!`);
      setNewAdminEmail('');
      setNewAdminUid('');
    } catch (err: any) {
      setAdminFormError(err?.message || 'Failed to add administrator.');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Verified Administrator Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Library Administration Portal
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Signed in as <span className="font-semibold text-white">{currentAdmin.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onOpenSetupGuide}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/15 transition-all cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-blue-300" />
              <span>Rules &amp; Deployment</span>
            </button>
            <button
              onClick={onAddPhotoClick}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Add Photo</span>
            </button>
            <button
              onClick={onAddBookClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Book</span>
            </button>
          </div>
        </div>
      </div>

      {/* Library KPI Summary Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Titles</span>
            <span className="text-lg sm:text-xl font-black text-slate-900">{books.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Copies</span>
            <span className="text-lg sm:text-xl font-black text-slate-900">{totalCopies}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Campus Photos</span>
            <span className="text-lg sm:text-xl font-black text-slate-900">{photos.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Pending Requisitions</span>
            <span className="text-lg sm:text-xl font-black text-slate-900">{pendingRequestsCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center border-b border-slate-200 overflow-x-auto gap-2 sm:gap-4 no-scrollbar">
        <button
          onClick={() => setActiveTab('books')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'books'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Books Catalog</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold">
            {books.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Student Requests</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-semibold">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'photos'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Campus &amp; Library Photos</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700 font-semibold">
            {photos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'admins'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Administrators</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-semibold">
            {admins.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Books Catalog Management */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                placeholder="Search by title, author, shelf..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Dept:</span>
              <select
                value={bookDeptFilter}
                onChange={(e) => setBookDeptFilter(e.target.value)}
                className="w-full sm:w-auto py-2 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Book Catalog Grid */}
          {books.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No books have been added yet.</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                The library catalog is currently empty. Use the button below to add the first book to the collection.
              </p>
              <button
                type="button"
                onClick={onAddBookClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Book</span>
              </button>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
              <p className="font-bold text-slate-700">No books match your search or filter.</p>
              <button
                type="button"
                onClick={() => {
                  setBookSearch('');
                  setBookDeptFilter('All');
                }}
                className="mt-3 text-xs text-blue-600 font-semibold underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isAdmin={true}
                  onEdit={onEditBookClick}
                  onDelete={(b) => setDeleteBookTarget(b)}
                  onViewQr={onViewQr}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Student Requests Management */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Controls Bar: Status Filter + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['All', 'Pending', 'Ordered', 'Arrived'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setRequestFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    requestFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                  {st === 'Pending' && requests.filter((r) => r.status === 'Pending').length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px]">
                      {requests.filter((r) => r.status === 'Pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                placeholder="Search student, enrollment, title..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No book requests have been submitted yet.</h3>
              <p className="text-xs text-slate-400 mt-1">
                When students request titles that are missing from the catalog, they will appear here.
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              No requisitions match your filter criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          req.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : req.status === 'Ordered'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {req.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        {req.status === 'Ordered' && <Package className="w-3.5 h-3.5" />}
                        {req.status === 'Arrived' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{req.status}</span>
                      </span>

                      {/* Student Department Badge */}
                      {req.department && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 max-w-xs truncate">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{req.department}</span>
                        </span>
                      )}

                      <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(req.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{req.bookTitle}</h4>
                      <p className="text-xs text-slate-600 font-medium">
                        by <span className="text-slate-800">{req.author}</span>
                      </p>
                    </div>

                    {/* Student Identification - Enrollment Number */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900">{req.studentName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 border-l border-slate-300 pl-3">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span className="text-slate-500 font-semibold">Enrollment:</span>
                        <span className="font-mono text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                          {req.enrollmentNumber}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60">
                      <span className="font-semibold text-slate-700">Reason: </span>
                      {req.reason}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <select
                      value={req.status}
                      onChange={(e) =>
                        onUpdateRequestStatus(req.id, e.target.value as RequestStatus)
                      }
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ordered">Ordered</option>
                      <option value="Arrived">Arrived</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setDeleteRequestTarget(req)}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-300 transition-colors flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                      title="Delete Requisition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sm:hidden">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Campus & Library Photos Management (NEW FEATURE) */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Category:</span>
              <select
                value={photoCategoryFilter}
                onChange={(e) => setPhotoCategoryFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                {['All', 'Library', 'Campus', 'Study Hall', 'Digital Center', 'Events'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onAddPhotoClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Photo</span>
            </button>
          </div>

          {photos.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No photos uploaded yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                Add university library reading halls, IT facilities, or campus scenery to make the ADTU BookFinder website attractive and welcoming.
              </p>
              <button
                type="button"
                onClick={onAddPhotoClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First Photo</span>
              </button>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              No photos found under category "{photoCategoryFilter}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-900">
                      {photo.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{photo.title}</h4>
                      {photo.caption && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {photo.caption}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(photo.addedAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditPhotoClick(photo)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit Photo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletePhotoTarget(photo)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Administrators Management */}
      {activeTab === 'admins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Admin Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs h-fit">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base mb-1">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>Register New Administrator</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Add a university librarian or staff member to the authorized <code className="bg-slate-100 px-1 rounded font-mono">admins</code> collection.
            </p>

            {adminFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs mb-3">
                {adminFormError}
              </div>
            )}
            {adminFormSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs mb-3">
                {adminFormSuccess}
              </div>
            )}

            <form onSubmit={handleAddAdminSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="librarian@adtu.edu.in"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  User UID (from Firebase Auth) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAdminUid}
                  onChange={(e) => setNewAdminUid(e.target.value)}
                  placeholder="e.g. 7q9K2... or User UID"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Find the UID in Firebase Console &gt; Authentication &gt; Users.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAdmin}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>{isSubmittingAdmin ? 'Registering...' : 'Add Administrator'}</span>
              </button>
            </form>
          </div>

          {/* Current Admins List */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-1">Current Authorized Administrators</h3>
            <p className="text-xs text-slate-500 mb-4">
              Users registered here have full privileges to add/edit/delete books, inspect student requisitions, and manage campus photos.
            </p>

            <div className="space-y-3">
              {admins.map((adm) => {
                const isCurrent = adm.id === currentAdmin.uid;
                return (
                  <div
                    key={adm.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{adm.email}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        UID: <span className="text-slate-600">{adm.id}</span>
                      </div>
                      {adm.addedAt && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          Added: {new Date(adm.addedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => setDeleteAdminTarget(adm)}
                        className="self-end sm:self-center p-2 rounded-xl text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Admin</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Book */}
      <ConfirmModal
        isOpen={!!deleteBookTarget}
        title="Delete Book from Catalog"
        message={`Are you sure you want to permanently delete "${deleteBookTarget?.title}" by ${deleteBookTarget?.author}? This action cannot be undone.`}
        confirmLabel="Yes, Delete Book"
        onCancel={() => setDeleteBookTarget(null)}
        onConfirm={async () => {
          if (deleteBookTarget) {
            await onDeleteBook(deleteBookTarget.id);
            setDeleteBookTarget(null);
          }
        }}
      />

      {/* Confirmation Modal for Deleting Request */}
      <ConfirmModal
        isOpen={!!deleteRequestTarget}
        title="Delete Book Requisition"
        message={`Are you sure you want to delete the book requisition for "${deleteRequestTarget?.bookTitle}" submitted by ${deleteRequestTarget?.studentName} (${deleteRequestTarget?.enrollmentNumber})?`}
        confirmLabel="Yes, Delete Request"
        onCancel={() => setDeleteRequestTarget(null)}
        onConfirm={async () => {
          if (deleteRequestTarget) {
            await onDeleteRequest(deleteRequestTarget.id);
            setDeleteRequestTarget(null);
          }
        }}
      />

      {/* Confirmation Modal for Deleting Photo */}
      <ConfirmModal
        isOpen={!!deletePhotoTarget}
        title="Delete Campus Photo"
        message={`Are you sure you want to remove "${deletePhotoTarget?.title}" from the university showcase?`}
        confirmLabel="Yes, Delete Photo"
        onCancel={() => setDeletePhotoTarget(null)}
        onConfirm={async () => {
          if (deletePhotoTarget) {
            await onDeletePhoto(deletePhotoTarget.id);
            setDeletePhotoTarget(null);
          }
        }}
      />

      {/* Confirmation Modal for Deleting Admin */}
      <ConfirmModal
        isOpen={!!deleteAdminTarget}
        title="Revoke Administrator Privileges"
        message={`Are you sure you want to remove ${deleteAdminTarget?.email} from the administrators collection? They will immediately lose access to the admin dashboard.`}
        confirmLabel="Revoke Admin Access"
        onCancel={() => setDeleteAdminTarget(null)}
        onConfirm={async () => {
          if (deleteAdminTarget) {
            await onRemoveAdmin(deleteAdminTarget.id);
            setDeleteAdminTarget(null);
          }
        }}
      />
    </div>
  );
};
