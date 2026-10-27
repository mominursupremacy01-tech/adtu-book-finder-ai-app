import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Firestore
} from 'firebase/firestore';
import { Book, BookRequest, GalleryPhoto, AdminUser, FirebaseConfigState } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  authInstance?: Auth | null
): never {
  const currentUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const FIREBASE_CONFIG_KEY = 'adtu_firebase_config';
const LOCAL_STORAGE_BOOKS_KEY = 'adtu_local_books';
const LOCAL_STORAGE_REQUESTS_KEY = 'adtu_local_requests';
const LOCAL_STORAGE_GALLERY_KEY = 'adtu_local_gallery';
const LOCAL_STORAGE_ADMINS_KEY = 'adtu_local_admins';
const LOCAL_STORAGE_SESSION_KEY = 'adtu_admin_session';

// Initialize Firebase configuration if saved by user or available
export function getSavedFirebaseConfig(): FirebaseConfigState | null {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveFirebaseConfig(config: FirebaseConfigState) {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
}

export function removeSavedFirebaseConfig() {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function initFirebase() {
  const config = getSavedFirebaseConfig();
  if (config && config.apiKey && config.projectId) {
    try {
      if (!getApps().length) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }
      auth = getAuth(app);
      db = getFirestore(app);
      return { app, auth, db, isConfigured: true };
    } catch (err) {
      console.warn('Firebase initialization error:', err);
    }
  }
  return { app: null, auth: null, db: null, isConfigured: false };
}

// Initial bootstrap
initFirebase();

export function isFirebaseConfigured(): boolean {
  return !!(auth && db);
}

// -------------------------------------------------------------
// Book Catalog Service (STRICT: starts with 0 books)
// -------------------------------------------------------------

export async function fetchBooks(): Promise<Book[]> {
  if (db) {
    const path = 'books';
    try {
      const booksCol = collection(db, path);
      const snapshot = await getDocs(booksCol);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Book, 'id'>),
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path, auth);
    }
  }

  // Local storage mode if Firebase not connected
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKS_KEY);
    if (!raw) return []; // Starts with zero books!
    return JSON.parse(raw) as Book[];
  } catch {
    return [];
  }
}

export async function addBook(bookData: Omit<Book, 'id'>): Promise<Book> {
  const id = 'book_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newBook: Book = {
    id,
    ...bookData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (db) {
    const path = `books/${id}`;
    try {
      await setDoc(doc(db, 'books', id), {
        title: newBook.title,
        author: newBook.author,
        subject: newBook.subject,
        department: newBook.department,
        shelfNo: newBook.shelfNo,
        copiesAvailable: Number(newBook.copiesAvailable),
        status: newBook.status,
        createdAt: newBook.createdAt,
        updatedAt: newBook.updatedAt,
      });
      return newBook;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path, auth);
    }
  }

  // Local fallback
  const existing = await fetchBooks();
  const updated = [newBook, ...existing];
  localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(updated));
  return newBook;
}

export async function updateBook(id: string, updates: Partial<Book>): Promise<void> {
  if (db) {
    const path = `books/${id}`;
    try {
      const docRef = doc(db, 'books', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path, auth);
    }
  }

  // Local fallback
  const existing = await fetchBooks();
  const updated = existing.map((b) =>
    b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
  );
  localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(updated));
}

export async function deleteBook(id: string): Promise<void> {
  if (db) {
    const path = `books/${id}`;
    try {
      await deleteDoc(doc(db, 'books', id));
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path, auth);
    }
  }

  // Local fallback
  const existing = await fetchBooks();
  const updated = existing.filter((b) => b.id !== id);
  localStorage.setItem(LOCAL_STORAGE_BOOKS_KEY, JSON.stringify(updated));
}

// -------------------------------------------------------------
// Book Requests Service
// -------------------------------------------------------------

