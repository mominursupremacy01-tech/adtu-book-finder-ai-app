import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Book, BookRequest, GalleryPhoto, AdminUser, RequestStatus } from './types';
import {
  fetchBooks,
  addBook,
  updateBook,
  deleteBook,
  fetchRequests,
  updateRequestStatus,
  deleteRequest,
  fetchGalleryPhotos,
  addGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
  fetchAdmins,
  addAdminRecord,
  removeAdminRecord,
  subscribeToAuth,
  logoutAdmin,
  isFirebaseConfigured,
  initFirebase
} from './lib/firebase';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BookCard } from './components/BookCard';
import { RequestBookModal } from './components/RequestBookModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { BookFormModal } from './components/BookFormModal';
import { PhotoFormModal } from './components/PhotoFormModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SetupInstructionsModal } from './components/SetupInstructionsModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { BookQrModal } from './components/BookQrModal';
import { QrScannerModal } from './components/QrScannerModal';
import { CampusGallery } from './components/CampusGallery';
import {
  Search,
  BookOpen,
  Filter,
  PlusCircle,
  AlertCircle,
  Building2,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

const INACTIVITY_TIMEOUT_SECONDS = 15 * 60; // 15 minutes auto-logout for admin

const DEFAULT_DEPARTMENTS = [
  'All',
  'Faculty of Engineering & Technology',
  'Faculty of Pharmaceutical Science',
  'Faculty of Nursing',
  'Faculty of Paramedical & Allied Health',
  'Faculty of Management & Commerce',
  'Faculty of Science & Biotechnology',
  'Faculty of Humanities & Social Sciences',
];

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<'catalog' | 'admin'>('catalog');

  // Core Data states - STRICT: starts with 0 books
  const [books, setBooks] = useState<Book[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state for students
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'available' | 'issued'>('all');

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestPrefillTitle, setRequestPrefillTitle] = useState('');
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isPhotoFormOpen, setIsPhotoFormOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [qrModalBook, setQrModalBook] = useState<Book | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Admin user & Inactivity tracking
  const [adminUser, setAdminUser] = useState<{ uid: string; email: string } | null>(null);
  const [inactivitySecondsRemaining, setInactivitySecondsRemaining] = useState<number | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  // Cloud status notification
  const [isCloudActive, setIsCloudActive] = useState(isFirebaseConfigured());

  // Load books & initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const bks = await fetchBooks();
      setBooks(bks);

      const phts = await fetchGalleryPhotos();
      setPhotos(phts);

      // Only load requests and admins if admin is logged in
      if (adminUser) {
        const reqs = await fetchRequests();
        const adms = await fetchAdmins();
        setRequests(reqs);
        setAdmins(adms);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adminUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setAdminUser(user);
      if (user) {
        setLastActivityTime(Date.now());
        setInactivitySecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
        // Refresh admin data
        try {
          const reqs = await fetchRequests();
          const adms = await fetchAdmins();
          setRequests(reqs);
          setAdmins(adms);
        } catch (err) {
          console.error(err);
        }
      } else {
        setInactivitySecondsRemaining(null);
        if (currentView === 'admin') {
          setCurrentView('catalog');
        }
      }
    });

    return () => unsubscribe();
  }, [currentView]);

  // Inactivity auto-logout timer
  useEffect(() => {
    if (!adminUser) {
      setInactivitySecondsRemaining(null);
      return;
    }

    const handleUserActivity = () => {
      setLastActivityTime(Date.now());
      setInactivitySecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity));

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityTime) / 1000);
      const remaining = INACTIVITY_TIMEOUT_SECONDS - elapsed;
      if (remaining <= 0) {
        // Inactivity reached -> Auto Logout!
        logoutAdmin();
        setAdminUser(null);
        setCurrentView('catalog');
        setInactivitySecondsRemaining(null);
      } else {
        setInactivitySecondsRemaining(remaining);
      }
    }, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(interval);
    };
  }, [adminUser, lastActivityTime]);

  const handleLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    setCurrentView('catalog');
  };

  // Departments list combining defaults and any custom departments in books
  const departmentOptions = useMemo(() => {
    const bookDepts = books.map((b) => b.department).filter(Boolean);
    const set = new Set([...DEFAULT_DEPARTMENTS, ...bookDepts]);
    return Array.from(set);
  }, [books]);

  // Public search filter (case-insensitive search by Title, Author, and Subject)
  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((book) => {
      const matchQuery =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.subject.toLowerCase().includes(q) ||
        book.shelfNo.toLowerCase().includes(q);

      const matchDept =
        selectedDepartment === 'All' || book.department === selectedDepartment;

      const isAvailable = book.copiesAvailable > 0 && book.status === 'Available';
      const matchAvail =
        selectedAvailability === 'all' ||
        (selectedAvailability === 'available' && isAvailable) ||
        (selectedAvailability === 'issued' && !isAvailable);

      return matchQuery && matchDept && matchAvail;
    });
  }, [books, searchQuery, selectedDepartment, selectedAvailability]);

  // Handle scanned QR payload
  const handleQrScanned = (decoded: string) => {
    try {
      // Try parsing structured JSON
      const parsed = JSON.parse(decoded);
      if (parsed.title) {
        setSearchQuery(parsed.title);
        return;
      }
      if (parsed.shelfNo) {
        setSearchQuery(parsed.shelfNo);
        return;
      }
      if (parsed.bookId) {
        const found = books.find((b) => b.id === parsed.bookId);
        if (found) {
          setSearchQuery(found.title);
          return;
        }
      }
    } catch {
      // Plain text payload
    }
    setSearchQuery(decoded);
  };

  // Handlers for book mutations
  const handleSaveBook = async (bookData: Omit<Book, 'id'>) => {
    if (editingBook) {
      await updateBook(editingBook.id, bookData);
      setEditingBook(null);
    } else {
      await addBook(bookData);
    }
    await loadData();
  };

  const handleDeleteBook = async (id: string) => {
    await deleteBook(id);
    await loadData();
  };

  const handleUpdateRequestStatus = async (id: string, status: RequestStatus) => {
    await updateRequestStatus(id, status);
    const updated = await fetchRequests();
    setRequests(updated);
  };

  const handleDeleteRequest = async (id: string) => {
    await deleteRequest(id);
    const updated = await fetchRequests();
    setRequests(updated);
  };

  // Handlers for photo mutations
  const handleSavePhoto = async (photoData: Omit<GalleryPhoto, 'id' | 'addedAt' | 'addedBy'>) => {
    if (editingPhoto) {
      await updateGalleryPhoto(editingPhoto.id, photoData);
      setEditingPhoto(null);
    } else {
      await addGalleryPhoto({
        ...photoData,
        addedBy: adminUser?.email || 'admin',
      });
    }
    const updated = await fetchGalleryPhotos();
    setPhotos(updated);
  };

  const handleDeletePhoto = async (id: string) => {
    await deleteGalleryPhoto(id);
    const updated = await fetchGalleryPhotos();
    setPhotos(updated);
  };

  const handleAddAdmin = async (uid: string, email: string) => {
    await addAdminRecord(uid, email, adminUser?.email || 'admin');
    const updated = await fetchAdmins();
    setAdmins(updated);
  };

  const handleRemoveAdmin = async (uid: string) => {
    await removeAdminRecord(uid);
    const updated = await fetchAdmins();
    setAdmins(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin' && !adminUser) {
            setIsAdminLoginModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        onRequestBookOpen={() => {
          setRequestPrefillTitle('');
          setIsRequestModalOpen(true);
        }}
        onAdminLoginOpen={() => setIsAdminLoginModalOpen(true)}
        onSetupGuideOpen={() => setIsSetupGuideOpen(true)}
        onConfigModalOpen={() => setIsConfigModalOpen(true)}
        onScanQrOpen={() => setIsScannerOpen(true)}
        adminUser={adminUser}
        onLogout={handleLogout}
        inactivityRemainingSeconds={inactivitySecondsRemaining}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'admin' && adminUser ? (
          /* ADMIN VIEW */
          <AdminDashboard
            books={books}
            requests={requests}
            photos={photos}
            admins={admins}
            currentAdmin={adminUser}
            onAddBookClick={() => {
              setEditingBook(null);
              setIsBookFormOpen(true);
            }}
            onEditBookClick={(b) => {
              setEditingBook(b);
              setIsBookFormOpen(true);
            }}
            onDeleteBook={handleDeleteBook}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onDeleteRequest={handleDeleteRequest}
            onAddPhotoClick={() => {
              setEditingPhoto(null);
              setIsPhotoFormOpen(true);
            }}
            onEditPhotoClick={(p) => {
              setEditingPhoto(p);
              setIsPhotoFormOpen(true);
            }}
            onDeletePhoto={handleDeletePhoto}
            onAddAdmin={handleAddAdmin}
            onRemoveAdmin={handleRemoveAdmin}
            onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
            onViewQr={(b) => setQrModalBook(b)}
          />
        ) : (
          /* STUDENT / PUBLIC VIEW */
          <div className="space-y-8 sm:space-y-10">
            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/25 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
                  <Building2 className="w-3.5 h-3.5 text-blue-300" />
                  <span>Assam down town University Library</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Find Books, Scan QR &amp; Locate Shelves
                </h1>
                <p className="text-blue-100/90 text-sm sm:text-base mt-3 leading-relaxed">
                  Search through the Central Library catalog. View shelf QR codes, find exact physical locations, or submit a requisition with your Department &amp; Enrollment ID.
                </p>

                {/* Big Search Input with Camera Scan QR shortcut */}
                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, author, subject, or shelf no..."
                      className="w-full pl-12 pr-20 py-3.5 sm:py-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl shadow-lg text-sm sm:text-base font-medium focus:outline-hidden focus:ring-4 focus:ring-blue-400/40"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-98 cursor-pointer shrink-0"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Scan Shelf QR</span>
                  </button>
                </div>
              </div>

              {/* Decorative background shapes */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
                <BookOpen className="w-80 h-80" />
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter by Department</span>
                </span>

                <div className="flex items-center gap-2">
                  {/* Availability quick filter */}
                  <div className="inline-flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setSelectedAvailability('all')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        selectedAvailability === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setSelectedAvailability('available')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        selectedAvailability === 'available' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => setSelectedAvailability('issued')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        selectedAvailability === 'issued' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Issued
                    </button>
                  </div>

                  {selectedDepartment !== 'All' && (
                    <button
                      onClick={() => setSelectedDepartment('All')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Reset Dept
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {departmentOptions.map((dept) => {
                  const isSelected = selectedDepartment === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartment(dept)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all active:scale-98 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Books Catalog</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {filteredBooks.length}
                </span>
              </h2>

              <button
                type="button"
                onClick={() => {
                  setRequestPrefillTitle(searchQuery.trim());
                  setIsRequestModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Can't find a book? Request it</span>
              </button>
            </div>

            {/* Catalog Content */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 bg-white rounded-2xl border border-slate-200 p-5 animate-pulse flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-10 bg-slate-100 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              /* STRICT REQUIREMENT: "If the library is empty, show the message 'No books have been added yet.'" */
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No books have been added yet.</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  The Assam down town University library catalog has not been stocked yet. A registered administrator must log in to add books manually.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAdminLoginModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
                  >
                    Admin Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestPrefillTitle('');
                      setIsRequestModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm border border-blue-200 transition-all cursor-pointer"
                  >
                    Request a Book
                  </button>
                </div>
              </div>
            ) : filteredBooks.length === 0 ? (
              /* STRICT REQUIREMENT: "If a search returns nothing, show 'Book not found' and a 'Request this book' button." */
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Book not found</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  We could not find any titles matching "{searchQuery}" in the selected filters. Would you like to submit a procurement requisition for this title?
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRequestPrefillTitle(searchQuery.trim());
                      setIsRequestModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all active:scale-98 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Request this book</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDepartment('All');
                      setSelectedAvailability('all');
                    }}
                    className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              /* Books Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isAdmin={false}
                    onViewQr={(b) => setQrModalBook(b)}
                  />
                ))}
              </div>
            )}

            {/* University & Library Photos Showcase Section */}
            <CampusGallery
              photos={photos}
              isAdmin={!!adminUser}
              onAddPhotoClick={() => {
                setEditingPhoto(null);
                setIsPhotoFormOpen(true);
              }}
              onManagePhotosClick={adminUser ? () => setCurrentView('admin') : undefined}
            />
          </div>
        )}
      </main>

      {/* FOOTER - "Created by MIP" */}
      <Footer />

      {/* Modals */}
      <RequestBookModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialBookTitle={requestPrefillTitle}
      />

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={(user) => {
          setAdminUser(user);
          setCurrentView('admin');
        }}
      />

      <BookFormModal
        isOpen={isBookFormOpen}
        onClose={() => {
          setIsBookFormOpen(false);
          setEditingBook(null);
        }}
        onSubmit={handleSaveBook}
        initialData={editingBook}
      />

      <PhotoFormModal
        isOpen={isPhotoFormOpen}
        onClose={() => {
          setIsPhotoFormOpen(false);
          setEditingPhoto(null);
        }}
        onSubmit={handleSavePhoto}
        initialData={editingPhoto}
      />

      <SetupInstructionsModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />

      <FirebaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigUpdated={() => {
          setIsCloudActive(isFirebaseConfigured());
          loadData();
        }}
      />

      <BookQrModal
        isOpen={!!qrModalBook}
        onClose={() => setQrModalBook(null)}
        book={qrModalBook}
      />

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleQrScanned}
      />
    </div>
  );
}
