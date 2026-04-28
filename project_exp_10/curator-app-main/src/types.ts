export interface Book {
  id: string;
  uid: string;
  title: string;
  author: string;
  coverUrl?: string;
  category?: string;
  status: 'reading' | 'completed' | 'wishlist';
  progress?: number;
  totalPages?: number;
  currentPage?: number;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  goals?: {
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

export interface Quote {
  id: string;
  uid: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  text: string;
  note?: string;
  createdAt: any;
}