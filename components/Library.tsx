
import React, { useState, useEffect } from 'react';
import { CONFESSIONS } from '../constants';
import { Confession } from '../types';
import { Book, Calendar, Users, ArrowRight, ChevronDown, RotateCcw, Search, Bookmark, Check, CloudDownload, Loader2 } from 'lucide-react';
import { saveItem, isItemSaved, removeItem, getSavedItems } from '../services/storageService';
import { getGeminiClient } from '../services/geminiService';
import { motion, Variants } from 'framer-motion';

interface LibraryProps {
  onSelectConfession: (confession: Confession) => void;
}

const SkeletonCard = () => (
  // ... (unchanged)
  <div className="bg-white dark:bg-reformed-900 rounded-lg shadow-sm border border-reformed-200 dark:border-reformed-800 overflow-hidden flex flex-col h-full animate-pulse">
    <div className="bg-reformed-50 dark:bg-reformed-800 p-6 border-b border-reformed-200 dark:border-reformed-700">
      <div className="h-7 bg-reformed-200 dark:bg-reformed-700 rounded w-3/4 mb-3"></div>
      <div className="flex items-center space-x-4">
        <div className="h-4 bg-reformed-100 dark:bg-reformed-700 rounded w-24"></div>
        <div className="h-4 bg-reformed-100 dark:bg-reformed-700 rounded w-24"></div>
      </div>
    </div>
    <div className="p-6 flex-grow flex flex-col justify-between">
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-reformed-100 dark:bg-reformed-800 rounded w-full"></div>
        <div className="h-4 bg-reformed-100 dark:bg-reformed-800 rounded w-full"></div>
        <div className="h-4 bg-reformed-100 dark:bg-reformed-800 rounded w-5/6"></div>
      </div>
      <div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-reformed-100 dark:bg-reformed-800 rounded-full w-16"></div>
          <div className="h-6 bg-reformed-100 dark:bg-reformed-800 rounded-full w-20"></div>
          <div className="h-6 bg-reformed-100 dark:bg-reformed-800 rounded-full w-12"></div>
        </div>
        <div className="h-5 bg-reformed-200 dark:bg-reformed-700 rounded w-32"></div>
      </div>
    </div>
  </div>
);

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
};

