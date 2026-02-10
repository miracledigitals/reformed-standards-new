
import React, { useState, useEffect } from 'react';
import { HYMNS } from '../constants';
import { Hymn } from '../types';
import { Music, ArrowRight, User, Search, Globe, Cloud, ChevronDown, RotateCcw, Bookmark } from 'lucide-react';
import { saveItem, removeItem, getSavedItems } from '../services/storageService';

interface HymnalProps {
  onSelectHymn: (hymn: Hymn) => void;
  onSearch: (query: string) => void;
}

export const Hymnal: React.FC<HymnalProps> = ({ onSelectHymn, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(6);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    // Load saved items to check status
    const items = getSavedItems();
    setSavedIds(items.filter(i => i.type === 'hymn').map(i => i.refId));
  }, []);

  const handleToggleSave = (e: React.MouseEvent, hymn: Hymn) => {
    e.stopPropagation();
    const isSaved = savedIds.includes(hymn.id);
    
    if (isSaved) {
        const items = getSavedItems();
        const itemToRemove = items.find(i => i.refId === hymn.id && i.type === 'hymn');
        if (itemToRemove) {
            removeItem(itemToRemove.id);
            setSavedIds(prev => prev.filter(id => id !== hymn.id));
        }
    } else {
        saveItem({
            type: 'hymn',
            refId: hymn.id,
            title: hymn.title,
            subtitle: hymn.author,
            tags: hymn.tags,
            userNotes: ''
        });
        setSavedIds(prev => [...prev, hymn.id]);
    }
  };

  const filteredHymns = HYMNS.filter((hymn) => {
    const query = searchQuery.toLowerCase();
    return (
      hymn.title.toLowerCase().includes(query) ||
      hymn.author.toLowerCase().includes(query) ||
      hymn.description.toLowerCase().includes(query) ||
      hymn.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  // Reset display count when search query changes
  useEffect(() => {
    setDisplayCount(6);
  }, [searchQuery]);

  const visibleHymns = filteredHymns.slice(0, displayCount);
  const hasMore = displayCount < filteredHymns.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 6);
  };

  const handleExternalSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setDisplayCount(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExternalSearch();
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
       <div className="absolute top-4 right-4 sm:top-12 sm:right-8">
        <button
          onClick={handleRefresh}
          className="p-2 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
          title="Reset Search & View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-4 transition-colors">
          Reformed Hymnal
        </h2>
        <p className="text-lg text-reformed-700 dark:text-reformed-200 max-w-2xl mx-auto font-serif transition-colors mb-8">
          "Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom, singing psalms and hymns and spiritual songs." — Colossians 3:16
        </p>

        {/* Enhanced Search Bar UI */}
        <div className="max-w-xl mx-auto">
          <div className="relative group">
            {/* Input Container */}
            <div className="relative flex items-center bg-white dark:bg-reformed-900 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent focus-within:border-reformed-400 dark:focus-within:border-reformed-600">
              
              {/* Search Icon */}
              <div className="pl-4 text-reformed-400 dark:text-reformed-500 pointer-events-none">
                <Search className="h-5 w-5" />
              </div>

              {/* Input Field */}
              <input
                type="text"
                className="w-full py-3.5 pl-3 pr-14 bg-transparent border-none text-reformed-900 dark:text-reformed-100 placeholder-reformed-400 focus:ring-0 focus:outline-none font-sans text-base sm:text-lg"
                placeholder="Search by number, title, or lyrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              {/* Action Button */}
              <div className="pr-2">
                 <button
                  onClick={handleExternalSearch}
                  disabled={!searchQuery.trim()}
                  className={`
                    p-2 rounded-full transition-all duration-200 flex items-center justify-center
                    ${searchQuery.trim() 
                      ? 'bg-reformed-800 text-white hover:bg-reformed-700 shadow-md hover:shadow-lg transform hover:scale-105' 
                      : 'bg-reformed-100 dark:bg-reformed-800 text-reformed-300 dark:text-reformed-600 cursor-not-allowed'}
                  `}
                  title="Search Extended Library via AI"
                >
                  <Globe className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Helper Text */}
          <div className="mt-3 text-center">
             <p className="text-xs text-reformed-500 dark:text-reformed-400 font-sans opacity-90">
               <span className="font-bold">Tip:</span> Enter a number to lookup Gadsby's Hymns directly.
             </p>
          </div>
        </div>
      </div>

      {filteredHymns.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleHymns.map((hymn) => (
              <div 
                key={hymn.id}
                className="group bg-white dark:bg-reformed-900 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-reformed-200 dark:border-reformed-800 overflow-hidden flex flex-col h-full cursor-pointer"
                onClick={() => onSelectHymn(hymn)}
              >
                <div className="bg-reformed-50 dark:bg-reformed-800 p-6 border-b border-reformed-200 dark:border-reformed-700 group-hover:bg-reformed-100 dark:group-hover:bg-reformed-700 transition-colors relative">
                  {/* Bookmark Button */}
                  <button 
                    onClick={(e) => handleToggleSave(e, hymn)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-colors z-10"
                    title={savedIds.includes(hymn.id) ? "Remove Bookmark" : "Bookmark this Hymn"}
                  >
                     <Bookmark className={`w-5 h-5 transition-all ${savedIds.includes(hymn.id) ? "fill-reformed-800 text-reformed-800 dark:fill-reformed-200 dark:text-reformed-200" : "text-reformed-400"}`} />
                  </button>

                  <div className="flex justify-between items-start mr-8">
                      <h3 className="text-lg font-display font-bold text-reformed-900 dark:text-reformed-50 mb-2">
                        {hymn.title}
                      </h3>
                  </div>
                  <div className="flex items-center text-reformed-600 dark:text-reformed-300 text-sm space-x-4">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span className="truncate">{hymn.author}</span>
                    </div>
                    <div className="text-xs bg-reformed-200 dark:bg-reformed-600 px-2 py-0.5 rounded-full text-reformed-800 dark:text-reformed-100">
                      {hymn.date}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between bg-white dark:bg-reformed-900 transition-colors">
                  <p className="text-reformed-800 dark:text-reformed-200 font-serif leading-relaxed mb-4 line-clamp-3 text-sm">
                    {hymn.description}
                  </p>
                  
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hymn.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-reformed-50 dark:bg-reformed-800 text-reformed-600 dark:text-reformed-300 text-xs rounded-full border border-reformed-200 dark:border-reformed-700 font-sans font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-reformed-600 dark:text-reformed-400 font-sans text-sm font-bold group-hover:text-reformed-800 dark:group-hover:text-reformed-200 group-hover:translate-x-1 transition-all">
                      Study Lyrics <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="group flex items-center px-8 py-3 bg-white dark:bg-reformed-800 border border-reformed-300 dark:border-reformed-700 rounded-full text-reformed-700 dark:text-reformed-200 font-medium hover:bg-reformed-50 dark:hover:bg-reformed-700 hover:border-reformed-400 dark:hover:border-reformed-600 transition-all shadow-sm hover:shadow-md"
              >
                Load More Hymns
                <ChevronDown className="ml-2 w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-reformed-900 rounded-lg border border-reformed-200 dark:border-reformed-800 shadow-sm max-w-lg mx-auto">
          <Cloud className="w-12 h-12 text-reformed-300 dark:text-reformed-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-reformed-900 dark:text-reformed-100 mb-2">
            Not found in local collection
          </h3>
          <p className="text-reformed-600 dark:text-reformed-400 font-serif mb-6 px-6">
            We couldn't find "{searchQuery}" in our curated list. Would you like to search the Extended Library (including Gadsby's Hymns & hymns.countedfaithful.org)?
          </p>
          <button 
            onClick={handleExternalSearch}
            className="inline-flex items-center px-6 py-3 bg-reformed-800 hover:bg-reformed-700 text-white rounded-full font-medium transition-colors shadow-md"
          >
            <Globe className="w-4 h-4 mr-2" />
            Search Extended Library
          </button>
          <div className="mt-4">
             <button 
                onClick={() => setSearchQuery('')}
                className="text-sm text-reformed-500 hover:text-reformed-700 dark:text-reformed-400 dark:hover:text-reformed-200 underline"
              >
                Clear search
              </button>
          </div>
        </div>
      )}
    </div>
  );
};
