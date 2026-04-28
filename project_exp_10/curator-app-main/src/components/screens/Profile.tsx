import { useState, useMemo, useRef } from 'react';
import { UserProfile, Book, Quote } from '../../types';
import { LogOut, Target, Share2, ChevronRight, BarChart3, Edit2, Check, X, Camera, BookOpen, BookMarked, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ProfileProps {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isGuest?: boolean;
  books: Book[];
  quotes: Quote[];
  onLogout: () => void;
}

type GoalPeriod = 'weekly' | 'monthly' | 'yearly';

export default function Profile({ profile, setProfile, isGuest, books, quotes, onLogout }: ProfileProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod>('monthly');
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [tempName, setTempName] = useState(profile?.displayName || 'Curator');
  const [tempPhoto, setTempPhoto] = useState(profile?.photoURL || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempGoals, setTempGoals] = useState({
    weekly: profile?.goals?.weekly || 1,
    monthly: profile?.goals?.monthly || 4,
    yearly: profile?.goals?.yearly || 50
  });

  const stats = useMemo(() => {
    const completed = books.filter(b => b.status === 'completed').length;
    const reading = books.filter(b => b.status === 'reading').length;
    const wishlist = books.filter(b => b.status === 'wishlist').length;
    const total = books.length;

    // Top categories
    const catCount: Record<string, number> = {};
    books.forEach(b => { if (b.category) catCount[b.category] = (catCount[b.category] || 0) + 1; });
    const topCategories = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);

    return { completed, reading, wishlist, total, topCategories };
  }, [books]);

  const goalData = useMemo(() => {
    const completedBooks = books.filter(b => b.status === 'completed');
    const now = new Date();
    let count = 0, target = 0;

    if (selectedPeriod === 'weekly') {
      target = profile?.goals?.weekly || 1;
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      count = completedBooks.filter(b => {
        const date = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
        return date >= oneWeekAgo;
      }).length;
    } else if (selectedPeriod === 'monthly') {
      target = profile?.goals?.monthly || 4;
      count = completedBooks.filter(b => {
        const date = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;
    } else {
      target = profile?.goals?.yearly || 50;
      count = completedBooks.filter(b => {
        const date = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
        return date.getFullYear() === now.getFullYear();
      }).length;
    }

    return { count, target, progress: Math.min(100, (count / target) * 100) };
  }, [books, profile, selectedPeriod]);

  const chartData = useMemo(() => {
    const completedBooks = books.filter(b => b.status === 'completed');
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        name: months[d.getMonth()],
        count: completedBooks.filter(b => {
          const date = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
          return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
        }).length
      };
    });
  }, [books]);

  const handleSaveGoals = async () => {
    if (!profile) return;
    setProfile({ ...profile, goals: tempGoals });
    setIsEditingGoals(false);
    if (!isGuest) {
      try { await updateDoc(doc(db, 'users', profile.uid), { goals: tempGoals }); }
      catch (e) { console.error(e); }
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setProfile({ ...profile, displayName: tempName, photoURL: tempPhoto });
    setIsEditingProfile(false);
    if (!isGuest) {
      try { await updateDoc(doc(db, 'users', profile.uid), { displayName: tempName, photoURL: tempPhoto }); }
      catch (e) { console.error(e); }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <header className="mb-8 flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 bg-[#C25B2A] rounded-full flex items-center justify-center text-white text-3xl font-serif font-bold shadow-lg overflow-hidden border-4 border-white">
            {tempPhoto || profile?.photoURL ? (
              <img src={tempPhoto || profile?.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span>{tempName?.[0] || 'C'}</span>
            )}
          </div>
          {isEditingProfile && (
            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6" />
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </div>

        <div className="flex-1">
          {!isEditingProfile ? (
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#2D2D2D]">{profile?.displayName || 'Curator'}</h1>
                <p className="text-[#8E8A84] text-sm">{profile?.email}</p>
              </div>
              <button onClick={() => setIsEditingProfile(true)} className="p-1.5 bg-[#EAE6DF] rounded-lg text-[#8E8A84] hover:text-[#C25B2A] transition-all">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-white border-none rounded-xl py-2 px-4 text-sm font-bold text-[#2D2D2D] focus:ring-2 focus:ring-[#C25B2A] shadow-sm" />
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} className="flex-1 bg-[#C25B2A] text-white py-2 rounded-xl text-xs font-bold shadow-md">Save</button>
                <button onClick={() => { setIsEditingProfile(false); setTempName(profile?.displayName || 'Curator'); setTempPhoto(profile?.photoURL || ''); }} className="px-4 bg-[#D1CDC5] text-[#2D2D2D] py-2 rounded-xl text-xs font-bold">Cancel</button>
              </div>
            </div>
          )}
          {profile?.uid === 'guest' && !isEditingProfile && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#D1CDC5] text-[#2D2D2D] text-[10px] font-bold uppercase tracking-wider rounded">Local Guest</span>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BookOpen, label: 'Reading', value: stats.reading, color: 'text-blue-500' },
            { icon: Check, label: 'Completed', value: stats.completed, color: 'text-green-500' },
            { icon: Heart, label: 'Wishlist', value: stats.wishlist, color: 'text-pink-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-[#EAE6DF] p-4 rounded-2xl text-center shadow-sm">
              <Icon className={cn("w-5 h-5 mx-auto mb-1", color)} />
              <p className="text-2xl font-serif font-bold text-[#2D2D2D]">{value}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#8E8A84]">{label}</p>
            </div>
          ))}
        </div>

        {/* Goal Card */}
        <section className="bg-[#EAE6DF] p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C25B2A]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#2D2D2D]">Reading Goal</h2>
            </div>
            <div className="flex items-center gap-2">
              {!isEditingGoals ? (
                <button onClick={() => setIsEditingGoals(true)} className="p-1.5 bg-[#D1CDC5] rounded-lg text-[#8E8A84] hover:text-[#C25B2A] transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex gap-1">
                  <button onClick={handleSaveGoals} className="p-1.5 bg-[#C25B2A] rounded-lg text-white"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setIsEditingGoals(false)} className="p-1.5 bg-[#D1CDC5] rounded-lg text-[#8E8A84]"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
              <div className="flex bg-[#D1CDC5] p-1 rounded-xl">
                {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                  <button key={p} onClick={() => setSelectedPeriod(p)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all", selectedPeriod === p ? "bg-white text-[#C25B2A] shadow-sm" : "text-[#8E8A84]")}>{p}</button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isEditingGoals ? (
              <motion.div key={selectedPeriod} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-4xl font-serif font-bold text-[#2D2D2D]">{goalData.count}</span>
                    <span className="text-[#8E8A84] ml-2 text-sm">/ {goalData.target} books</span>
                  </div>
                  <span className="text-sm font-bold text-[#C25B2A]">{Math.round(goalData.progress)}%</span>
                </div>
                <div className="h-3 bg-[#D1CDC5] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${goalData.progress}%` }} transition={{ duration: 0.5 }} className="h-full bg-[#C25B2A]" />
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-3 gap-3">
                {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                  <div key={p} className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#8E8A84] block text-center">{p}</label>
                    <input type="number" value={tempGoals[p]} onChange={(e) => setTempGoals({ ...tempGoals, [p]: parseInt(e.target.value) || 0 })} className="w-full bg-white border-none rounded-xl py-2 px-3 text-sm text-center font-bold text-[#2D2D2D] focus:ring-2 focus:ring-[#C25B2A]" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Reading Trends Chart */}
        <section className="bg-[#EAE6DF] p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[#C25B2A]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#2D2D2D]">Reading Trends</h2>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D1CDC5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8A84', fontSize: 10, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8E8A84', fontSize: 10, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: '#D1CDC5', opacity: 0.4 }} contentStyle={{ backgroundColor: '#F5F1EB', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#2D2D2D' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#C25B2A' : '#D1CDC5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84] text-center mt-4">Completed Books (Last 6 Months)</p>
        </section>

        <section className="space-y-3">
          <MenuButton icon={Share2} label="Share My Library Card" onClick={() => setShowShareCard(true)} />
          <MenuButton icon={LogOut} label="Sign Out" onClick={onLogout} danger />
        </section>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8A84] opacity-50">Curator v1.0 — Your Reading Sanctuary</p>
      </footer>

      {/* Share Card Modal */}
      <AnimatePresence>
        {showShareCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm space-y-4"
            >
              {/* The actual share card */}
              <div className="bg-gradient-to-br from-[#2D2D2D] to-[#1a1a1a] p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#C25B2A]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C25B2A]/10 rounded-full blur-2xl" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#C25B2A] rounded-2xl flex items-center justify-center shadow-lg">
                      <BookMarked className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C25B2A]">Curator</p>
                      <h2 className="text-lg font-serif font-bold">{profile?.displayName || 'Reader'}</h2>
                    </div>
                  </div>

                  {/* Big stat */}
                  <div className="mb-6">
                    <p className="text-6xl font-serif font-bold text-white">{stats.total}</p>
                    <p className="text-sm text-white/60 uppercase tracking-widest font-bold">Books Curated</p>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Read', value: stats.completed },
                      { label: 'Reading', value: stats.reading },
                      { label: 'Wishlist', value: stats.wishlist },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/10 p-3 rounded-xl text-center backdrop-blur-sm">
                        <p className="text-xl font-serif font-bold">{value}</p>
                        <p className="text-[9px] uppercase tracking-wider text-white/60">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quotes count */}
                  {quotes.length > 0 && (
                    <div className="bg-[#C25B2A]/20 p-3 rounded-xl mb-4 flex items-center gap-2">
                      <span className="text-[#C25B2A] text-lg">"</span>
                      <p className="text-xs text-white/80 font-medium">{quotes.length} quote{quotes.length !== 1 ? 's' : ''} collected</p>
                    </div>
                  )}

                  {/* Top categories */}
                  {stats.topCategories.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Top Genres</p>
                      <div className="flex flex-wrap gap-2">
                        {stats.topCategories.map(cat => (
                          <span key={cat} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white/80 backdrop-blur-sm">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">curator.app • {new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>

              <p className="text-white/70 text-xs text-center">📸 Take a screenshot to share this card!</p>

              <button
                onClick={() => setShowShareCard(false)}
                className="w-full bg-white/20 text-white py-3 rounded-2xl font-bold text-sm backdrop-blur-sm hover:bg-white/30 transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick, danger, disabled }: { icon: any, label: string, onClick: () => void, danger?: boolean, disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={cn("w-full flex items-center justify-between p-5 rounded-2xl transition-all", danger ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-[#EAE6DF] text-[#2D2D2D] hover:bg-[#D1CDC5]", disabled && "opacity-50 cursor-not-allowed")}>
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-30" />
    </button>
  );
}