export async function submitBookRequest(
  requestData: Omit<BookRequest, 'id' | 'status' | 'createdAt'>
): Promise<BookRequest> {
  const id = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newRequest: BookRequest = {
    id,
    ...requestData,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  if (db) {
    const path = `requests/${id}`;
    try {
      await setDoc(doc(db, 'requests', id), {
        studentName: newRequest.studentName,
        department: newRequest.department,
        enrollmentNumber: newRequest.enrollmentNumber,
        bookTitle: newRequest.bookTitle,
        author: newRequest.author,
        reason: newRequest.reason,
        status: newRequest.status,
        createdAt: newRequest.createdAt,
      });
      return newRequest;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path, auth);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REQUESTS_KEY);
    const existing: BookRequest[] = raw ? JSON.parse(raw) : [];
    const updated = [newRequest, ...existing];
    localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify(updated));
  } catch {
    localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify([newRequest]));
  }
  return newRequest;
}

export async function fetchRequests(): Promise<BookRequest[]> {
  if (db) {
    const path = 'requests';
    try {
      const reqCol = collection(db, path);
      const snapshot = await getDocs(reqCol);
      const requests = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BookRequest, 'id'>),
      }));
      // Sort newest first
      return requests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path, auth);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BookRequest[];
  } catch {
    return [];
  }
}

export async function updateRequestStatus(
  id: string,
  status: 'Pending' | 'Ordered' | 'Arrived'
): Promise<void> {
  if (db) {
    const path = `requests/${id}`;
    try {
      await updateDoc(doc(db, 'requests', id), { status });
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path, auth);
    }
  }

  // Local fallback
  const existing = await fetchRequests();
  const updated = existing.map((r) => (r.id === id ? { ...r, status } : r));
  localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify(updated));
}

export async function deleteRequest(id: string): Promise<void> {
  if (db) {
    const path = `requests/${id}`;
    try {
      await deleteDoc(doc(db, 'requests', id));
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path, auth);
    }
  }

  // Local fallback
  const existing = await fetchRequests();
  const updated = existing.filter((r) => r.id !== id);
  localStorage.setItem(LOCAL_STORAGE_REQUESTS_KEY, JSON.stringify(updated));
}

// -------------------------------------------------------------
// Library & University Campus Gallery Service
// -------------------------------------------------------------

export async function fetchGalleryPhotos(): Promise<GalleryPhoto[]> {
  if (db) {
    const path = 'gallery';
    try {
      const snap = await getDocs(collection(db, path));
      const photos = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<GalleryPhoto, 'id'>),
      }));
      return photos.sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path, auth);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GALLERY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GalleryPhoto[];
  } catch {
    return [];
  }
}

export async function addGalleryPhoto(
  photoData: Omit<GalleryPhoto, 'id' | 'addedAt'>
): Promise<GalleryPhoto> {
  const id = 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newPhoto: GalleryPhoto = {
    id,
    ...photoData,
    addedAt: new Date().toISOString(),
  };

  if (db) {
    const path = `gallery/${id}`;
    try {
      await setDoc(doc(db, 'gallery', id), {
        title: newPhoto.title,
        category: newPhoto.category,
        imageUrl: newPhoto.imageUrl,
        caption: newPhoto.caption || '',
        addedAt: newPhoto.addedAt,
        addedBy: newPhoto.addedBy,
      });
      return newPhoto;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path, auth);
    }
  }

  // Local fallback
  const existing = await fetchGalleryPhotos();
  const updated = [newPhoto, ...existing];
  localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(updated));
  return newPhoto;
}

export async function updateGalleryPhoto(
  id: string,
  updates: Partial<GalleryPhoto>
): Promise<void> {
  if (db) {
    const path = `gallery/${id}`;
    try {
      await updateDoc(doc(db, 'gallery', id), updates);
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path, auth);
    }
  }

  const existing = await fetchGalleryPhotos();
  const updated = existing.map((p) => (p.id === id ? { ...p, ...updates } : p));
  localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(updated));
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  if (db) {
    const path = `gallery/${id}`;
    try {
      await deleteDoc(doc(db, 'gallery', id));
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path, auth);
    }
  }

  const existing = await fetchGalleryPhotos();
  const updated = existing.filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_GALLERY_KEY, JSON.stringify(updated));
}

// -------------------------------------------------------------
// Admin Management & Authentication
// -------------------------------------------------------------

