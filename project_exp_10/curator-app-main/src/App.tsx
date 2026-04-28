import { useState, useEffect } from 'react';
import { auth, db, isNative } from './firebase';
import {
  onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, GoogleAuthProvider, signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { LayoutDashboard, Library as LibraryIcon, PlusCircle, Quote, User, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Book, UserProfile, Quote as QuoteType } from './types';

import Dashboard from './components/screens/Dashboard';
import Library from './components/screens/Library';
import AddBook from './components/screens/AddBook';
import Quotes from './components/screens/Quotes';
import Profile from './components/screens/Profile';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [quotes, setQuotes] = useState<QuoteType[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [initialSearchQuery, setInitialSearchQuery] = useState('');

  useEffect(() => {
    const handleNavigateToAdd = (e: any) => {
      setInitialSearchQuery(e.detail?.query || '');
      setActiveTab('add');
    };
    window.addEventListener('navigate-to-add', handleNavigateToAdd);
    return () => window.removeEventListener('navigate-to-add', handleNavigateToAdd);
  }, []);

  // Catch redirect result when app resumes after OAuth
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Redirect login successful:", result.user.email);
          // onAuthStateChanged will fire and handle the rest
        }
      })
      .catch((error) => {
        console.error("Redirect result error:", error.code, error.message);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);

        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Curator',
            photoURL: firebaseUser.photoURL || '',
            goals: { weekly: 1, monthly: 4, yearly: 50 }
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setProfile(newProfile);
        }

        const q = query(
          collection(db, 'books'),
          where('uid', '==', firebaseUser.uid),
          orderBy('updatedAt', 'desc')
        );
        const unsubBooks = onSnapshot(q, (snapshot) => {
          setBooks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Book)));
        });

        const qq = query(
          collection(db, 'quotes'),
          where('uid', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc')
        );
        const unsubQuotes = onSnapshot(qq, (snapshot) => {
          setQuotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuoteType)));
        });

        setLoading(false);
        return () => { unsubBooks(); unsubQuotes(); };
      } else {
        setUser(null);
        const guestMode = localStorage.getItem('guestMode') === 'true';
        if (guestMode) {
          setIsGuest(true);
          const savedProfile = localStorage.getItem('guestProfile');
          const savedBooks = localStorage.getItem('guestBooks');
          const savedQuotes = localStorage.getItem('guestQuotes');

          if (savedProfile) setProfile(JSON.parse(savedProfile));
          else {
            const defaultProfile: UserProfile = {
              uid: 'guest',
              email: 'guest@library.app',
              displayName: 'Guest Curator',
              goals: { weekly: 1, monthly: 4, yearly: 50 }
            };
            setProfile(defaultProfile);
            localStorage.setItem('guestProfile', JSON.stringify(defaultProfile));
          }
          if (savedBooks) setBooks(JSON.parse(savedBooks));
          if (savedQuotes) setQuotes(JSON.parse(savedQuotes));
        } else {
          setIsGuest(false);
          setProfile(null);
          setBooks([]);
          setQuotes([]);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isGuest && profile) localStorage.setItem('guestProfile', JSON.stringify(profile));
    if (isGuest && books.length > 0) localStorage.setItem('guestBooks', JSON.stringify(books));
    if (isGuest && quotes.length > 0) localStorage.setItem('guestQuotes', JSON.stringify(quotes));
  }, [isGuest, profile, books, quotes]);

  const handleLoginGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      if (isNative) {
        // On native, signInWithRedirect opens Chrome Custom Tab
        // When user selects account, app resumes and getRedirectResult catches it
        await signInWithRedirect(auth, provider);
      } else {
        try {
          await signInWithPopup(auth, provider);
        } catch (popupError: any) {
          if (
            popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/popup-closed-by-user'
          ) {
            await signInWithRedirect(auth, provider);
          } else {
            throw popupError;
          }
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error?.code, error?.message);
    }
  };

  const handleContinueAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
    const savedProfile = localStorage.getItem('guestProfile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    else {
      const defaultProfile: UserProfile = {
        uid: 'guest',
        email: 'guest@library.app',
        displayName: 'Guest Curator',
        goals: { weekly: 1, monthly: 4, yearly: 50 }
      };
      setProfile(defaultProfile);
      localStorage.setItem('guestProfile', JSON.stringify(defaultProfile));
    }
    const savedBooks = localStorage.getItem('guestBooks');
    if (savedBooks) setBooks(JSON.parse(savedBooks));
    const savedQuotes = localStorage.getItem('guestQuotes');
    if (savedQuotes) setQuotes(JSON.parse(savedQuotes));
  };

  const handleLogout = async () => {
    try {
      if (isGuest) {
        localStorage.setItem('guestMode', 'false');
        setIsGuest(false);
        setProfile(null);
        setBooks([]);
        setQuotes([]);
      } else {
        await signOut(auth);
      }
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F1EB]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-[#C25B2A] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Login onGuest={handleContinueAsGuest} onGoogle={handleLoginGoogle} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard books={books} profile={profile} isGuest={isGuest} setBooks={setBooks} />;
      case 'library': return <Library books={books} isGuest={isGuest} setBooks={setBooks} />;
      case 'add': return (
        <AddBook
          onComplete={() => { setActiveTab('library'); setInitialSearchQuery(''); }}
          isGuest={isGuest}
          setBooks={setBooks}
          initialQuery={initialSearchQuery}
          books={books}
        />
      );
      case 'quotes': return <Quotes books={books} quotes={quotes} setQuotes={setQuotes} isGuest={isGuest} profile={profile} />;
      case 'profile': return <Profile profile={profile} setProfile={setProfile} isGuest={isGuest} books={books} quotes={quotes} onLogout={handleLogout} />;
      default: return <Dashboard books={books} profile={profile} isGuest={isGuest} setBooks={setBooks} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1EB] pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#EAE6DF]/80 backdrop-blur-md border-t border-[#D1CDC5] px-6 py-4 flex justify-between items-center z-50">
        <NavButton icon={LayoutDashboard} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavButton icon={LibraryIcon} label="Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
        <NavButton icon={PlusCircle} label="Add" active={activeTab === 'add'} onClick={() => setActiveTab('add')} />
        <NavButton icon={Quote} label="Quotes" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
        <NavButton icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: {
  icon: any, label: string, active: boolean, onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active ? "text-[#C25B2A]" : "text-[#8E8A84]"
      )}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
}

function Login({ onGuest, onGoogle }: { onGuest: () => void, onGoogle: () => void }) {
  return (
    <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#EAE6DF] p-12 rounded-[3rem] shadow-xl max-w-md w-full text-center space-y-8"
      >
        <div className="w-24 h-24 bg-[#C25B2A] rounded-[2rem] flex items-center justify-center mx-auto shadow-lg rotate-3">
          <LibraryIcon className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-bold text-[#2D2D2D]">Curator</h1>
          <p className="text-[#8E8A84] text-sm">Your personal intellectual sanctuary.</p>
        </div>
        <div className="space-y-4 pt-4">
          <button
            onClick={onGoogle}
            className="w-full bg-[#2D2D2D] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-md group"
          >
            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Sign in with Google
          </button>
          <button
            onClick={onGuest}
            className="w-full bg-white/50 text-[#2D2D2D] py-4 rounded-2xl font-bold hover:bg-white transition-all border border-[#D1CDC5]"
          >
            Continue as Guest
          </button>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8E8A84] opacity-50">
          Secure • Private • Intellectual
        </p>
      </motion.div>
    </div>
  );
}