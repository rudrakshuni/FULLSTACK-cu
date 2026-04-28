import { Book, UserProfile } from '../../types';
import { CheckCircle, BookOpen, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface DashboardProps {
  books: Book[];
  profile: UserProfile | null;
  isGuest?: boolean;
  setBooks?: React.Dispatch<React.SetStateAction<Book[]>>;
}

export default function Dashboard({ books, profile, isGuest, setBooks }: DashboardProps) {
  const currentlyReading = books.filter(b => b.status === 'reading');
  const completed = books.filter(b => b.status === 'completed');
  
  const totalRead = completed.length;
  const monthlyGoal = profile?.goals?.monthly || 4;
  const monthlyProgress = (completed.filter(b => {
    const date = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
    return date.getMonth() === new Date().getMonth();
  }).length / monthlyGoal) * 100;

  const handleUpdateProgress = async (bookId: string, newProgress: number) => {
    const isCompleted = newProgress >= 100;
    const status: 'reading' | 'completed' = isCompleted ? 'completed' : 'reading';
    const updatedAt = isGuest ? new Date().toISOString() : serverTimestamp();
    
    const updateData = {
      progress: Math.min(100, newProgress),
      status,
      updatedAt,
    };

    if (isGuest && setBooks) {
      setBooks(prev => prev.map(b => b.id === bookId ? { ...b, ...updateData } as Book : b));
    } else {
      await updateDoc(doc(db, 'books', bookId), updateData);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (isGuest && setBooks) {
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } else {
      await deleteDoc(doc(db, 'books', bookId));
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#2D2D2D]">Good Morning, {profile?.displayName || 'Curator'}</h1>
        <p className="text-[#8E8A84] mt-1">Your library is waiting for your next insight.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard 
          label="Total Read" 
          value={totalRead.toString()} 
          icon={CheckCircle}
          color="bg-[#EAE6DF]"
        />
        <StatCard 
          label="Monthly Goal" 
          value={`${Math.min(100, Math.round(monthlyProgress))}%`} 
          icon={BookOpen}
          color="bg-[#EAE6DF]"
        />
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif font-semibold text-[#2D2D2D]">Currently Reading</h2>
            <span className="text-sm text-[#C25B2A] font-medium">{currentlyReading.length} Books</span>
          </div>

          {currentlyReading.length > 0 ? (
            <div className="space-y-4">
              {currentlyReading.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#EAE6DF] p-4 rounded-2xl flex gap-4 items-center shadow-sm relative group"
                >
                  <div className="w-16 h-24 bg-[#D1CDC5] rounded-lg overflow-hidden flex-shrink-0">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8E8A84]">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-serif font-bold text-[#2D2D2D] line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-[#8E8A84]">{book.author}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdateProgress(book.id, (book.progress || 0) + 10)}
                      className="px-3 py-2 bg-white rounded-xl flex items-center justify-center text-[#C25B2A] shadow-sm hover:bg-[#C25B2A] hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Progress
                    </button>
                    <button 
                      onClick={() => handleUpdateProgress(book.id, 100)}
                      className="px-3 py-2 bg-[#C25B2A] rounded-xl flex items-center justify-center text-white shadow-sm hover:bg-[#A64D24] transition-all text-[10px] font-bold uppercase tracking-wider gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Complete
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDeleteBook(book.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#EAE6DF] p-8 rounded-2xl text-center border-2 border-dashed border-[#D1CDC5]">
              <p className="text-[#8E8A84]">No books in progress. Start a new journey!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className={cn("p-5 rounded-2xl shadow-sm", color)}>
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-[#C25B2A]" />
      </div>
      <div className="text-2xl font-serif font-bold text-[#2D2D2D]">{value}</div>
      <div className="text-xs text-[#8E8A84] uppercase tracking-wider font-medium mt-1">{label}</div>
    </div>
  );
}
