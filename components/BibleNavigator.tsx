
import React, { useState, useEffect } from 'react';
import { BIBLE_BOOKS } from '../constants';
import { BibleVersion, BibleBook } from '../types';
import { ChevronLeft, BookOpen, ArrowRight, Plus, List, Trash2, Library, RotateCcw, Split, Bookmark, ExternalLink } from 'lucide-react';
import { saveItem, isItemSaved, removeItem, getSavedItems } from '../services/storageService';
import { BIBLE_APPS } from '../services/bibleLinkService';

interface BibleNavigatorProps {
  activeVersion: BibleVersion;
  onSearch: (prompt: string) => void;
  onBack: () => void;
}

interface SelectedPassage {
  id: string; // unique ID for list key
  label: string; // "Genesis 1:1" or "Genesis 1"
  query: string; // "Read Genesis 1:1 from ESV verbatim"
  type: 'passage' | 'divider';
}

export const BibleNavigator: React.FC<BibleNavigatorProps> = ({ activeVersion, onSearch, onBack }) => {
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [readingList, setReadingList] = useState<SelectedPassage[]>([]);
  const [isChapterSaved, setIsChapterSaved] = useState(false);
  const [showExternalMenu, setShowExternalMenu] = useState(false);

  // Update save status when selection changes
  useEffect(() => {
      if (selectedBook && selectedChapter) {
          const refId = `${selectedBook.name}-${selectedChapter}`;
          setIsChapterSaved(isItemSaved(refId, 'scripture'));
      }
  }, [selectedBook, selectedChapter]);

  const handleToggleChapterSave = () => {
    if (!selectedBook || !selectedChapter) return;
    const refId = `${selectedBook.name}-${selectedChapter}`;
    const title = `${selectedBook.name} ${selectedChapter}`;

    if (isChapterSaved) {
        // Find ID to delete
        const items = getSavedItems();
        const item = items.find(i => i.refId === refId && i.type === 'scripture');
        if (item) removeItem(item.id);
        setIsChapterSaved(false);
    } else {
        saveItem({
            type: 'scripture',
            refId: refId,
            title: title,
            subtitle: activeVersion.shortTitle,
            tags: [selectedBook.testament, selectedBook.category],
            userNotes: ''
        });
        setIsChapterSaved(true);
    }
  };

  // Group books by category/testament for cleaner UI
  const groupedBooks = BIBLE_BOOKS.reduce((acc, book) => {
    if (!acc[book.testament]) {
      acc[book.testament] = [];
    }
    acc[book.testament].push(book);
    return acc;
  }, {} as Record<string, BibleBook[]>);

  const handleRefresh = () => {
    setSelectedBook(null);
    setSelectedChapter(null);
    setReadingList([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBooks = () => {
    setSelectedBook(null);
    setSelectedChapter(null);
  };

  const addToReadingList = (label: string, querySegment: string) => {
    const newItem: SelectedPassage = {
        id: Date.now().toString() + Math.random().toString(),
        label,
        query: querySegment,
        type: 'passage'
    };
    setReadingList(prev => [...prev, newItem]);
  };

  const addDivider = () => {
    // Prevent adding divider if list is empty or last item is already a divider
    if (readingList.length === 0 || readingList[readingList.length - 1].type === 'divider') return;
    
    setReadingList(prev => [...prev, {
        id: Date.now().toString() + Math.random().toString(),
        label: '———',
        query: '',
        type: 'divider'
    }]);
  };

  const removeFromList = (id: string) => {
    setReadingList(prev => prev.filter(item => item.id !== id));
  };

  const clearList = () => {
    setReadingList([]);
  };

  const handleExecuteSearch = () => {
    if (readingList.length === 0) return;
    
    const hasDividers = readingList.some(item => item.type === 'divider');
    let prompt = "";

    if (hasDividers) {
        // Group items by divider to create distinct sections
        const groups: string[][] = [];
        let currentGroup: string[] = [];

        readingList.forEach(item => {
            if (item.type === 'divider') {
                if (currentGroup.length > 0) {
                    groups.push(currentGroup);
                    currentGroup = [];
                }
            } else {
                currentGroup.push(item.label);
            }
        });
        if (currentGroup.length > 0) groups.push(currentGroup);

        const groupStrings = groups.map(g => g.join(', '));
        
        prompt = `Read the following scripture groups from the ${activeVersion.title} verbatim.
        
        ${groupStrings.map((g, i) => `Section ${i+1}: ${g}`).join('\n')}
        
        IMPORTANT: Provide the text for each Section sequentially. Insert a horizontal rule (---) between each Section to clearly act as a divider.`;
    } else {
        // Flat list
        const references = readingList.map(item => item.label).join(', ');
        prompt = `Read the following scriptures from the ${activeVersion.title} verbatim: ${references}. \n\nIMPORTANT: Provide the text for each passage sequentially.`;
    }

    onSearch(prompt);
  };

  // Quick read single chapter (bypasses list if list is empty, otherwise adds to list)
  const handleReadFullChapter = () => {
    if (selectedBook && selectedChapter) {
        if (readingList.length > 0) {
            addToReadingList(
                `${selectedBook.name} ${selectedChapter}`,
                `${selectedBook.name} Chapter ${selectedChapter}`
            );
        } else {
            const prompt = `Read ${selectedBook.name} Chapter ${selectedChapter} from the ${activeVersion.title}. Provide the full chapter text verbatim.`;
            onSearch(prompt);
        }
    }
  }

  // Add chapter to queue explicit button
  const handleQueueChapter = () => {
     if (selectedBook && selectedChapter) {
        addToReadingList(
            `${selectedBook.name} ${selectedChapter}`, 
            `${selectedBook.name} Chapter ${selectedChapter}`
        );
     }
  }

  const handleToggleVerse = (verse: number) => {
     if (!selectedBook || !selectedChapter) return;
     
     const label = `${selectedBook.name} ${selectedChapter}:${verse}`;
     const existingIndex = readingList.findIndex(item => item.label === label);

     if (existingIndex >= 0) {
         // Remove if already selected
         const newList = [...readingList];
         newList.splice(existingIndex, 1);
         setReadingList(newList);
     } else {
         // Add
         addToReadingList(label, label);
     }
  };

  const isVerseSelected = (verse: number) => {
     if (!selectedBook || !selectedChapter) return false;
     return readingList.some(item => item.label === `${selectedBook.name} ${selectedChapter}:${verse}`);
  };

  // Bottom Floating Bar for Reading List
  const ReadingListBar = () => {
      if (readingList.length === 0) return null;

      return (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-[90%] max-w-2xl z-50 animate-in slide-in-from-bottom-4">
              <div className="bg-reformed-900 text-white rounded-xl shadow-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border border-reformed-700 ring-4 ring-reformed-900/20">
                  <div className="flex items-center overflow-hidden w-full sm:w-auto">
                      <div className="bg-reformed-700 p-2 rounded-lg mr-3 shrink-0 relative">
                          <List className="w-5 h-5" />
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                          </span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-sm">Reading Queue ({readingList.filter(i => i.type === 'passage').length})</span>
                          <span className="text-xs text-reformed-300 truncate flex items-center gap-1">
                              {readingList.map((item, i) => (
                                <React.Fragment key={item.id}>
                                    <span className={item.type === 'divider' ? 'text-amber-500 font-bold px-1' : ''}>
                                        {item.type === 'divider' ? '||' : item.label}
                                    </span>
                                    {i < readingList.length - 1 && item.type !== 'divider' && readingList[i+1].type !== 'divider' && (
                                        <span>, </span>
                                    )}
                                </React.Fragment>
                              ))}
                          </span>
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto grid grid-cols-4 sm:flex">
                      <button 
                        onClick={addDivider}
                        className={`p-2 rounded-lg transition-colors flex justify-center ${
                            readingList[readingList.length - 1]?.type === 'divider'
                            ? 'text-reformed-600 cursor-not-allowed'
                            : 'text-reformed-400 hover:text-white hover:bg-reformed-800'
                        }`}
                        title="Add Divider / Split Group"
                        disabled={readingList[readingList.length - 1]?.type === 'divider'}
                      >
                          <Split className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={clearList}
                        className="p-2 text-reformed-400 hover:text-red-400 hover:bg-reformed-800 rounded-lg transition-colors flex justify-center"
                        title="Clear List"
                      >
                          <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleExecuteSearch}
                        className="col-span-2 sm:flex-1 flex items-center justify-center bg-white text-reformed-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-reformed-100 transition-colors shadow-sm"
                      >
                          Read All <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                  </div>
              </div>
          </div>
      );
  };


  // Step 1: Select Book
  if (!selectedBook) {
    return (
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-32">
        <div className="flex items-center mb-6 sm:mb-8 justify-between sticky top-0 bg-reformed-50 dark:bg-reformed-950 py-2 z-10">
            <div className="flex items-center">
                <button 
                    onClick={onBack}
                    className="mr-2 sm:mr-4 p-2 rounded-full hover:bg-reformed-200 dark:hover:bg-reformed-800 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-reformed-700 dark:text-reformed-300" />
                </button>
                <div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-reformed-900 dark:text-reformed-50">
                        {activeVersion.shortTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-reformed-500 dark:text-reformed-400 font-serif">Select a Book</p>
                </div>
            </div>
            <button
                onClick={handleRefresh}
                className="p-2 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
                title="Reset Navigation"
            >
                <RotateCcw className="w-5 h-5" />
            </button>
        </div>

        <div className="space-y-8 sm:space-y-12">
            {['Old', 'New'].map((testament) => (
                <div key={testament}>
                     <div className="flex items-center mb-4 sm:mb-6">
                        <div className="flex-grow border-t border-reformed-300 dark:border-reformed-700"></div>
                        <h3 className="mx-4 text-lg sm:text-xl font-display font-bold text-reformed-800 dark:text-reformed-200 bg-reformed-50 dark:bg-reformed-950 px-4">
                        {testament} Testament
                        </h3>
                        <div className="flex-grow border-t border-reformed-300 dark:border-reformed-700"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {groupedBooks[testament].map((book) => (
                            <button
                                key={book.name}
                                onClick={() => handleBookSelect(book)}
                                className="p-4 bg-white dark:bg-reformed-900 border border-reformed-200 dark:border-reformed-800 rounded-lg active:bg-reformed-100 dark:active:bg-reformed-800 hover:shadow-md hover:border-reformed-400 dark:hover:border-reformed-500 transition-all text-left group touch-manipulation"
                            >
                                <div className="font-display font-bold text-reformed-900 dark:text-reformed-100 group-hover:text-reformed-700 dark:group-hover:text-white">
                                    {book.name}
                                </div>
                                <div className="text-xs text-reformed-500 dark:text-reformed-400 mt-1">
                                    {book.chapters} Chapters
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
        <ReadingListBar />
      </div>
    );
  }

  // Step 2: Select Chapter
  if (selectedBook && !selectedChapter) {
     return (
        <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-32">
            <div className="flex items-center justify-between mb-6 sm:mb-8 sticky top-0 bg-reformed-50 dark:bg-reformed-950 py-2 z-10">
                <div className="flex items-center">
                    <button 
                        onClick={() => setSelectedBook(null)}
                        className="mr-2 sm:mr-4 p-2 rounded-full hover:bg-reformed-200 dark:hover:bg-reformed-800 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-reformed-700 dark:text-reformed-300" />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-display font-bold text-reformed-900 dark:text-reformed-50">
                            {selectedBook.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-reformed-500 dark:text-reformed-400 font-serif">Select a Chapter</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    className="p-2 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
                    title="Reset Navigation"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                    <button
                        key={chapter}
                        onClick={() => handleChapterSelect(chapter)}
                        className="aspect-square flex items-center justify-center bg-white dark:bg-reformed-900 border border-reformed-200 dark:border-reformed-800 rounded-lg active:bg-reformed-800 active:text-white dark:active:bg-reformed-700 hover:bg-reformed-800 hover:text-white dark:hover:bg-reformed-700 hover:border-reformed-800 transition-all font-display font-bold text-lg text-reformed-800 dark:text-reformed-200 shadow-sm touch-manipulation"
                    >
                        {chapter}
                    </button>
                ))}
            </div>
            <ReadingListBar />
        </div>
     );
  }

  // Step 3: Select Verse (or Read Chapter)
  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-32">
        <div className="flex items-center justify-between mb-6 sm:mb-8 sticky top-0 bg-reformed-50 dark:bg-reformed-950 py-2 z-10">
            <div className="flex items-center">
                <button 
                    onClick={() => setSelectedChapter(null)}
                    className="mr-2 sm:mr-4 p-2 rounded-full hover:bg-reformed-200 dark:hover:bg-reformed-800 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-reformed-700 dark:text-reformed-300" />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-2xl font-display font-bold text-reformed-900 dark:text-reformed-50">
                            {selectedBook?.name} {selectedChapter}
                        </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-reformed-500 dark:text-reformed-400 font-serif">Select verses</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {/* Shortcut to Books */}
                <button 
                    onClick={handleBackToBooks}
                    className="hidden sm:flex items-center px-3 py-1.5 bg-reformed-100 dark:bg-reformed-800 text-reformed-600 dark:text-reformed-300 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-reformed-200 dark:hover:bg-reformed-700 transition-colors"
                >
                    <Library className="w-3 h-3 mr-1.5" />
                    Books
                </button>
                <button
                    onClick={handleRefresh}
                    className="p-2 text-reformed-400 hover:text-reformed-700 dark:text-reformed-500 dark:hover:text-reformed-200 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
                    title="Reset Navigation"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="bg-white dark:bg-reformed-900 p-4 sm:p-6 rounded-lg shadow-sm border border-reformed-200 dark:border-reformed-800 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-reformed-900 dark:text-reformed-100 mb-1">Full Chapter</h3>
                <p className="text-sm text-reformed-600 dark:text-reformed-400">Read the entire chapter.</p>
             </div>
             <div className="flex items-center gap-2 w-full sm:w-auto relative">
                <button
                    onClick={handleToggleChapterSave}
                    className={`p-3 rounded-full transition-colors ${
                        isChapterSaved 
                        ? 'bg-reformed-800 text-white hover:bg-reformed-700' 
                        : 'bg-reformed-100 dark:bg-reformed-800 text-reformed-700 dark:text-reformed-300 hover:bg-reformed-200 dark:hover:bg-reformed-700'
                    }`}
                    title={isChapterSaved ? "Remove Bookmark" : "Bookmark Chapter"}
                >
                    <Bookmark className={`w-5 h-5 ${isChapterSaved ? 'fill-current' : ''}`} />
                </button>

                <div className="relative">
                   <button
                        onClick={() => setShowExternalMenu(!showExternalMenu)}
                        className="p-3 bg-reformed-100 dark:bg-reformed-800 text-reformed-700 dark:text-reformed-300 rounded-full hover:bg-reformed-200 dark:hover:bg-reformed-700 transition-colors"
                        title="Study in External App"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                    {showExternalMenu && (
                        <div className="absolute bottom-full mb-2 right-0 w-48 bg-white dark:bg-reformed-900 rounded-xl shadow-2xl border border-reformed-200 dark:border-reformed-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
                             <div className="px-4 py-2 border-b border-reformed-100 dark:border-reformed-800 mb-1">
                                <span className="text-[10px] font-bold text-reformed-400 uppercase tracking-widest">Study Tools</span>
                             </div>
                             {BIBLE_APPS.map(app => (
                                <a 
                                    key={app.id}
                                    href={app.generateUrl(`${selectedBook.name} ${selectedChapter}`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 text-sm hover:bg-reformed-50 dark:hover:bg-reformed-800 transition-colors"
                                    style={{ color: app.color }}
                                    onClick={() => setShowExternalMenu(false)}
                                >
                                    {app.name}
                                </a>
                             ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleQueueChapter}
                    className="p-3 bg-reformed-100 dark:bg-reformed-800 text-reformed-700 dark:text-reformed-300 rounded-full hover:bg-reformed-200 dark:hover:bg-reformed-700 transition-colors"
                    title="Add Chapter to Queue"
                >
                    <Plus className="w-5 h-5" />
                </button>
                <button
                    onClick={handleReadFullChapter}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-reformed-800 text-white rounded-full hover:bg-reformed-700 transition-colors shadow-md text-sm font-bold"
                >
                    Read Now <ArrowRight className="w-4 h-4 ml-2" />
                </button>
             </div>
        </div>

        <div className="relative">
            <div className="flex items-center mb-4">
                <div className="flex-grow border-t border-reformed-300 dark:border-reformed-700"></div>
                <h3 className="mx-4 text-xs font-bold text-reformed-500 dark:text-reformed-400 uppercase tracking-widest">
                   Select Verses
                </h3>
                <div className="flex-grow border-t border-reformed-300 dark:border-reformed-700"></div>
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
                {Array.from({ length: 60 }, (_, i) => i + 1).map((verse) => {
                    const selected = isVerseSelected(verse);
                    return (
                        <button
                            key={verse}
                            onClick={() => handleToggleVerse(verse)}
                            className={`
                                aspect-square flex items-center justify-center rounded transition-all text-sm font-mono border touch-manipulation
                                ${selected 
                                    ? 'bg-reformed-800 text-white border-reformed-800 shadow-md transform scale-105' 
                                    : 'bg-white dark:bg-reformed-900 border-reformed-100 dark:border-reformed-800 text-reformed-600 dark:text-reformed-400 active:bg-reformed-100 dark:active:bg-reformed-800 hover:bg-reformed-100 dark:hover:bg-reformed-800'
                                }
                            `}
                        >
                            {verse}
                        </button>
                    );
                })}
            </div>
            <p className="mt-4 text-xs text-center text-reformed-400 italic">
                *Select multiple verses to add them to your reading queue.
            </p>
        </div>
        <ReadingListBar />
    </div>
  );
};
