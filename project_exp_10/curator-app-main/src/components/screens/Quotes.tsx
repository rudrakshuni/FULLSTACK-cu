import { useState } from 'react';
import { Book, Quote, UserProfile } from '../../types';
import { Quote as QuoteIcon, Plus, Trash2, BookOpen, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface QuotesProps {
  books: Book[];
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  isGuest?: boolean;
  profile: UserProfile | null;
}

export default function Quotes({ books, quotes, setQuotes, isGuest, profile }: QuotesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterBookId, setFilterBookId] = useState('all');

  const booksWithQuotes = books;

  const filteredQuotes = filterBookId === 'all'
    ? quotes
    : quotes.filter(q => q.bookId === filterBookId);

  const handleAddQuote = async () => {
    if (!quoteText.trim() || !selectedBookId) return;
    setSaving(true);

    const selectedBook = books.find(b => b.id === selectedBookId);
    if (!selectedBook) return;

    const newQuote: Omit<Quote, 'id'> = {
      uid: isGuest ? 'guest' : (profile?.uid || 'guest'),
      bookId: selectedBookId,
      bookTitle: selectedBook.title,
      bookAuthor: selectedBook.author,
      text: quoteText.trim(),
      note: noteText.trim() || undefined,
      createdAt: isGuest ? new Date().toISOString() : serverTimestamp()
    };

    try {
      if (isGuest) {
        const id = Math.random().toString(36).substr(2, 9);
        setQuotes(prev => [{ ...newQuote, id } as Quote, ...prev]);
      } else {
        const docRef = await addDoc(collection(db, 'quotes'), newQuote);
        // onSnapshot in App.tsx will update quotes automatically
      }
      setQuoteText('');
      setNoteText('');
      setSelectedBookId('');
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to save quote:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      if (isGuest) {
        setQuotes(prev => prev.filter(q => q.id !== quoteId));
      } else {
        await deleteDoc(doc(db, 'quotes', quoteId));
      }
    } catch (err) {
      console.error("Failed to delete quote:", err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D2D2D]">Quotes & Notes</h1>
          <p className="text-[#8E8A84] mt-1">Words that stayed with you.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 bg-[#C25B2A] rounded-2xl flex items-center justify-center text-white shadow-md hover:bg-[#A64D24] transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Filter by book */}
      {quotes.length > 0 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilterBookId('all')}
            className={cn(
              "shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
              filterBookId === 'all' ? "bg-[#C25B2A] text-white shadow-sm" : "bg-[#EAE6DF] text-[#8E8A84]"
            )}
          >
            All ({quotes.length})
          </button>
          {[...new Map(quotes.map(q => [q.bookId, q])).values()].map(q => (
            <button
              key={q.bookId}
              onClick={() => setFilterBookId(q.bookId)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all max-w-[140px] truncate",
                filterBookId === q.bookId ? "bg-[#C25B2A] text-white shadow-sm" : "bg-[#EAE6DF] text-[#8E8A84]"
              )}
            >
              {q.bookTitle}
            </button>
          ))}
        </div>
      )}

      {/* Quotes Feed */}
      {filteredQuotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#EAE6DF] p-12 rounded-[3rem] border border-[#D1CDC5]/30 shadow-sm space-y-6 text-center mt-8"
        >
          <div className="w-20 h-20 bg-[#C25B2A]/10 rounded-full flex items-center justify-center mx-auto">
            <QuoteIcon className="w-10 h-10 text-[#C25B2A]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#2D2D2D]">No Quotes Yet</h2>
            <p className="text-[#8E8A84] text-sm leading-relaxed max-w-xs mx-auto">
              Capture words that moved you, inspired you, or made you think.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#C25B2A] text-white px-8 py-3 rounded-2xl font-semibold shadow-md hover:bg-[#A64D24] transition-all"
          >
            Add Your First Quote
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredQuotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#EAE6DF] p-6 rounded-[2rem] shadow-sm border border-[#D1CDC5]/30 relative group"
              >
                {/* Quote mark */}
                <div className="absolute top-4 left-5 text-[#C25B2A]/20 text-6xl font-serif leading-none select-none">"</div>

                <div className="relative z-10">
                  <p className="text-[#2D2D2D] font-serif text-base leading-relaxed mb-4 pt-4 pl-2">
                    {quote.text}
                  </p>

                  {quote.note && (
                    <div className="bg-white/40 p-3 rounded-xl mb-4">
                      <p className="text-[11px] text-[#6B6B6B] italic leading-snug">
                        📝 {quote.note}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#C25B2A]/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-3 h-3 text-[#C25B2A]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#2D2D2D] leading-none">{quote.bookTitle}</p>
                        <p className="text-[9px] text-[#8E8A84]">{quote.bookAuthor}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteQuote(quote.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-[#8E8A84] hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Quote Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-end justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-[#F5F1EB] p-6 rounded-[2rem] shadow-2xl w-full max-w-lg space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-serif font-bold text-[#2D2D2D]">Add Quote or Note</h3>
                <button
                  onClick={() => { setShowAddModal(false); setQuoteText(''); setNoteText(''); setSelectedBookId(''); }}
                  className="p-2 text-[#8E8A84] hover:text-[#2D2D2D] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Book selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84] ml-1">From Book</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full bg-[#EAE6DF] border-none rounded-xl py-3 px-4 text-sm text-[#2D2D2D] focus:ring-2 focus:ring-[#C25B2A] transition-all"
                >
                  <option value="">Select a book...</option>
                  {booksWithQuotes.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} — {book.author}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quote text */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84] ml-1">Quote / Passage</label>
                <textarea
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="Type or paste the quote here..."
                  rows={4}
                  className="w-full bg-[#EAE6DF] border-none rounded-xl py-3 px-4 text-sm text-[#2D2D2D] focus:ring-2 focus:ring-[#C25B2A] transition-all resize-none font-serif"
                />
              </div>

              {/* Note */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84] ml-1">Your Note <span className="normal-case font-normal">(optional)</span></label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Why did this resonate with you?"
                  rows={2}
                  className="w-full bg-[#EAE6DF] border-none rounded-xl py-3 px-4 text-sm text-[#2D2D2D] focus:ring-2 focus:ring-[#C25B2A] transition-all resize-none"
                />
              </div>

              <button
                onClick={handleAddQuote}
                disabled={saving || !quoteText.trim() || !selectedBookId}
                className="w-full bg-[#C25B2A] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#A64D24] transition-all disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                Save Quote
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}