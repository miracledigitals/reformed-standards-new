
import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Users, Library, Book, Sun, Moon, Music, Coffee, Search, ChevronLeft, GraduationCap, Workflow, Bookmark, Layers, ChevronDown, Check, GitCompare, Clock, Share2, WifiOff, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  activeView: 'library' | 'chat' | 'theologians' | 'bible' | 'hymnal' | 'devotional' | 'study' | 'connections' | 'notebook' | 'systematics' | 'timeline' | 'comparison' | 'cross-reference' | 'bible-navigation';
  onViewChange: (view: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenSearch: () => void;
  onShare: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
}

interface NavButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ isActive, onClick, icon, label }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`p-2 xl:px-3 xl:py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center group shrink-0 relative overflow-hidden ${isActive
      ? 'bg-reformed-800 text-white shadow-sm ring-1 ring-reformed-700/50'
      : 'text-reformed-50 hover:bg-reformed-100 dark:text-reformed-300 dark:hover:bg-reformed-800 dark:hover:text-white'
      }`}
    title={label}
  >
    <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="hidden xl:inline-block ml-2">{label}</span>
    {isActive && (
      <motion.div
        layoutId="active-indicator"
        className="absolute inset-0 bg-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    )}
  </motion.button>
);

export const Header: React.FC<HeaderProps> = ({ activeView, onViewChange, theme, toggleTheme, onOpenSearch, onShare, canGoBack, onBack }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getActiveLabel = () => {
    switch (activeView) {
      case 'library': return 'Library';
      case 'bible': return 'Bible';
      case 'hymnal': return 'Hymnal';
      case 'devotional': return 'Daily';
      case 'study': return 'Study';
      case 'systematics': return 'Systematics';
      case 'connections': return 'Map';
      case 'theologians': return 'History';
      case 'timeline': return 'Timeline';
      case 'comparison': return 'Compare';
      case 'cross-reference': return 'Cross-Ref';
      case 'notebook': return 'Bookmarks';
      case 'chat': return 'Assistant';
      default: return 'Menu';
    }
  };

  const navGroups = [
    {
      label: 'Sources',
      items: [
        { id: 'library', label: 'Library', icon: Library },
        { id: 'bible', label: 'Bible', icon: Book },
        { id: 'hymnal', label: 'Hymnal', icon: Music },
      ]
    },
    {
      label: 'Application',
      items: [
        { id: 'devotional', label: 'Daily', icon: Coffee },
        { id: 'study', label: 'Study', icon: GraduationCap },
        { id: 'comparison', label: 'Compare', icon: GitCompare },
      ]
    },
    {
      label: 'Context',
      items: [
        { id: 'systematics', label: 'Systematics', icon: Layers },
        { id: 'connections', label: 'Map', icon: Workflow },
        { id: 'cross-reference', label: 'Cross-Ref', icon: Share2 },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'theologians', label: 'History', icon: Users },
      ]
    },
    {
      label: 'Personal',
      items: [
        { id: 'notebook', label: 'Bookmarks', icon: Bookmark },
      ]
    }
  ] as const;



  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-reformed-950/80 backdrop-blur-xl text-reformed-900 dark:text-reformed-50 shadow-sm border-b border-reformed-200 dark:border-reformed-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center shrink-0 mr-2 sm:mr-4">
            <AnimatePresence mode="wait">
              {canGoBack && onBack ? (
                <motion.button
                  key="back-button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={onBack}
                  className="mr-1 sm:mr-3 p-1.5 rounded-full hover:bg-reformed-100 dark:hover:bg-reformed-800 text-reformed-500 dark:text-reformed-400 hover:text-reformed-900 dark:hover:text-white transition-colors flex items-center"
                  title="Go Back"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              ) : null}
            </AnimatePresence>

            <motion.button
              onClick={() => onViewChange('library')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity shrink-0"
            >
              <div className="bg-reformed-800 text-white p-1.5 rounded-lg shadow-md">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-left hidden md:block">
                <h1 className="text-lg font-display font-bold tracking-wide leading-none text-reformed-900 dark:text-reformed-100">Reformed</h1>
                <p className="text-[10px] text-reformed-500 dark:text-reformed-400 font-sans uppercase tracking-widest leading-none mt-0.5">Standards</p>
              </div>
            </motion.button>
          </div>

          <div className="flex items-center flex-1 justify-end min-w-0 gap-2">

            {/* Online Status Indicator */}
            <AnimatePresence>
              {!isOnline && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse shrink-0"
                >
                  <WifiOff className="w-3 h-3 mr-1.5" /> Offline Mode
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Search Input */}
            <div className="hidden lg:block relative shrink-0 mr-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenSearch}
                className="flex items-center bg-reformed-50 dark:bg-reformed-900 text-reformed-500 dark:text-reformed-400 border border-reformed-200 dark:border-reformed-700 rounded-full px-4 py-1.5 text-xs font-medium hover:border-reformed-400 hover:text-reformed-800 dark:hover:text-reformed-200 transition-all group w-48 xl:w-64"
              >
                <Search className="w-3.5 h-3.5 mr-2" />
                <span className="opacity-80 truncate">Quick Search...</span>
                <span className="ml-auto text-[10px] border border-reformed-300 dark:border-reformed-600 px-1.5 rounded">⌘K</span>
              </motion.button>
            </div>

            {/* Mobile Search Trigger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onOpenSearch}
              className="p-2 rounded-full text-reformed-500 dark:text-reformed-400 hover:text-reformed-900 dark:hover:text-white hover:bg-reformed-100 dark:hover:bg-reformed-800 transition-colors focus:outline-none lg:hidden shrink-0"
              aria-label="Quick Search"
            >
              <Search className="w-5 h-5" />
            </motion.button>



            {/* Mobile Navigation (Dropdown) */}
            <div className="lg:hidden relative" ref={menuRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm border transition-all ${isMobileMenuOpen
                  ? 'bg-reformed-800 text-white border-reformed-800'
                  : 'bg-white dark:bg-reformed-900 text-reformed-700 dark:text-reformed-200 border-reformed-200 dark:border-reformed-700'
                  }`}
              >
                <span>{getActiveLabel()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-reformed-900 rounded-xl shadow-2xl border border-reformed-200 dark:border-reformed-800 py-2 z-50 origin-top-right backdrop-blur-md"
                  >
                    {navGroups.map((group, groupIdx) => (
                      <div key={group.label}>
                        {groupIdx > 0 && <div className="h-px bg-reformed-100 dark:bg-reformed-800 my-1 mx-2" />}
                        <div className="px-3 py-1.5">
                          <span className="text-[10px] font-bold text-reformed-400 dark:text-reformed-500 uppercase tracking-widest px-2">
                            {group.label}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {group.items.map(item => {
                              const isActive = activeView === item.id;
                              return (
                                <motion.button
                                  key={item.id}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    onViewChange(item.id as any);
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-reformed-50 dark:bg-reformed-800 text-reformed-900 dark:text-reformed-100'
                                    : 'text-reformed-600 dark:text-reformed-400 hover:bg-reformed-50 dark:hover:bg-reformed-800 hover:text-reformed-900 dark:hover:text-reformed-200'
                                    }`}
                                >
                                  <div className="flex items-center">
                                    <item.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-reformed-600 dark:text-reformed-300' : 'opacity-70'}`} />
                                    {item.label}
                                  </div>
                                  {isActive && <Check className="w-3.5 h-3.5 text-reformed-600 dark:text-reformed-400" />}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-reformed-200 dark:bg-reformed-700 mx-1 hidden sm:block shrink-0"></div>

            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onShare}
                className="p-2 rounded-full text-reformed-500 dark:text-reformed-400 hover:text-reformed-900 dark:hover:text-white hover:bg-reformed-100 dark:hover:bg-reformed-800 transition-colors focus:outline-none shrink-0"
                aria-label="Share current view"
                title="Share this view"
              >
                <Share className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-full text-reformed-500 dark:text-reformed-400 hover:text-reformed-900 dark:hover:text-white hover:bg-reformed-100 dark:hover:bg-reformed-800 transition-colors focus:outline-none shrink-0"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
