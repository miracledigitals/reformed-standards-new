
import React, { useState, useEffect } from 'react';
import { THEOLOGIANS } from '../constants';
import { User, Scroll, MapPin, RotateCcw, Bookmark } from 'lucide-react';
import { saveItem, removeItem, getSavedItems } from '../services/storageService';

export const Theologians: React.FC = () => {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const items = getSavedItems();
    setSavedIds(items.filter(i => i.type === 'theologian').map(i => i.refId));
  }, []);

  const handleToggleSave = (id: string, name: string) => {
    const isSaved = savedIds.includes(id);
    
    if (isSaved) {
        const items = getSavedItems();
        const itemToRemove = items.find(i => i.refId === id && i.type === 'theologian');
        if (itemToRemove) {
            removeItem(itemToRemove.id);
            setSavedIds(prev => prev.filter(sid => sid !== id));
        }
    } else {
        saveItem({
            type: 'theologian',
            refId: id,
            title: name,
            subtitle: 'Theologian',
            tags: [],
            userNotes: ''
        });
        setSavedIds(prev => [...prev, id]);
    }
  };

  // Group theologians by century
  const groupedTheologians = THEOLOGIANS.reduce((acc, theologian) => {
    if (!acc[theologian.century]) {
      acc[theologian.century] = [];
    }
    acc[theologian.century].push(theologian);
    return acc;
  }, {} as Record<string, typeof THEOLOGIANS>);

  const centuries = ["16th Century", "17th Century", "18th Century", "19th Century", "20th Century"];

  const handleRefresh = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-4 transition-colors">
          Hall of Theologians
        </h2>
        <p className="text-lg text-reformed-700 dark:text-reformed-200 max-w-2xl mx-auto font-serif transition-colors">
          The giants of the faith who shaped Reformed theology through the centuries, from the Reformation to the modern era.
        </p>
      </div>

      <div className="space-y-16">
        {centuries.map((century) => (
          groupedTheologians[century] && (
            <div key={century} className="relative">
              <div className="flex items-center mb-8">
                <div className="flex-grow border-t border-reformed-300 dark:border-reformed-700"></div>
                <h3 className="mx-4 text-2xl font-display font-bold text-reformed-800 dark:text-reformed-200 bg-reformed-50 dark:bg-reformed-950 px-4 transition-colors">
                  {century}
                </h3>
                <div className="flex-grow border-t border-reformed-300 dark:border-reformed-700"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedTheologians[century].map((theologian) => (
                  <div key={theologian.id} className="bg-white dark:bg-reformed-900 rounded-lg shadow-sm hover:shadow-md transition-all border border-reformed-200 dark:border-reformed-800 overflow-hidden flex flex-col relative group">
                    <div className="p-6">
                       {/* Bookmark Button */}
                       <button 
                        onClick={() => handleToggleSave(theologian.id, theologian.name)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-reformed-100 dark:hover:bg-reformed-800 transition-colors z-10"
                        title={savedIds.includes(theologian.id) ? "Remove Bookmark" : "Bookmark Theologian"}
                      >
                         <Bookmark className={`w-5 h-5 transition-all ${savedIds.includes(theologian.id) ? "fill-reformed-800 text-reformed-800 dark:fill-reformed-200 dark:text-reformed-200" : "text-reformed-300"}`} />
                      </button>

                      <div className="flex justify-between items-start mb-4 pr-8">
                        <h4 className="text-xl font-display font-bold text-reformed-900 dark:text-reformed-100">
                          {theologian.name}
                        </h4>
                      </div>
                      <span className="text-xs font-sans bg-reformed-100 dark:bg-reformed-800 text-reformed-700 dark:text-reformed-300 px-2 py-1 rounded-full mb-4 inline-block">
                          {theologian.dates}
                        </span>
                      
                      <div className="flex items-center text-sm text-reformed-600 dark:text-reformed-400 mb-4 italic">
                         <MapPin className="w-4 h-4 mr-1" />
                         {theologian.origin}
                      </div>

                      <p className="text-reformed-800 dark:text-reformed-200 font-serif text-sm mb-6 leading-relaxed">
                        {theologian.description}
                      </p>

                      <div className="bg-reformed-50 dark:bg-reformed-950 rounded p-4 border border-reformed-100 dark:border-reformed-800 mt-auto">
                        <div className="flex items-center text-xs font-bold text-reformed-500 dark:text-reformed-400 uppercase tracking-wider mb-2">
                          <Scroll className="w-3 h-3 mr-1" />
                          Key Works
                        </div>
                        <ul className="space-y-1">
                          {theologian.works.map((work, idx) => (
                            <li key={idx} className="text-sm text-reformed-900 dark:text-reformed-300 font-serif italic">
                              "{work}"
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};
