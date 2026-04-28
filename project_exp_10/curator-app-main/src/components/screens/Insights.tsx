import { useState, useEffect } from 'react';
import { Book } from '../../types';
import { Target, Zap, Lightbulb, User, TrendingUp, Loader2, BookOpen, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface InsightsProps {
  books: Book[];
}

interface InsightData {
  personality: {
    name: string;
    description: string;
    strengths: string;
    weaknesses: string;
    imagePrompt: string;
  };
  disciplineScore: number;
  monthlyInsights: string[];
  suggestions: string[];
}

export default function Insights({ books }: InsightsProps) {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    if (books.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const bookData = books.map(b => ({
        title: b.title,
        author: b.author,
        category: b.category,
        status: b.status,
        progress: b.progress,
        updatedAt: b.updatedAt
      }));

      const prompt = `Analyze this reading library: ${JSON.stringify(bookData)}. 
      Generate genuine reading insights. 
      Return a JSON object with exactly these fields:
      {
        "personality": { 
          "name": string, 
          "description": string, 
          "strengths": string, 
          "weaknesses": string, 
          "imagePrompt": string 
        },
        "disciplineScore": number between 0 and 100,
        "monthlyInsights": [string, string, string],
        "suggestions": [string, string, string]
      }
      Return ONLY the JSON object, no markdown, no extra text.
      Make it feel premium, intellectual, and highly personalized.`;

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
          messages: [{ role: "user", content: prompt }],
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("OpenRouter error:", errText);
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();
      const raw = json.choices?.[0]?.message?.content || '{}';
      // Strip markdown code blocks if present
      const text = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(text);

      if (!result.personality || !result.monthlyInsights || !result.suggestions) {
        throw new Error("Incomplete response from AI");
      }

      setData(result);
      localStorage.setItem('cachedInsights', JSON.stringify(result));
      localStorage.setItem('insightsTimestamp', Date.now().toString());
    } catch (err) {
      console.error("Failed to generate insights:", err);
      setError("The intelligence engine is currently recalibrating. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('cachedInsights');
    const timestamp = localStorage.getItem('insightsTimestamp');
    const isExpired = timestamp && (Date.now() - parseInt(timestamp)) > 1000 * 60 * 60 * 24;

    if (cached && !isExpired) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.personality && parsed.monthlyInsights && parsed.suggestions) {
          setData(parsed);
        } else {
          generateInsights();
        }
      } catch {
        generateInsights();
      }
    } else if (books.length > 0) {
      generateInsights();
    }
  }, [books]);

  if (books.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto pb-24 min-h-[80vh] flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#EAE6DF] p-12 rounded-[3rem] border border-[#D1CDC5]/30 shadow-sm space-y-6"
        >
          <div className="w-20 h-20 bg-[#C25B2A]/10 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-[#C25B2A]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-[#2D2D2D]">Your Journey Awaits</h2>
            <p className="text-[#8E8A84] text-sm leading-relaxed max-w-xs mx-auto">
              "A room without books is like a body without a soul." — Cicero
            </p>
          </div>
          <p className="text-xs text-[#6B6B6B] italic">
            Add your first book to begin the intelligence analysis.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-add'))}
            className="bg-[#C25B2A] text-white px-8 py-3 rounded-2xl font-semibold shadow-md hover:bg-[#A64D24] transition-all"
          >
            Curate Your First Book
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto pb-24">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2D2D2D]">Intelligence Insights</h1>
          <p className="text-[#8E8A84] mt-1">A refined analysis of your intellectual growth.</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="p-2 text-[#8E8A84] hover:text-[#C25B2A] transition-colors disabled:opacity-30"
          title="Refresh Insights"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </header>

      <AnimatePresence mode="wait">
        {loading && !data ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center gap-4"
          >
            <Loader2 className="w-10 h-10 animate-spin text-[#C25B2A]" />
            <p className="text-sm font-serif italic text-[#8E8A84]">Synthesizing your reading patterns...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            className="bg-red-50 p-8 rounded-3xl text-center border border-red-100"
          >
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button
              onClick={generateInsights}
              className="mt-4 text-xs font-bold uppercase tracking-widest text-red-700 underline"
            >
              Retry Analysis
            </button>
          </motion.div>
        ) : data ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Reading Personality Card */}
            <section className="bg-[#EAE6DF] p-8 rounded-[2rem] shadow-sm border border-[#D1CDC5]/30 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-[#C25B2A] rounded-2xl flex items-center justify-center text-white shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8A84]">Reader Personality</span>
                  <h2 className="text-xl font-serif font-bold text-[#2D2D2D]">{data.personality.name}</h2>
                </div>
              </div>

              <p className="text-[#6B6B6B] leading-relaxed mb-6 text-sm relative z-10">
                {data.personality.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-white/40 p-4 rounded-2xl">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#C25B2A] mb-1">Strengths</h4>
                  <p className="text-[11px] text-[#2D2D2D] leading-tight">{data.personality.strengths}</p>
                </div>
                <div className="bg-white/40 p-4 rounded-2xl">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8E8A84] mb-1">Weaknesses</h4>
                  <p className="text-[11px] text-[#2D2D2D] leading-tight">{data.personality.weaknesses}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D1CDC5] relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-[#C25B2A]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#8E8A84]">Aesthetic Prompt</span>
                </div>
                <p className="text-[10px] italic text-[#8E8A84] bg-white/20 p-3 rounded-lg leading-tight">
                  {data.personality.imagePrompt}
                </p>
              </div>

              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C25B2A]/5 to-transparent rounded-full blur-3xl -z-0" />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discipline Score Card */}
              <section className="bg-[#EAE6DF] p-8 rounded-[2rem] shadow-sm border border-[#D1CDC5]/30 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-6 self-start">
                  <Target className="w-4 h-4 text-[#C25B2A]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8A84]">Discipline Score</span>
                </div>

                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#D1CDC5]" />
                    <circle
                      cx="64" cy="64" r="58"
                      stroke="currentColor" strokeWidth="8" fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * data.disciplineScore) / 100}
                      className="text-[#C25B2A] transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-serif font-bold text-[#2D2D2D]">{data.disciplineScore}</span>
                    <span className="text-[8px] font-bold text-[#8E8A84] uppercase tracking-widest">Consistency</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#8E8A84] leading-tight">
                  {data.disciplineScore > 70 ? "Your reading habits are exceptionally consistent." : "Consistency is the key to intellectual growth."}
                </p>
              </section>

              {/* Monthly Insights Card */}
              <section className="bg-[#EAE6DF] p-8 rounded-[2rem] shadow-sm border border-[#D1CDC5]/30">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-4 h-4 text-[#C25B2A]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8A84]">Monthly Insights</span>
                </div>
                <div className="space-y-4">
                  {data.monthlyInsights.map((insight, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C25B2A] mt-1.5 shrink-0" />
                      <p className="text-xs text-[#6B6B6B] leading-snug">{insight}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Suggestions Card */}
            <section className="bg-[#C25B2A] p-8 rounded-[2rem] shadow-lg text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <Lightbulb className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Strategic Suggestions</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.suggestions.map((suggestion, i) => (
                    <div key={i} className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] font-bold opacity-50 mb-2 block">0{i + 1}</span>
                      <p className="text-xs leading-relaxed font-medium">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}