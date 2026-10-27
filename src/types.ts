export type BookStatus = 'Available' | 'Issued';

export type RequestStatus = 'Pending' | 'Ordered' | 'Arrived';

export interface Book {
  id: string;
  title: string;
  author: string;
  subject: string;
  department: string;
  shelfNo: string;
  copiesAvailable: number;
  status: BookStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookRequest {
  id: string;
  studentName: string;
  department: string;
  enrollmentNumber: string; // Updated from roll number to enrollment number
  bookTitle: string;
  author: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'Library' | 'Campus' | 'Study Hall' | 'Digital Center' | 'Events';
  imageUrl: string;
  caption?: string;
  addedAt: string;
  addedBy: string;
}

export interface AdminUser {
  id: string; // Document ID (UID)
  email: string;
  role?: string;
  addedAt?: string;
  addedBy?: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  firestoreDatabaseId?: string;
}
