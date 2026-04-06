import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Info, 
  Zap, 
  Eye, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { analyzeCausality, CausalInsight, CausalNode } from './services/geminiService';
import ReactMarkdown from 'react-markdown';

const NodeIcon = ({ type }: { type: CausalNode['type'] }) => {
  switch (type) {
    case 'cause': return <Zap className="w-5 h-5 text-amber-500" />;
    case 'condition': return <Info className="w-5 h-5 text-blue-500" />;
    case 'effect': return <ArrowRight className="w-5 h-5 text-emerald-500" />;
    case 'truth': return <Eye className="w-5 h-5 text-purple-500" />;
    default: return null;
  }
};

const TypeLabel = ({ type }: { type: CausalNode['type'] }) => {
  const labels = {
    cause: '原因 (Cause)',
    condition: '助缘 (Condition)',
    effect: '结果 (Effect)',
    truth: '真相 (Truth)'
  };
  return <span className="text-[10px] uppercase tracking-widest font-mono opacity-50">{labels[type]}</span>;
};

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<CausalInsight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const result = await analyzeCausality(input);
      setInsight(result);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError('洞察失败，请稍后再试。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 selection:bg-accent/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tighter mb-6 bg-gradient-to-b from-white to-stone-500 bg-clip-text text-transparent">
              因果洞察
            </h1>
            <p className="text-stone-400 font-light tracking-widest uppercase text-sm">
              Insight into the Truth of All Causality
            </p>
          </motion.div>
        </header>

        {/* Search Section */}
        <section className="mb-20">
          <motion.form 
            onSubmit={handleAnalyze}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-stone-900/50 border border-white/10 rounded-2xl p-2 backdrop-blur-sm">
              <Search className="ml-4 text-stone-500 w-5 h-5" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你想洞察的现象、事件或困惑..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 py-3 placeholder:text-stone-600"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-white text-black px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{loading ? '洞察中...' : '揭示真相'}</span>
              </button>
            </div>
          </motion.form>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-2 text-red-400 justify-center"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {insight && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-12"
            >
              {/* Summary Card */}
              <div className="bg-stone-900/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-accent rounded-full" />
                  <h2 className="text-2xl font-serif">因果综述</h2>
                </div>
                <p className="text-xl text-stone-300 leading-relaxed font-light italic">
                  "{insight.summary}"
                </p>
              </div>

              {/* Causal Chain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insight.nodes.map((node, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="group bg-stone-900/30 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all duration-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-stone-800/50 rounded-lg">
                        <NodeIcon type={node.type} />
                      </div>
                      <div className="flex flex-col items-end">
                        <TypeLabel type={node.type} />
                        <div className="flex gap-1 mt-1">
                          {[...Array(10)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1 h-3 rounded-full ${i < node.intensity ? 'bg-accent' : 'bg-stone-800'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2 group-hover:text-white transition-colors">
                      {node.title}
                    </h3>
                    <p className="text-stone-400 text-sm leading-relaxed">
                      {node.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Deep Truth */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-3xl p-10 text-center"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                <Eye className="w-12 h-12 text-purple-400 mx-auto mb-6 opacity-50" />
                <h2 className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-4 font-mono">核心真相 / Core Truth</h2>
                <p className="text-2xl md:text-3xl font-serif text-white leading-snug">
                  {insight.hiddenTruth}
                </p>
              </motion.div>

              {/* Future Trajectory */}
              <div className="bg-stone-900/40 border border-white/5 rounded-3xl p-8 md:p-12">
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-serif">未来演化</h2>
                </div>
                <div className="prose prose-invert prose-stone max-w-none">
                  <ReactMarkdown>{insight.futureTrajectory}</ReactMarkdown>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => {
                    setInsight(null);
                    setInput('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 text-stone-500 hover:text-white transition-colors group"
                >
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                  <span className="text-sm uppercase tracking-widest">重新洞察</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-40 text-center border-t border-white/5 pt-12">
          <p className="text-stone-600 text-xs tracking-widest uppercase mb-4">
            Causal Insight Engine • Powered by Gemini 3.1 Pro
          </p>
          <div className="flex justify-center gap-6 opacity-30">
             <div className="w-1 h-1 bg-white rounded-full" />
             <div className="w-1 h-1 bg-white rounded-full" />
             <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </footer>
      </main>
    </div>
  );
}
