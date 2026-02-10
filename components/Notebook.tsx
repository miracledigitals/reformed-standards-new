
import React, { useState, useEffect } from 'react';
import { getSavedItems, removeItem, updateNote } from '../services/storageService';
import { SavedItem } from '../types';
// Added 'Check' to the imports from lucide-react
import { Bookmark, Trash2, Edit2, Save, BookOpen, Music, Users, Scroll, Calendar, Layers, Network, Coffee, GraduationCap, ChevronDown, ChevronUp, Maximize2, X, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { commonMarkdownComponents } from './MarkdownComponents';

export const Notebook: React.FC = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null);
  const [fullscreenItem, setFullscreenItem] = useState<SavedItem | null>(null);

  useEffect(() => {
    setItems(getSavedItems());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this bookmark?')) {
      removeItem(id);
      setItems(getSavedItems());
    }
  };

  const startEditing = (item: SavedItem) => {
    setEditingId(item.id);
    setNoteContent(item.userNotes);
  };

  const saveNote = (id: string) => {
    updateNote(id, noteContent);
    setItems(getSavedItems());
    setEditingId(null);
  };

  const toggleContent = (id: string) => {
      if (expandedContentId === id) {
          setExpandedContentId(null);
      } else {
          setExpandedContentId(id);
      }
  }

  const filteredItems = filter === 'All' ? items : items.filter(i => i.type === filter);

  const getIcon = (type: string) => {
      switch(type) {
          case 'confession': return <Scroll className="w-5 h-5" />;
          case 'scripture': return <BookOpen className="w-5 h-5" />;
          case 'hymn': return <Music className="w-5 h-5" />;
          case 'theologian': return <Users className="w-5 h-5" />;
          case 'devotional': return <Coffee className="w-5 h-5" />;
          case 'study': return <GraduationCap className="w-5 h-5" />;
          case 'systematic': return <Layers className="w-5 h-5" />;
          case 'connection': return <Network className="w-5 h-5" />;
          default: return <Bookmark className="w-5 h-5" />;
      }
  };

  const formatDate = (ts: number) => {
      return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto min-h-screen">
      
      {/* Fullscreen Reader Mode */}
      {fullscreenItem && (
          <div className="fixed inset-0 z-[100] bg-reformed-50 dark:bg-reformed-950 overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
              <div className="max-w-4xl mx-auto p-6 sm:p-12 relative">
                  <button 
                    onClick={() => setFullscreenItem(null)}
                    className="fixed top-6 right-6 p-3 bg-reformed-800 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                  >
                      <X className="w-6 h-6" />
                  </button>
                  <div className="mb-12 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-reformed-100 dark:bg-reformed-800 text-reformed-600 dark:text-reformed-400 text-xs font-bold uppercase tracking-widest mb-4">
                          Offline Reader
                      </div>
                      <h1 className="text-3xl sm:text-5xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-4">{fullscreenItem.title}</h1>
                      <p className="font-serif italic text-reformed-600 dark:text-reformed-400">{fullscreenItem.subtitle}</p>
                  </div>
                  <div className="bg-white dark:bg-reformed-900 p-8 sm:p-16 rounded-2xl shadow-sm border border-reformed-200 dark:border-reformed-800">
                      <ReactMarkdown components={commonMarkdownComponents}>
                          {fullscreenItem.content || ''}
                      </ReactMarkdown>
                  </div>
                  <div className="mt-12 text-center text-xs font-bold text-reformed-400 uppercase tracking-widest pb-12">
                      End of Document • Soli Deo Gloria
                  </div>
              </div>
          </div>
      )}

      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-4">
          My Bookmarks
        </h2>
        <p className="text-lg text-reformed-700 dark:text-reformed-200 font-serif">
          Your saved passages, confessions, and theological insights.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['All', 'confession', 'scripture', 'hymn', 'theologian', 'devotional', 'study', 'systematic', 'connection'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide transition-all ${
                    filter === f 
                    ? 'bg-reformed-800 text-white shadow-md' 
                    : 'bg-white dark:bg-reformed-900 text-reformed-500 hover:bg-reformed-100 dark:hover:bg-reformed-800'
                }`}
              >
                  {f === 'All' ? 'All Items' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
          ))}
      </div>

      {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-reformed-900 rounded-xl border border-dashed border-reformed-300 dark:border-reformed-700">
              <Bookmark className="w-12 h-12 mx-auto text-reformed-300 mb-4" />
              <p className="text-reformed-500 dark:text-reformed-400">No items saved yet.</p>
              <p className="text-sm text-reformed-400 mt-2">Explore the library and click the bookmark icon to save items.</p>
          </div>
      ) : (
          <div className="grid gap-6">
              {filteredItems.map(item => (
                  <div key={item.id} className={`bg-white dark:bg-reformed-900 rounded-xl shadow-sm border transition-shadow overflow-hidden ${item.isOffline ? 'border-green-200 dark:border-green-900/30 ring-1 ring-green-100 dark:ring-green-900/10' : 'border-reformed-200 dark:border-reformed-800'}`}>
                      <div className="p-6 flex flex-col md:flex-row gap-6">
                          {/* Icon Column */}
                          <div className="shrink-0 flex flex-col items-center">
                              <div className={`p-3 rounded-full mb-2 ${item.isOffline ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-reformed-50 dark:bg-reformed-800 text-reformed-600 dark:text-reformed-300'}`}>
                                  {getIcon(item.type)}
                              </div>
                              <span className={`text-[10px] uppercase font-bold ${item.isOffline ? 'text-green-600' : 'text-reformed-400'}`}>
                                  {item.isOffline ? 'Offline' : item.type}
                              </span>
                          </div>

                          {/* Content Column */}
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <h3 className="text-xl font-display font-bold text-reformed-900 dark:text-reformed-100 flex items-center">
                                          {item.title}
                                          {item.isOffline && <Check className="w-4 h-4 ml-2 text-green-600" />}
                                      </h3>
                                      <p className="text-sm text-reformed-500 dark:text-reformed-400 font-serif italic">
                                          {item.subtitle}
                                      </p>
                                  </div>
                                  <div className="flex items-center text-xs text-reformed-400">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatDate(item.timestamp)}
                                  </div>
                              </div>
                              
                              {/* Tags */}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {item.tags.map(tag => (
                                        <span key={tag} className={`px-2 py-0.5 rounded-full uppercase tracking-wide font-bold text-[10px] ${tag === 'Offline' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-reformed-100 dark:bg-reformed-800 text-reformed-600 dark:text-reformed-400'}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                              )}

                              {/* Saved Content Toggle (for generated items) */}
                              {item.content && (
                                  <div className="mb-4">
                                      <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => toggleContent(item.id)}
                                            className="flex items-center text-xs font-bold text-reformed-600 dark:text-reformed-400 hover:text-reformed-900 dark:hover:text-reformed-100 transition-colors uppercase tracking-wider"
                                        >
                                            {expandedContentId === item.id ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                                            {expandedContentId === item.id ? 'Hide Content' : 'View Saved Content'}
                                        </button>
                                        
                                        {item.isOffline && (
                                            <button 
                                                onClick={() => setFullscreenItem(item)}
                                                className="flex items-center text-xs font-bold text-reformed-800 dark:text-reformed-200 hover:scale-105 transition-all uppercase tracking-wider bg-reformed-100 dark:bg-reformed-800 px-3 py-1 rounded-md"
                                            >
                                                <Maximize2 className="w-3 h-3 mr-2" />
                                                Open Reader
                                            </button>
                                        )}
                                      </div>
                                      
                                      {expandedContentId === item.id && (
                                          <div className="mt-3 p-4 bg-reformed-50 dark:bg-reformed-950/50 rounded-lg border border-reformed-100 dark:border-reformed-800 animate-in slide-in-from-top-2">
                                              <div className="max-w-none line-clamp-[10] overflow-hidden relative">
                                                  <ReactMarkdown
                                                    components={commonMarkdownComponents}
                                                  >
                                                      {item.content}
                                                  </ReactMarkdown>
                                                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-reformed-50 dark:from-reformed-950/50 to-transparent pointer-events-none" />
                                              </div>
                                              <button 
                                                onClick={() => setFullscreenItem(item)}
                                                className="mt-2 w-full py-2 text-xs font-bold text-reformed-700 bg-reformed-100 dark:bg-reformed-800 rounded-md"
                                              >
                                                  Read Full Document
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              )}
                              
                              {/* Notes Section */}
                              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-4 border border-amber-100 dark:border-amber-900/30">
                                  {editingId === item.id ? (
                                      <div className="space-y-3">
                                          <textarea 
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            className="w-full bg-white dark:bg-reformed-900 border border-reformed-300 dark:border-reformed-700 rounded-md p-3 text-sm font-serif focus:ring-2 focus:ring-reformed-500 focus:outline-none min-h-[100px]"
                                            placeholder="Add your study notes here..."
                                          />
                                          <div className="flex justify-end gap-2">
                                              <button 
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1.5 text-xs font-bold text-reformed-500 hover:text-reformed-800 transition-colors"
                                              >
                                                  Cancel
                                              </button>
                                              <button 
                                                onClick={() => saveNote(item.id)}
                                                className="flex items-center px-4 py-1.5 bg-reformed-800 text-white rounded-md text-xs font-bold hover:bg-reformed-700 transition-colors"
                                              >
                                                  <Save className="w-3 h-3 mr-1.5" /> Save Note
                                              </button>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="group/note relative">
                                          <p className={`text-sm font-serif text-reformed-700 dark:text-reformed-300 whitespace-pre-wrap ${!item.userNotes ? 'italic opacity-60' : ''}`}>
                                              {item.userNotes || "No notes added. Click to edit."}
                                          </p>
                                          <button 
                                            onClick={() => startEditing(item)}
                                            className="absolute top-0 right-0 p-1 text-reformed-400 hover:text-reformed-700 opacity-0 group-hover/note:opacity-100 transition-opacity"
                                            title="Edit Note"
                                          >
                                              <Edit2 className="w-3 h-3" />
                                          </button>
                                      </div>
                                  )}
                              </div>
                          </div>

                          {/* Actions Column */}
                          <div className="flex md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-reformed-100 dark:border-reformed-800 pt-4 md:pt-0 md:pl-4">
                              <button 
                                onClick={() => startEditing(item)}
                                className="p-2 text-reformed-400 hover:text-reformed-700 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
                                title="Edit Note"
                              >
                                  <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-reformed-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                title="Remove Bookmark"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};
