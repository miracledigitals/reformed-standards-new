
import { SavedItem } from '../types';

const STORAGE_KEY = 'reformed-study-notebook';

export const getSavedItems = (): SavedItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from local storage", error);
    return [];
  }
};

export const saveItem = (item: Omit<SavedItem, 'id' | 'timestamp'>): SavedItem => {
  const items = getSavedItems();
  
  // Check if already exists based on refId and type
  const existing = items.find(i => i.refId === item.refId && i.type === item.type);
  if (existing) return existing;

  const newItem: SavedItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  const updatedItems = [newItem, ...items];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
  return newItem;
};

export const removeItem = (id: string) => {
  const items = getSavedItems();
  const updatedItems = items.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
};

export const updateNote = (id: string, note: string) => {
  const items = getSavedItems();
  const updatedItems = items.map(i => {
    if (i.id === id) {
      return { ...i, userNotes: note };
    }
    return i;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
};

export const isItemSaved = (refId: string, type: string): boolean => {
    const items = getSavedItems();
    return items.some(i => i.refId === refId && i.type === type);
};
