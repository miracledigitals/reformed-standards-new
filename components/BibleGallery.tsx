
import React, { useState } from 'react';
import { BIBLE_VERSIONS } from '../constants';
import { BibleVersion } from '../types';
import { Book, Calendar, ArrowRight, RotateCcw, Star, Check, Search } from 'lucide-react';

interface BibleGalleryProps {
  onSelectBible: (bible: BibleVersion) => void;
  defaultBibleId: string;
  onSetDefault: (id: string) => void;
}

export const BibleGallery: React.FC<BibleGalleryProps> = ({ onSelectBible, defaultBibleId, onSetDefault }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = () => {
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter Logic
  const filteredVersions = BIBLE_VERSIONS.filter(bible => {
    const query = searchQuery.toLowerCase();
    return (
        bible.title.toLowerCase().includes(query) ||
        bible.shortTitle.toLowerCase().includes(query) ||
        bible.description.toLowerCase().includes(query) ||
        bible.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      <div className="absolute top-4 right-4 sm:top-12 sm:right-8">
        <button
          onClick={handleRefresh}
          className="p-2 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-4 transition-colors">
          Sacred Scripture
        </h2>
        <p className="text-lg text-reformed-700 dark:text-reformed-200 max-w-2xl mx-auto font-serif transition-colors mb-8">
          Consult the authoritative versions of the Holy Bible used in the Reformed tradition and rigorous study.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-reformed-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-reformed-300 dark:border-reformed-700 rounded-full leading-5 bg-white dark:bg-reformed-900 text-reformed-900 dark:text-reformed-100 placeholder-reformed-400 focus:outline-none focus:ring-2 focus:ring-reformed-500 focus:border-reformed-500 sm:text-sm transition-colors shadow-sm"
                    placeholder="Search versions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      </div>

      {filteredVersions.length === 0 ? (
          <div className="text-center py-12">
               <Book className="mx-auto h-12 w-12 text-reformed-300" />
               <h3 className="mt-2 text-sm font-bold text-reformed-900 dark:text-reformed-100">No versions found</h3>
               <p className="mt-1 text-sm text-reformed-500 dark:text-reformed-400">
                  Try a different search term.
               </p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVersions.map((bible) => {
                const isDefault = defaultBibleId === bible.id;
                
                return (
                    <div key={bible.id} className="relative group h-full">
                        {/* Tooltip */}
                        <div className="absolute z-40 bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 w-72 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-reformed-900/95 dark:bg-white/95 backdrop-blur-sm text-reformed-50 dark:text-reformed-900 text-sm p-4 rounded-lg shadow-xl border border-reformed-700 dark:border-reformed-200 font-serif leading-relaxed text-center relative">
                            {bible.description}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-reformed-900/95 dark:bg-white/95 border-b border-r border-reformed-700 dark:border-reformed-200 transform rotate-45"></div>
                        </div>
                        </div>

                        {/* Card */}
                        <div 
                        className={`bg-white dark:bg-reformed-900 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border overflow-hidden flex flex-col h-full cursor-pointer
                            ${isDefault ? 'border-reformed-500 dark:border-reformed-400 ring-2 ring-reformed-500/20' : 'border-reformed-200 dark:border-reformed-800'}`}
                        onClick={() => onSelectBible(bible)}
                        >
                        <div className="bg-reformed-900 dark:bg-reformed-800 p-6 border-b border-reformed-700 dark:border-reformed-700 group-hover:bg-reformed-800 dark:group-hover:bg-reformed-700 transition-colors relative">
                            {/* Default Badge/Toggle */}
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSetDefault(bible.id);
                                    }}
                                    className={`p-1.5 rounded-full transition-all duration-200 ${
                                        isDefault 
                                        ? 'bg-white text-reformed-600 shadow-md' 
                                        : 'bg-reformed-800/50 text-reformed-400 hover:bg-white hover:text-reformed-600'
                                    }`}
                                    title={isDefault ? "Current Default Translation" : "Set as Default Translation"}
                                >
                                    <Star className={`w-4 h-4 ${isDefault ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            <h3 className="text-xl font-display font-bold text-reformed-50 mb-2 pr-8">
                            {bible.title}
                            </h3>
                            <div className="flex items-center text-reformed-300 text-sm space-x-4">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {bible.date}
                            </div>
                            {isDefault && (
                                <div className="flex items-center text-xs font-bold bg-reformed-700 text-white px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3 mr-1" /> Default
                                </div>
                            )}
                            </div>
                        </div>
                        
                        <div className="p-6 flex-grow flex flex-col justify-between bg-white dark:bg-reformed-900 transition-colors">
                            <p className="text-reformed-800 dark:text-reformed-200 font-serif leading-relaxed mb-4">
                            {bible.description}
                            </p>
                            
                            <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {bible.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-reformed-50 dark:bg-reformed-800 text-reformed-600 dark:text-reformed-300 text-xs rounded-full border border-reformed-200 dark:border-reformed-700 font-sans font-medium">
                                    {tag}
                                </span>
                                ))}
                            </div>
                            <div className="flex items-center text-reformed-600 dark:text-reformed-400 font-sans text-sm font-bold group-hover:text-reformed-800 dark:group-hover:text-reformed-200 group-hover:translate-x-1 transition-all">
                                Open Reader <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};
