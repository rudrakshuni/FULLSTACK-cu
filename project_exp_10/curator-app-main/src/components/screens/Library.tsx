import { useState, useEffect, useCallback } from 'react';
import { Book } from '../../types';
import { Search, Filter, BookOpen, CheckCircle, Bookmark, Trash2, Globe, Loader2, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { db, auth } from '../../firebase';
import { doc, deleteDoc, addDoc, serverTimestamp, collection, updateDoc } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

interface LibraryProps {
  books: Book[];
  isGuest?: boolean;
  setBooks?: React.Dispatch<React.SetStateAction<Book[]>>;
}

export default function Library({ books, isGuest, setBooks }: LibraryProps) {
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed' | 'wishlist'>('all');
  const [search, setSearch] = useState('');
  const [internetResults, setInternetResults] = useState<any[]>([]);
  const [loadingInternet, setLoadingInternet] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [adding, setAdding] = useState(false);

  const handleInternetSearch = useCallback(async (queryToSearch: string, pageNum = 1) => {
    if (pageNum === 1) {
      setLoadingInternet(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(queryToSearch)}&limit=20&page=${pageNum}`);
      const data = await response.json();
      
      const mappedResults = (data.docs || []).map((item: any) => ({
        id: item.key,
        volumeInfo: {
          title: item.title,
          authors: item.author_name || ['Unknown Author'],
          imageLinks: item.cover_i 
            ? { thumbnail: `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` }
            : null,
          categories: item.subject || []
        }
      }));
      
      if (pageNum === 1) {
        setInternetResults(mappedResults);
      } else {
        setInternetResults(prev => [...prev, ...mappedResults]);
      }
      
      setHasMore(mappedResults.length === 20);
    } catch (error) {
      console.error("Internet search failed:", error);
    } finally {
      setLoadingInternet(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        setPage(1);
        handleInternetSearch(search, 1);
      } else {
        setInternetResults([]);
        setHasMore(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, handleInternetSearch]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    handleInternetSearch(search, nextPage);
  };

  // Infinite scroll observer
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500) {
        if (hasMore && !loadingMore && !loadingInternet && search) {
          handleLoadMore();
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loadingInternet, search, page]);

  const handleUpdateStatus = async (bookId: string, status: 'reading' | 'completed' | 'wishlist') => {
    const updatedAt = isGuest ? new Date().toISOString() : serverTimestamp();
    const updateData = {
      status,
      progress: status === 'completed' ? 100 : 0,
      updatedAt,
    };

    if (isGuest && setBooks) {
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, ...updateData } as Book : b));
    } else {
      await updateDoc(doc(db, 'books', bookId), updateData);
    }
  };

  const filteredBooks = books.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const query = search.toLowerCase().trim();
    if (!query) return matchesFilter;
    
    const title = b.title.toLowerCase();
    const author = b.author.toLowerCase();
    
    // Smart matching: check if all words in query are present in title or author
    const queryWords = query.split(/\s+/);
    const matchesSearch = queryWords.every(word => title.includes(word) || author.includes(word));
    
    return matchesFilter && matchesSearch;
  });

  const handleDeleteBook = async (bookId: string) => {
    if (isGuest && setBooks) {
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } else {
      await deleteDoc(doc(db, 'books', bookId));
    }
  };

  const handleAddBook = async (bookData: any, status: 'reading' | 'wishlist' | 'completed') => {
    if (!isGuest && !auth.currentUser) return;
    setAdding(true);
    setSelectedBook(null);
    try {
      const newBook = {
        uid: isGuest ? 'guest' : auth.currentUser!.uid,
        title: bookData.title,
        author: bookData.author,
        coverUrl: bookData.coverUrl || '',
        category: bookData.category || 'General',
        status,
        progress: status === 'completed' ? 100 : 0,
        createdAt: isGuest ? new Date().toISOString() : serverTimestamp(),
        updatedAt: isGuest ? new Date().toISOString() : serverTimestamp(),
      };

      let bookId = '';
      if (isGuest && setBooks) {
        bookId = Math.random().toString(36).substr(2, 9);
        setBooks(prev => [{ ...newBook, id: bookId } as Book, ...prev]);
      } else {
        const docRef = await addDoc(collection(db, 'books'), newBook);
        bookId = docRef.id;
      }

      // Background AI Categorization
      if (!bookData.category) {
        (async () => {
          try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: `Categorize this book in one or two words: "${bookData.title}" by ${bookData.author}. Return ONLY the category name.`,
            });
            const category = response.text?.trim() || 'General';
            
            if (isGuest && setBooks) {
              setBooks(prev => prev.map(b => b.id === bookId ? { ...b, category } : b));
            } else {
              await updateDoc(doc(db, 'books', bookId), { category });
            }
          } catch (e) {
            console.error("Background AI categorization failed:", e);
          }
        })();
      }
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#2D2D2D]">Your Library</h1>
        <p className="text-[#8E8A84] mt-1">Manage your curated collection.</p>
      </header>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8A84]" />
          <input
            type="text"
            placeholder="Search titles or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#EAE6DF] border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#C25B2A] transition-all placeholder:text-[#8E8A84]"
          />
          {loadingInternet && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#C25B2A]" />}
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <FilterTab label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterTab label="Reading" active={filter === 'reading'} onClick={() => setFilter('reading')} />
        <FilterTab label="Completed" active={filter === 'completed'} onClick={() => setFilter('completed')} />
        <FilterTab label="Wishlist" active={filter === 'wishlist'} onClick={() => setFilter('wishlist')} />
      </div>

      <div className="space-y-8">
        {/* Library Section */}
        <section>
          {search && (
            <div className="flex items-center justify-between mb-4 ml-1">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84]">From Your Library</h2>
              <span className="text-[10px] font-bold text-[#C25B2A]">{filteredBooks.length} matches</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-[#EAE6DF] p-3 rounded-2xl shadow-sm flex flex-col relative group"
                >
                  <div className="aspect-[2/3] bg-[#D1CDC5] rounded-xl overflow-hidden mb-3 relative">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8E8A84]">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={book.status} />
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-[#2D2D2D] text-sm line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-[10px] text-[#8E8A84] font-medium mb-3">{book.author}</p>
                  
                  <div className="mt-auto flex flex-col gap-2">
                    {book.status === 'reading' && (
                      <button 
                        onClick={() => handleUpdateStatus(book.id, 'completed')}
                        className="w-full bg-[#C25B2A] text-white py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm hover:bg-[#A64D24] transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </button>
                    )}
                    {book.status === 'wishlist' && (
                      <button 
                        onClick={() => handleUpdateStatus(book.id, 'reading')}
                        className="w-full bg-[#C25B2A] text-white py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm hover:bg-[#A64D24] transition-all flex items-center justify-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        Start
                      </button>
                    )}
                    {book.category && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[8px] px-1.5 py-0.5 bg-[#D1CDC5] text-[#2D2D2D] rounded-full font-bold uppercase tracking-wider">
                          {book.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleDeleteBook(book.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Internet Section */}
        {search && (
          <section>
            <div className="flex items-center justify-between mb-4 ml-1">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84]">From Internet</h2>
              {internetResults.length > 0 && <span className="text-[10px] font-bold text-[#8E8A84]">{internetResults.length} loaded</span>}
            </div>
            <div className="space-y-4">
              {internetResults.length > 0 ? (
                <>
                  {internetResults.map((item) => {
                    const info = item.volumeInfo;
                    const cover = info.imageLinks?.thumbnail?.replace('http:', 'https:');
                    const alreadyInLibrary = books.some(b => b.title.toLowerCase() === info.title.toLowerCase());
                    if (alreadyInLibrary) return null;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedBook({ title: info.title, author: info.authors?.[0] || 'Unknown', coverUrl: cover })}
                        className="bg-[#EAE6DF] p-4 rounded-2xl flex gap-4 items-center shadow-sm cursor-pointer hover:bg-[#D1CDC5] transition-all group"
                      >
                        <div className="w-14 h-20 bg-[#D1CDC5] rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                          {cover ? (
                            <img src={cover} alt={info.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#8E8A84]">
                              <BookOpen className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-serif font-bold text-[#2D2D2D] text-sm line-clamp-1 group-hover:text-[#C25B2A] transition-colors">{info.title}</h3>
                          <p className="text-xs text-[#8E8A84]">{info.authors?.join(', ')}</p>
                        </div>
                        <Plus className="w-5 h-5 text-[#C25B2A] opacity-30 group-hover:opacity-100 transition-all" />
                      </motion.div>
                    );
                  })}
                  
                  {loadingMore && (
                    <div className="w-full py-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#8E8A84]">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading more results...
                    </div>
                  )}
                </>
              ) : !loadingInternet ? (
                <div className="text-center py-12 bg-[#EAE6DF] rounded-3xl border-2 border-dashed border-[#D1CDC5]">
                  <p className="text-[#8E8A84] text-sm italic">No internet intelligence found for "{search}".</p>
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>

      {filteredBooks.length === 0 && !search && (
        <div className="text-center py-20 bg-[#EAE6DF] rounded-3xl border-2 border-dashed border-[#D1CDC5] px-6">
          <p className="text-[#8E8A84] font-serif italic mb-4">
            Your library is empty.
          </p>
        </div>
      )}

      {/* Add Selection Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#F5F1EB] p-8 rounded-3xl shadow-2xl max-w-xs w-full text-center space-y-6"
            >
              <div className="w-20 h-28 bg-[#D1CDC5] rounded-xl overflow-hidden mx-auto shadow-lg">
                {selectedBook.coverUrl ? (
                  <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8E8A84]">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-[#2D2D2D] line-clamp-2">{selectedBook.title}</h3>
                <p className="text-sm text-[#8E8A84] mt-1">{selectedBook.author}</p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => handleAddBook(selectedBook, 'reading')}
                  className="w-full bg-[#C25B2A] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[#A64D24] transition-all"
                >
                  Start Reading
                </button>
                <button 
                  onClick={() => handleAddBook(selectedBook, 'wishlist')}
                  className="w-full bg-white text-[#C25B2A] py-3 rounded-xl font-bold text-sm border border-[#C25B2A] hover:bg-[#C25B2A]/5 transition-all"
                >
                  Add to Wishlist
                </button>
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="w-full text-[#8E8A84] py-2 text-xs font-bold uppercase tracking-widest hover:text-[#2D2D2D] transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {adding && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-xs w-full">
            <div className="w-16 h-16 bg-[#C25B2A]/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-[#C25B2A] animate-pulse" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2D2D2D]">AI Intelligence</h3>
            <p className="text-sm text-[#8E8A84]">Updating your intelligence tracker...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
        active ? "bg-[#C25B2A] text-white shadow-md" : "bg-[#EAE6DF] text-[#8E8A84] hover:bg-[#D1CDC5]"
      )}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const icons = {
    reading: BookOpen,
    completed: CheckCircle,
    wishlist: Bookmark
  };
  const Icon = icons[status as keyof typeof icons] || BookOpen;

  return (
    <div className="w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#C25B2A] shadow-sm">
      <Icon className="w-3 h-3" />
    </div>
  );
}
