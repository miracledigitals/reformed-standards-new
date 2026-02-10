
export interface Confession {
  id: string;
  title: string;
  shortTitle: string;
  date: string;
  author: string;
  description: string;
  tags: string[];
  structure: string;
}

export interface Theologian {
  id: string;
  name: string;
  dates: string;
  origin: string;
  century: string;
  works: string[];
  description: string;
}

export interface BibleVersion {
  id: string;
  title: string;
  shortTitle: string;
  date: string;
  description: string;
  tags: string[];
}

export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'Old' | 'New';
  category: 'Pentateuch' | 'History' | 'Wisdom' | 'Major Prophets' | 'Minor Prophets' | 'Gospels' | 'History (NT)' | 'Pauline Epistles' | 'General Epistles' | 'Prophecy';
}

export interface Hymn {
  id: string;
  title: string;
  author: string;
  date: string;
  description: string;
  tags: string[];
}

export interface GroundingMetadata {
  groundingChunks?: Array<{
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  groundingMetadata?: GroundingMetadata;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  STREAMING = 'STREAMING',
}

export type ConnectionType = 'leads_to' | 'supports' | 'explains' | 'contrasts';
export type DoctrinalCategory = 'Theology Proper' | 'Anthropology' | 'Christology' | 'Soteriology' | 'Ecclesiology' | 'Eschatology' | 'Bibliology' | 'Covenant Theology';

export interface DoctrinalConnection {
  id: string;
  source: {
    title: string;
    description: string;
    category: DoctrinalCategory;
  };
  target: {
    title: string;
    description: string;
    category: DoctrinalCategory;
  };
  type: ConnectionType;
  reasoning: string;
}

export interface SavedItem {
  id: string;
  type: 'confession' | 'scripture' | 'hymn' | 'theologian' | 'devotional' | 'study' | 'connection' | 'systematic' | 'cross-reference';
  refId: string; // The ID used for navigation lookup
  title: string;
  subtitle: string;
  userNotes: string;
  timestamp: number;
  tags: string[];
  content?: string; // Optional field to store generated content
  isOffline?: boolean; // Flag for offline availability
}