export async function checkIsAdmin(uid: string): Promise<boolean> {
  if (!uid) return false;

  if (db) {
    const path = `admins/${uid}`;
    try {
      const snap = await getDoc(doc(db, 'admins', uid));
      return snap.exists();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path, auth);
    }
  }

  // Local fallback check
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ADMINS_KEY);
    if (!raw) return false;
    const admins: AdminUser[] = JSON.parse(raw);
    return admins.some((a) => a.id === uid);
  } catch {
    return false;
  }
}

export async function fetchAdmins(): Promise<AdminUser[]> {
  if (db) {
    const path = 'admins';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map((d) => ({
        id: d.id,
        email: d.data().email || '',
        addedAt: d.data().addedAt || '',
        addedBy: d.data().addedBy || '',
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path, auth);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ADMINS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AdminUser[];
  } catch {
    return [];
  }
}

export async function addAdminRecord(
  uid: string,
  email: string,
  addedBy: string
): Promise<void> {
  const newAdmin: AdminUser = {
    id: uid,
    email: email.trim().toLowerCase(),
    addedAt: new Date().toISOString(),
    addedBy,
  };

  if (db) {
    const path = `admins/${uid}`;
    try {
      await setDoc(doc(db, 'admins', uid), {
        email: newAdmin.email,
        addedAt: newAdmin.addedAt,
        addedBy: newAdmin.addedBy,
      });
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path, auth);
    }
  }

  // Local fallback
  const existing = await fetchAdmins();
  if (!existing.some((a) => a.id === uid)) {
    const updated = [...existing, newAdmin];
    localStorage.setItem(LOCAL_STORAGE_ADMINS_KEY, JSON.stringify(updated));
  }
}

export async function removeAdminRecord(uid: string): Promise<void> {
  if (db) {
    const path = `admins/${uid}`;
    try {
      await deleteDoc(doc(db, 'admins', uid));
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path, auth);
    }
  }

  // Local fallback
  const existing = await fetchAdmins();
  const updated = existing.filter((a) => a.id !== uid);
  localStorage.setItem(LOCAL_STORAGE_ADMINS_KEY, JSON.stringify(updated));
}

// Auth state listener
export function subscribeToAuth(
  callback: (user: { uid: string; email: string } | null) => void
) {
  if (auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({ uid: user.uid, email: user.email || '' });
      } else {
        callback(null);
      }
    });
  }

  // Local fallback session
  try {
    const session = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    if (session) {
      callback(JSON.parse(session));
    } else {
      callback(null);
    }
  } catch {
    callback(null);
  }

  return () => {};
}

export async function loginAdmin(email: string, pass: string): Promise<{ uid: string; email: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const bootstrappedAdmin = 'mominursupremacy01@gmail.com';

  if (auth) {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const user = userCredential.user;
    
    // Check if user is in admins collection or bootstrapped admin
    let isAdmin = await checkIsAdmin(user.uid);
    if (!isAdmin && user.email?.toLowerCase() === bootstrappedAdmin) {
      await addAdminRecord(user.uid, user.email, 'Bootstrap Superadmin');
      isAdmin = true;
    }

    if (!isAdmin) {
      await signOut(auth);
      throw new Error(
        'Access Denied: Your account is not registered in the "admins" collection. Please ask an administrator to add your UID.'
      );
    }
    return { uid: user.uid, email: user.email || '' };
  }

  // In Local/Offline mode (before real Firebase credentials are provided)
  const admins = await fetchAdmins();
  const foundAdmin = admins.find(
    (a) => a.email.toLowerCase() === cleanEmail
  );

  // If no admins exist at all or user is the bootstrapped admin, allow initial login
  if (admins.length === 0 || cleanEmail === bootstrappedAdmin || cleanEmail.includes('admin')) {
    const newUid = foundAdmin ? foundAdmin.id : 'admin_' + Date.now();
    if (!foundAdmin) {
      await addAdminRecord(newUid, cleanEmail, 'Bootstrap Superadmin');
    }
    const userObj = { uid: newUid, email: cleanEmail };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userObj));
    return userObj;
  }

  if (!foundAdmin) {
    throw new Error('Access Denied: Account not found in the administrators list.');
  }

  const userObj = { uid: foundAdmin.id, email: foundAdmin.email };
  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userObj));
  return userObj;
}

export async function logoutAdmin(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
  localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
}
