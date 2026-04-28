import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Search, Plus, BookOpen, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Book } from '../../types';

interface AddBookProps {
  onComplete: () => void;
  isGuest?: boolean;
  setBooks?: React.Dispatch<React.SetStateAction<Book[]>>;
  initialQuery?: string;
}

export default function AddBook({ onComplete, isGuest, setBooks, initialQuery, books = [] }: AddBookProps & { books?: Book[] }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  const [manualBook, setManualBook] = useState({
    title: '',
    author: '',
    status: 'reading' as 'reading' | 'completed' | 'wishlist',
    category: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setPage(1);
        handleSearch(searchQuery, 1);
      } else {
        setSearchResults([]);
        setHasMore(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (queryToSearch: string, pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
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
        setSearchResults(mappedResults);
      } else {
        setSearchResults(prev => [...prev, ...mappedResults]);
      }

      setHasMore(mappedResults.length === 20);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    handleSearch(searchQuery, nextPage);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500) {
        if (hasMore && !loadingMore && !loading && searchQuery) {
          handleLoadMore();
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, loading, searchQuery, page]);

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

      // Background AI Categorization via OpenRouter
      if (!bookData.category) {
        (async () => {
          try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Curator App"
              },
              body: JSON.stringify({
                model: "google/gemma-3-4b-it:free",
                messages: [{
                  role: "user",
                  content: `Categorize this book in one or two words: "${bookData.title}" by ${bookData.author}. Return ONLY the category name, nothing else.`
                }]
              })
            });

            if (response.ok) {
              const json = await response.json();
              const category = json.choices?.[0]?.message?.content?.trim() || 'General';

              if (isGuest && setBooks) {
                setBooks(prev => prev.map(b => b.id === bookId ? { ...b, category } : b));
              } else {
                await updateDoc(doc(db, 'books', bookId), { category });
              }
            }
          } catch (e) {
            console.error("Background AI categorization failed:", e);
          }
        })();
      }

      onComplete();
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setAdding(false);
    }
  };

  const libraryResults = books.filter(b => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;
    const title = b.title.toLowerCase();
    const author = b.author.toLowerCase();
    const queryWords = query.split(/\s+/);
    return queryWords.every(word => title.includes(word) || author.includes(word));
  });

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D2D2D]">Intelligence Search</h1>
          <p className="text-[#8E8A84] mt-1">Search your library and the world.</p>
        </div>
        <button
          onClick={() => setManualMode(!manualMode)}
          className="text-xs font-bold uppercase tracking-wider text-[#C25B2A] hover:underline"
        >
          {manualMode ? 'Search Mode' : 'Manual Add'}
        </button>
      </header>

      {!manualMode ? (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8A84]" />
            <input
              type="text"
              placeholder="Start typing to search library & internet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#EAE6DF] border-none rounded-2xl py-4 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#C25B2A] transition-all placeholder:text-[#8E8A84]"
            />
            {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#C25B2A]" />}
          </div>

          <div className="space-y-8">
            {libraryResults.length > 0 && searchQuery && (
              <section>
                <div className="flex items-center justify-between mb-4 ml-1">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84]">From Your Library</h2>
                  <span className="text-[10px] font-bold text-[#C25B2A]">{libraryResults.length} matches</span>
                </div>
                <div className="space-y-3">
                  {libraryResults.map((book) => (
                    <div key={book.id} className="bg-[#EAE6DF] p-4 rounded-2xl flex gap-4 items-center shadow-sm border border-[#D1CDC5]/30">
                      <div className="w-10 h-14 bg-[#D1CDC5] rounded-lg overflow-hidden flex-shrink-0">
                        {book.coverUrl && <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-serif font-bold text-[#2D2D2D] text-sm line-clamp-1">{book.title}</h3>
                        <p className="text-xs text-[#8E8A84]">{book.author}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] px-2 py-0.5 bg-[#C25B2A]/10 text-[#C25B2A] rounded-full font-bold uppercase tracking-wider">In Library</span>
                        <span className="text-[8px] font-bold text-[#8E8A84] uppercase tracking-widest">{book.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              {searchQuery && (
                <div className="flex items-center justify-between mb-4 ml-1">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84]">From Internet</h2>
                  {searchResults.length > 0 && <span className="text-[10px] font-bold text-[#8E8A84]">{searchResults.length} loaded</span>}
                </div>
              )}
              <div className="space-y-4">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((item) => {
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
                ) : searchQuery && !loading ? (
                  <div className="text-center py-12 bg-[#EAE6DF] rounded-3xl border-2 border-dashed border-[#D1CDC5]">
                    <p className="text-[#8E8A84] text-sm italic">No intelligence found for "{searchQuery}".<br />Try a different query or add manually.</p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#EAE6DF] p-6 rounded-2xl space-y-4"
        >
          <InputField label="Title" value={manualBook.title} onChange={(v) => setManualBook({ ...manualBook, title: v })} />
          <InputField label="Author" value={manualBook.author} onChange={(v) => setManualBook({ ...manualBook, author: v })} />

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84] ml-1">Status</label>
            <div className="flex gap-2">
              <StatusBtn label="Reading" active={manualBook.status === 'reading'} onClick={() => setManualBook({ ...manualBook, status: 'reading' })} />
              <StatusBtn label="Completed" active={manualBook.status === 'completed'} onClick={() => setManualBook({ ...manualBook, status: 'completed' })} />
              <StatusBtn label="Wishlist" active={manualBook.status === 'wishlist'} onClick={() => setManualBook({ ...manualBook, status: 'wishlist' })} />
            </div>
          </div>

          <button
            onClick={() => handleAddBook(manualBook, manualBook.status)}
            disabled={adding || !manualBook.title || !manualBook.author}
            className="w-full bg-[#C25B2A] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#A64D24] transition-colors disabled:opacity-50 mt-4"
          >
            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Add to Library
          </button>
        </motion.div>
      )}

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

function InputField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84] ml-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#C25B2A] transition-all"
      />
    </div>
  );
}

function StatusBtn({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-grow py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
        active ? "bg-[#C25B2A] text-white shadow-sm" : "bg-white/50 text-[#8E8A84] hover:bg-white"
      )}
    >
      {label}
    </button>
  );
}