export const Library: React.FC<LibraryProps> = ({ onSelectConfession }) => {
  const [displayCount, setDisplayCount] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [offlineIds, setOfflineIds] = useState<string[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate network delay for a polished experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    const refreshStore = () => {
      const items = getSavedItems();
      setSavedIds(items.filter(i => i.type === 'confession').map(i => i.refId));
      setOfflineIds(items.filter(i => i.isOffline).map(i => i.refId));
    };

    refreshStore();
    return () => clearTimeout(timer);
  }, []);

  const handleToggleSave = (e: React.MouseEvent, confession: Confession) => {
    e.stopPropagation();
    const isSaved = savedIds.includes(confession.id);

    if (isSaved) {
      const items = getSavedItems();
      const itemToRemove = items.find(i => i.refId === confession.id && i.type === 'confession');
      if (itemToRemove) {
        removeItem(itemToRemove.id);
        setSavedIds(prev => prev.filter(id => id !== confession.id));
        setOfflineIds(prev => prev.filter(id => id !== confession.id));
      }
    } else {
      saveItem({
        type: 'confession',
        refId: confession.id,
        title: confession.title,
        subtitle: confession.author,
        tags: confession.tags,
        userNotes: ''
      });
      setSavedIds(prev => [...prev, confession.id]);
    }
  };

  const handleDownloadOffline = async (e: React.MouseEvent, confession: Confession) => {
    e.stopPropagation();
    if (offlineIds.includes(confession.id)) return;

    setDownloadingId(confession.id);

    try {
      const ai = getGeminiClient();
      let prompt = "";

      if (confession.id === 'institutes') {
        prompt = `Provide the COMPLETE verbatim text of Calvin's Institutes (Summary of all 4 Books) using the John Allen Translation (1813). Since the full text is too large for one output, provide a comprehensive structured digest containing the text of the primary sections for Book 1 through 4.`;
      } else {
        prompt = `Provide the COMPLETE verbatim text of the ${confession.title}. Include all Articles or Chapters. Use Google Search to ensure 100% accuracy to the original document. Output as a clear Markdown document.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          tools: [{ googleSearch: {} }]
        }
      });

      if (response.text) {
        saveItem({
          type: 'confession',
          refId: confession.id,
          title: confession.title,
          subtitle: confession.author,
          tags: [...confession.tags, 'Offline'],
          userNotes: 'Downloaded for offline study.',
          content: response.text,
          isOffline: true
        });
        setSavedIds(prev => Array.from(new Set([...prev, confession.id])));
        setOfflineIds(prev => [...prev, confession.id]);
      }
    } catch (error) {
      console.error("Offline download failed", error);
      alert("Failed to download document for offline use. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter logic
  const filteredConfessions = CONFESSIONS.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.author.toLowerCase().includes(query) ||
      c.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const visibleConfessions = filteredConfessions.slice(0, displayCount);
  const hasMore = displayCount < filteredConfessions.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 6);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setDisplayCount(6);
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 sm:mb-16 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-reformed-100/50 dark:via-reformed-900/30 to-transparent blur-3xl -z-10" />

        <h2 className="text-4xl sm:text-5xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-6 transition-colors tracking-tight">
          The Confessional Library
        </h2>
        <p className="text-lg sm:text-xl text-reformed-700 dark:text-reformed-200 max-w-2xl mx-auto font-serif transition-colors mb-10 leading-relaxed">
          Explore the historic documents of the Reformed faith. Select a document to begin studying.
        </p>

        {/* Search Bar & Controls */}
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative group flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-reformed-400 group-focus-within:text-reformed-600 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 border-2 border-reformed-200 dark:border-reformed-700 rounded-full leading-5 bg-white dark:bg-reformed-900 text-reformed-900 dark:text-reformed-100 placeholder-reformed-400 focus:outline-none focus:ring-2 focus:ring-reformed-400 focus:border-transparent sm:text-base transition-all shadow-sm hover:shadow-md"
                placeholder="Filter by title, author, or keyword..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(6); // Reset pagination on search
                }}
              />
            </div>

            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              onClick={handleRefresh}
              className="p-4 bg-white dark:bg-reformed-900 border-2 border-reformed-200 dark:border-reformed-700 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:border-reformed-400 dark:hover:border-reformed-500 rounded-full transition-all shadow-sm hover:shadow-md shrink-0 group"
              title="Reset Library View"
              aria-label="Reset Library View"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <motion.div key={`skeleton-${i}`} variants={item}>
              <SkeletonCard />
            </motion.div>
          ))
        ) : (
          visibleConfessions.map((confession) => (
            <motion.div
              key={confession.id}
              variants={item}
              className="relative group h-full"
              layout
            >
              {/* Card */}
              <motion.div
                className="bg-white dark:bg-reformed-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-reformed-200 dark:border-reformed-800 overflow-hidden flex flex-col h-full cursor-pointer touch-manipulation transform-gpu"
                onClick={() => onSelectConfession(confession)}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="bg-reformed-50 dark:bg-reformed-800/50 p-6 border-b border-reformed-100 dark:border-reformed-800 lg:group-hover:bg-reformed-100 lg:dark:group-hover:bg-reformed-800 transition-colors relative">

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDownloadOffline(e, confession)}
                      className={`p-2 rounded-full transition-colors z-10 ${offlineIds.includes(confession.id) ? 'text-green-600' : 'text-reformed-400 hover:bg-white/50 dark:hover:bg-black/20'}`}
                      title={offlineIds.includes(confession.id) ? "Available Offline" : "Download for Offline Use"}
                      disabled={downloadingId === confession.id}
                    >
                      {downloadingId === confession.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : offlineIds.includes(confession.id) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <CloudDownload className="w-5 h-5" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleToggleSave(e, confession)}
                      className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-colors z-10"
                      title={savedIds.includes(confession.id) ? "Remove Bookmark" : "Bookmark this Confession"}
                    >
                      <Bookmark className={`w-5 h-5 transition-all ${savedIds.includes(confession.id) ? "fill-reformed-800 text-reformed-800 dark:fill-reformed-200 dark:text-reformed-200" : "text-reformed-400"}`} />
                    </motion.button>
                  </div>

                  <h3 className="text-2xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-3 mr-16 leading-tight">
                    {confession.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center text-reformed-600 dark:text-reformed-400 text-xs font-bold uppercase tracking-wider space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {confession.date}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1.5" />
                      <span className="truncate max-w-[150px]">{confession.author}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between bg-white dark:bg-reformed-900 transition-colors">
                  <p className="text-reformed-700 dark:text-reformed-300 font-serif text-sm leading-relaxed mb-6 line-clamp-3">
                    {confession.description}
                  </p>

                  <div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {confession.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-reformed-50 dark:bg-reformed-800 text-reformed-600 dark:text-reformed-400 text-[10px] rounded-md border border-reformed-200 dark:border-reformed-700 font-bold uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-reformed-500 dark:text-reformed-400 font-sans text-xs font-bold uppercase tracking-widest lg:group-hover:text-reformed-800 dark:lg:group-hover:text-reformed-200 transition-colors">
                        Study Document <ArrowRight className="ml-2 w-4 h-4 lg:group-hover:translate-x-1 transition-transform" />
                      </div>
                      {offlineIds.includes(confession.id) && (
                        <span className="text-[10px] font-bold text-green-600 uppercase flex items-center">
                          <Check className="w-3 h-3 mr-1" /> Offline Ready
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))
        )}
      </motion.div>

      {!isLoading && hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-16 flex justify-center pb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoadMore}
            className="group flex items-center px-8 py-3 bg-white dark:bg-reformed-800 border border-reformed-300 dark:border-reformed-700 rounded-full text-reformed-700 dark:text-reformed-200 font-bold hover:bg-reformed-50 dark:hover:bg-reformed-700 hover:border-reformed-400 dark:hover:border-reformed-600 transition-all shadow-sm hover:shadow-md"
          >
            Load More Documents
            <ChevronDown className="ml-2 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};
