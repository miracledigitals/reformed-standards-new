
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Library } from './components/Library';
import { ChatInterface } from './components/ChatInterface';
import { Theologians } from './components/Theologians';
import { BibleGallery } from './components/BibleGallery';
import { BibleNavigator } from './components/BibleNavigator';
import { Hymnal } from './components/Hymnal';
import { DailyDevotional } from './components/DailyDevotional';
import { TheologicalStudy } from './components/TheologicalStudy';
import { QuickSearch } from './components/QuickSearch';
import { DoctrinalConnections } from './components/DoctrinalConnections';
import { Notebook } from './components/Notebook';
import { SystematicTheologyBrowser } from './components/SystematicTheologyBrowser';
import { HistoricalTimeline } from './components/HistoricalTimeline';
import { ParallelComparison } from './components/ParallelComparison';
import { CrossReferenceVisualizer } from './components/CrossReferenceVisualizer';
import { Confession, BibleVersion, Hymn } from './types';
import { Sparkles, ArrowUp } from 'lucide-react';
import { BIBLE_VERSIONS, CONFESSIONS, HYMNS } from './constants';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'library' | 'chat' | 'theologians' | 'bible' | 'bible-navigation' | 'hymnal' | 'devotional' | 'study' | 'connections' | 'notebook' | 'systematics' | 'timeline' | 'comparison' | 'cross-reference'>('library');
  const [viewHistory, setViewHistory] = useState<string[]>([]);

  const [activeConfession, setActiveConfession] = useState<Confession | null>(null);
  const [activeBible, setActiveBible] = useState<BibleVersion | null>(null);
  const [activeHymn, setActiveHymn] = useState<Hymn | null>(null);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string | undefined>(undefined);
  const [initialConnectionContext, setInitialConnectionContext] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [defaultBibleId, setDefaultBibleId] = useState<string>('esv');

  // URL Parsing on Mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as any;
    const confessionParam = params.get('confession');
    const bibleParam = params.get('bible');
    const hymnParam = params.get('hymn');
    const conceptParam = params.get('concept');

    if (viewParam) {
      setActiveView(viewParam);

      if (confessionParam) {
        const found = CONFESSIONS.find(c => c.id === confessionParam);
        if (found) setActiveConfession(found);
      }

      if (bibleParam) {
        const found = BIBLE_VERSIONS.find(b => b.id === bibleParam);
        if (found) setActiveBible(found);
      }

      if (hymnParam) {
        const found = HYMNS.find(h => h.id === hymnParam);
        if (found) setActiveHymn(found);
      }

      if (conceptParam) {
        setInitialConnectionContext(conceptParam);
      }
    }
  }, []);

  // Initialize theme and default bible from local storage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    const storedBible = localStorage.getItem('defaultBibleId');
    if (storedBible) {
      setDefaultBibleId(storedBible);
    }
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply theme class to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll detection for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSetDefaultBible = (id: string) => {
    setDefaultBibleId(id);
    localStorage.setItem('defaultBibleId', id);
  };

  // Helper to push to history
  const addToHistory = (currentView: string) => {
    setViewHistory(prev => [...prev, currentView]);
  };

  const handleBack = () => {
    if (viewHistory.length === 0) return;

    const previousView = viewHistory[viewHistory.length - 1] as typeof activeView;
    const newHistory = viewHistory.slice(0, -1);

    setViewHistory(newHistory);
    setActiveView(previousView);

    if (previousView === 'library') {
      setActiveConfession(null);
    }
  };

  const handleSelectConfession = (confession: Confession) => {
    addToHistory(activeView);
    setActiveConfession(confession);
    setActiveBible(null);
    setActiveHymn(null);
    setInitialChatPrompt(undefined);
    setActiveView('chat');
  };

  const handleSelectBible = (bible: BibleVersion) => {
    addToHistory(activeView);
    setActiveBible(bible);
    setActiveConfession(null);
    setActiveHymn(null);
    // Go to Navigator instead of Chat directly
    setActiveView('bible-navigation');
  }

  const handleBibleSearch = (prompt: string) => {
    if (!activeBible) return;
    addToHistory(activeView);
    setInitialChatPrompt(prompt);
    setActiveView('chat');
  };

  const handleSelectHymn = (hymn: Hymn) => {
    addToHistory(activeView);
    setActiveHymn(hymn);
    setActiveBible(null);
    setActiveConfession(null);
    setInitialChatPrompt(undefined);
    setActiveView('chat');
  }

  const handleHymnSearch = (query: string) => {
    addToHistory(activeView);
    setActiveHymn(null);
    setActiveBible(null);
    setActiveConfession(null);

    const trimmedQuery = query.trim();
    const isNumber = /^\d+$/.test(trimmedQuery);
    let prompt = "";

    if (isNumber) {
      prompt = `Retrieve Hymn Number ${trimmedQuery} specifically from https://hymns.countedfaithful.org/numberListing.php. Use Google Search to find the specific page for this hymn number on that domain. Provide the full title, author, meter, and lyrics verbatim from that source.`;
    } else {
      prompt = `Search for the hymn "${trimmedQuery}" on https://hymns.countedfaithful.org/numberListing.php. Use Google Search to find the hymn on that domain. Provide the lyrics, author, and details verbatim from the source found.`;
    }

    setInitialChatPrompt(prompt);
    setActiveView('chat');
  }

  const handleTermClick = (term: string) => {
    setIsSearchOpen(true);
  };

  const handleViewConnections = (term: string) => {
    addToHistory(activeView);
    setInitialConnectionContext(term);
    setActiveView('connections');
  };

  const handleViewChange = (view: typeof activeView) => {
    if (activeView === view) return;
    addToHistory(activeView);
    setActiveView(view);
    setActiveConfession(null);
    setActiveBible(null);
    setActiveHymn(null);
    setInitialChatPrompt(undefined);

    if (view !== 'connections') {
      setInitialConnectionContext(null);
    }
  };

  const handleCloseChat = () => {
    if (viewHistory.length > 0) {
      handleBack();
    } else {
      setActiveView('library');
      setActiveConfession(null);
      setActiveBible(null);
      setActiveHymn(null);
      setInitialChatPrompt(undefined);
    }
  };

  const handleOpenGeneralChat = () => {
    addToHistory(activeView);
    setActiveConfession(null);
    setActiveBible(null);
    setActiveHymn(null);
    setInitialChatPrompt(undefined);
    setActiveView('chat');
  };

  const handleShare = async () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('view', activeView);

    let shareTitle = "Reformed Standards";
    let shareText = "Check out this Reformed theological resource.";

    if (activeConfession) {
      url.searchParams.set('confession', activeConfession.id);
      shareTitle = activeConfession.title;
      shareText = `Study the ${activeConfession.title} with AI-powered assistance.`;
    } else if (activeBible) {
      url.searchParams.set('bible', activeBible.id);
      shareTitle = activeBible.title;
      shareText = `Read the Bible (${activeBible.shortTitle}) within the Reformed tradition.`;
    } else if (activeHymn) {
      url.searchParams.set('hymn', activeHymn.id);
      shareTitle = activeHymn.title;
      shareText = `Listen to and study the lyrics of "${activeHymn.title}".`;
    } else if (initialConnectionContext) {
      url.searchParams.set('concept', initialConnectionContext);
      shareTitle = `Doctrine: ${initialConnectionContext}`;
      shareText = `Explore the logical connections for ${initialConnectionContext}.`;
    }

    const shareUrl = url.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        console.debug('Share failed or cancelled', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Could not copy text: ', err);
      }
    }
  };

  const defaultBible = BIBLE_VERSIONS.find(b => b.id === defaultBibleId) || BIBLE_VERSIONS[0];

  const FloatingActionButton = () => (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40">
      <button
        onClick={handleOpenGeneralChat}
        className="group flex items-center justify-center bg-reformed-800 text-white p-4 sm:px-6 sm:py-4 rounded-full shadow-lg hover:bg-reformed-700 hover:scale-105 transition-all duration-300 border-2 border-reformed-600 dark:border-reformed-400"
        aria-label="Ask the Theologian"
      >
        <Sparkles className="w-6 h-6 sm:w-5 sm:h-5 sm:mr-2" />
        <span className="hidden sm:inline font-display font-bold">Ask the Theologian</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-reformed-900 dark:text-reformed-100 bg-reformed-50 dark:bg-reformed-950 transition-colors duration-300 overflow-x-hidden">
      <Header
        activeView={activeView === 'bible-navigation' ? 'bible' : activeView}
        onViewChange={handleViewChange}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onShare={handleShare}
        canGoBack={viewHistory.length > 0}
        onBack={handleBack}
      />

      <QuickSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <main className="flex-1 w-full max-w-[100vw] overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Library onSelectConfession={handleSelectConfession} />
            </motion.div>
          )}

          {activeView === 'bible' && (
            <motion.div
              key="bible"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <BibleGallery
                onSelectBible={handleSelectBible}
                defaultBibleId={defaultBibleId}
                onSetDefault={handleSetDefaultBible}
              />
            </motion.div>
          )}

          {activeView === 'bible-navigation' && activeBible && (
            <motion.div
              key="bible-nav"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <BibleNavigator
                activeVersion={activeBible}
                onSearch={handleBibleSearch}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {activeView === 'hymnal' && (
            <motion.div
              key="hymnal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Hymnal onSelectHymn={handleSelectHymn} onSearch={handleHymnSearch} />
            </motion.div>
          )}

          {activeView === 'theologians' && (
            <motion.div
              key="theologians"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Theologians />
            </motion.div>
          )}

          {activeView === 'devotional' && (
            <motion.div
              key="devotional"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <DailyDevotional />
            </motion.div>
          )}

          {activeView === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <TheologicalStudy />
            </motion.div>
          )}

          {activeView === 'connections' && (
            <motion.div
              key="connections"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <DoctrinalConnections initialConcept={initialConnectionContext} />
            </motion.div>
          )}

          {activeView === 'notebook' && (
            <motion.div
              key="notebook"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Notebook />
            </motion.div>
          )}

          {activeView === 'systematics' && (
            <motion.div
              key="systematics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <SystematicTheologyBrowser />
            </motion.div>
          )}

          {activeView === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, zoom: 0.95 }}
              animate={{ opacity: 1, zoom: 1 }}
              exit={{ opacity: 0, zoom: 1.05 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <HistoricalTimeline onSelectConfession={handleSelectConfession} />
            </motion.div>
          )}

          {activeView === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ParallelComparison />
            </motion.div>
          )}

          {activeView === 'cross-reference' && (
            <motion.div
              key="cross-ref"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <CrossReferenceVisualizer />
            </motion.div>
          )}

          {activeView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ChatInterface
                activeConfession={activeConfession}
                activeBible={activeBible}
                activeHymn={activeHymn}
                defaultBible={defaultBible}
                initialPrompt={initialChatPrompt}
                onClose={handleCloseChat}
                onTermClick={handleTermClick}
                onViewConnections={handleViewConnections}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button - Rendered only when NOT in chat view */}
      {activeView !== 'chat' && <FloatingActionButton />}

      {showScrollTop && activeView !== 'chat' && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 sm:bottom-28 sm:right-8 z-30 p-3 bg-white dark:bg-reformed-900 text-reformed-600 dark:text-reformed-400 rounded-full shadow-lg border border-reformed-200 dark:border-reformed-700 hover:bg-reformed-50 dark:hover:bg-reformed-800 hover:text-reformed-900 dark:hover:text-white transition-all duration-300"
          aria-label="Back to Top"
          title="Back to Top"
        >
          <ArrowUp className="w-6 h-6 sm:w-5 sm:h-5" />
        </motion.button>
      )}

      {activeView !== 'chat' && activeView !== 'bible-navigation' && (
        <footer className="bg-reformed-900 dark:bg-black text-reformed-300 py-8 mt-12 border-t-4 border-reformed-700 dark:border-reformed-900">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="font-serif italic mb-2">Soli Deo Gloria</p>
            <p className="text-xs opacity-70 font-sans">
              This application uses Gemini AI to assist in the study of historical Reformed Confessions.
              <br />
              Always consult the primary texts for authoritative references.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
