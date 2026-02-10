
/**
 * Utility to generate deep links for external Bible study applications.
 */

const BOOK_MAPPING: Record<string, string> = {
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM", "Deuteronomy": "DEU",
  "Joshua": "JSH", "Judges": "JDG", "Ruth": "RUT", "1 Samuel": "1SA", "2 Samuel": "2SA",
  "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH",
  "Ezra": "EZR", "Nehemiah": "NEH", "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Psalm": "PSA",
  "Proverbs": "PRO", "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA",
  "Jeremiah": "JER", "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
  "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON", "Micah": "MIC", "Nahum": "NAM",
  "Habakkuk": "HAB", "Zephaniah": "ZEP", "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
  "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT", "Romans": "ROM",
  "1 Corinthians": "1CO", "2 Corinthians": "2CO", "Galatians": "GAL", "Ephesians": "EPH",
  "Philippians": "PHP", "Colossians": "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
  "1 Timothy": "1TI", "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
  "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JO", "2 John": "2JO",
  "3 John": "3JO", "Jude": "JUD", "Revelation": "REV"
};

export interface BibleAppConfig {
  id: string;
  name: string;
  generateUrl: (ref: string) => string;
  color: string;
}

const parseRef = (ref: string) => {
  // Regex to extract Book, Chapter, Verse from strings like "John 3:16" or "1 Peter 1:3-5"
  const regex = /((?:\d\s)?[A-Za-z\s]+)\s+(\d+)(?::(\d+))?/;
  const match = ref.match(regex);
  if (!match) return null;

  return {
    book: match[1].trim(),
    chapter: match[2],
    verse: match[3] || "1",
    shortBook: BOOK_MAPPING[match[1].trim()] || match[1].trim().substring(0, 3).toUpperCase()
  };
};

export const BIBLE_APPS: BibleAppConfig[] = [
  {
    id: 'logos',
    name: 'Logos',
    color: '#004C91',
    generateUrl: (ref) => {
      const p = parseRef(ref);
      if (!p) return `logosres:bible;ref=${ref}`;
      // Format: logosres:bible;ref=Bible.JHN3.16
      return `logosres:bible;ref=Bible.${p.shortBook}${p.chapter}.${p.verse}`;
    }
  },
  {
    id: 'olivetree',
    name: 'Olive Tree',
    color: '#2D5A27',
    generateUrl: (ref) => {
      const p = parseRef(ref);
      if (!p) return `olivetree://bible/${ref}`;
      // Format: olivetree://bible/John.3.16
      return `olivetree://bible/${p.book.replace(/\s+/g, '')}.${p.chapter}.${p.verse}`;
    }
  },
  {
    id: 'youversion',
    name: 'YouVersion',
    color: '#654B3E',
    generateUrl: (ref) => {
      const p = parseRef(ref);
      if (!p) return `https://www.bible.com/search/bible?q=${encodeURIComponent(ref)}`;
      // Format: https://www.bible.com/bible/111/JHN.3.16 (111 is NIV, 59 is ESV)
      return `https://www.bible.com/bible/59/${p.shortBook}.${p.chapter}.${p.verse}`;
    }
  },
  {
    id: 'blueletter',
    name: 'Blue Letter',
    color: '#34495E',
    generateUrl: (ref) => `https://www.blueletterbible.org/search/preSearch.cfm?Criteria=${encodeURIComponent(ref)}`
  }
];
