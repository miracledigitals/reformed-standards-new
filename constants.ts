
import { Confession, Theologian, BibleVersion, Hymn, BibleBook, DoctrinalConnection } from "./types";

export const SYSTEMATIC_THEOLOGY_STRUCTURE = [
  {
    category: "Bibliology (The Word)",
    topics: ["Divine Inspiration", "Inerrancy & Infallibility", "The Canon of Scripture", "Sufficiency of Scripture", "Perspicuity (Clarity)", "Sola Scriptura"]
  },
  {
    category: "Theology Proper (God)",
    topics: ["The Existence of God", "Divine Attributes", "The Holy Trinity", "Divine Sovereignty", "The Decrees of God", "Creation", "Divine Providence"]
  },
  {
    category: "Anthropology (Man)",
    topics: ["The Image of God", "Covenant of Works", "The Fall of Man", "Original Sin", "Total Depravity", "The Bondage of the Will"]
  },
  {
    category: "Christology (Christ)",
    topics: ["Deity of Christ", "Humanity of Christ", "Hypostatic Union", "The Incarnation", "The Three Offices", "The Atonement", "Resurrection & Ascension"]
  },
  {
    category: "Pneumatology (Spirit)",
    topics: ["Deity of the Holy Spirit", "The Work of the Spirit", "Regeneration", "The Fruit of the Spirit", "Gifts of the Spirit"]
  },
  {
    category: "Soteriology (Salvation)",
    topics: ["Unconditional Election", "Effectual Calling", "Justification by Faith", "Adoption", "Sanctification", "Saving Faith", "Repentance", "Perseverance of the Saints"]
  },
  {
    category: "Ecclesiology (Church)",
    topics: ["Nature of the Church", "Marks of a True Church", "Church Government", "The Sacraments", "Baptism", "The Lord's Supper", "Church Discipline"]
  },
  {
    category: "Eschatology (Last Things)",
    topics: ["Physical Death", "Intermediate State", "The Second Coming", "Resurrection of the Dead", "The Last Judgment", "New Heaven & New Earth"]
  }
];

export const CONFESSIONS: Confession[] = [
  {
    id: "westminster-confession",
    title: "Westminster Confession of Faith",
    shortTitle: "Westminster Confession",
    date: "1646",
    author: "Westminster Assembly",
    description: "The preeminent statement of Reformed theology in the English-speaking world, defining the doctrines of scripture, God, decree, creation, providence, and salvation.",
    tags: ["Presbyterian", "Systematic", "English"],
    structure: "33 Chapters",
  },
  {
    id: "westminster-shorter",
    title: "Westminster Shorter Catechism",
    shortTitle: "Shorter Catechism",
    date: "1647",
    author: "Westminster Assembly",
    description: "A catechism designed to educate children and laypeople in the Christian faith, famous for its first question: 'What is the chief end of man?'",
    tags: ["Presbyterian", "Catechism", "Education"],
    structure: "107 Questions",
  },
  {
    id: "westminster-larger",
    title: "Westminster Larger Catechism",
    shortTitle: "Larger Catechism",
    date: "1647",
    author: "Westminster Assembly",
    description: "A comprehensive catechism designed for those who have made some proficiency in the knowledge of the grounds of religion, providing exact and comprehensive definitions of doctrine.",
    tags: ["Presbyterian", "Catechism", "Advanced"],
    structure: "196 Questions",
  },
  {
    id: "heidelberg",
    title: "Heidelberg Catechism",
    shortTitle: "Heidelberg",
    date: "1563",
    author: "Zacharias Ursinus & Caspar Olevianus",
    description: "One of the most widely accepted symbols of the Reformation, known for its personal, devotional tone and structure around Guilt, Grace, and Gratitude.",
    tags: ["Continental", "Catechism", "Devotional"],
    structure: "129 Questions",
  },
  {
    id: "belgic",
    title: "Belgic Confession",
    shortTitle: "Belgic Confession",
    date: "1561",
    author: "Guido de Brès",
    description: "Written during the persecution of Protestants in the Low Countries, it is a clear and comprehensive statement of Reformed belief.",
    tags: ["Continental", "Dutch", "Persecution"],
    structure: "37 Articles",
  },
  {
    id: "canons-dort",
    title: "Canons of Dort",
    shortTitle: "Canons of Dort",
    date: "1619",
    author: "Synod of Dort",
    description: "The judgment of the Synod of Dort regarding the Five Points of Calvinism (TULIP) in response to the Remonstrants.",
    tags: ["Continental", "Soteriology", "TULIP"],
    structure: "5 Heads of Doctrine",
  },
  {
    id: "second-helvetic",
    title: "Second Helvetic Confession",
    shortTitle: "2nd Helvetic",
    date: "1562",
    author: "Heinrich Bullinger",
    description: "A detailed and moderate statement of the Swiss Reformation that united Zwinglian and Calvinist churches.",
    tags: ["Swiss", "Zwinglian", "Unity"],
    structure: "30 Chapters",
  },
  {
    id: "scots-confession",
    title: "The Scots Confession",
    shortTitle: "Scots Confession",
    date: "1560",
    author: "John Knox & others",
    description: "The confession of faith of the Church of Scotland before the Westminster Confession, characterized by a vigorous, practical tone.",
    tags: ["Scottish", "Knox", "Reformation"],
    structure: "25 Chapters",
  },
  {
    id: "1689-london",
    title: "1689 London Baptist Confession",
    shortTitle: "1689 LBCF",
    date: "1689",
    author: "Particular Baptists",
    description: "Based largely on the Westminster Confession but modified to reflect Baptist views on baptism and church polity.",
    tags: ["Baptist", "Credobaptism", "English"],
    structure: "32 Chapters",
  },
  {
    id: "apostles-creed",
    title: "Apostles' Creed",
    shortTitle: "Apostles' Creed",
    date: "Early Church",
    author: "Ecumenical",
    description: "The foundational creed of the Christian church, summarizing the core beliefs common to all believers.",
    tags: ["Ecumenical", "Ancient", "Basics"],
    structure: "12 Articles",
  },
  {
    id: "institutes",
    title: "Institutes of the Christian Religion",
    shortTitle: "Institutes",
    date: "1559 (Trans. 1813)",
    author: "John Calvin",
    description: "Calvin's magnum opus. This app uses the John Allen translation (1813), specifically referencing Project Gutenberg eBook #45001 (Vol 1) and #64392 (Vol 2).",
    tags: ["Systematic", "Foundational", "John Allen Trans."],
    structure: "4 Books",
  },
  {
    id: "calvins-commentaries",
    title: "Calvin's Commentaries",
    shortTitle: "Calvin's Comm.",
    date: "1540-1564",
    author: "John Calvin",
    description: "A comprehensive series of biblical commentaries covering nearly the entire Bible, renowned for their grammatical-historical exegesis and pastoral insight.",
    tags: ["Biblical", "Exegesis", "Reformer"],
    structure: "45 Volumes",
  },
  {
    id: "valley-of-vision",
    title: "The Valley of Vision",
    shortTitle: "Valley of Vision",
    date: "1975",
    author: "Arthur Bennett (Ed.)",
    description: "A collection of Puritan prayers and devotions, drawing from the works of Bunyan, Baxter, Edwards, and others, organized to guide the Christian life.",
    tags: ["Puritan", "Devotional", "Prayer"],
    structure: "10 Sections",
  },
];

export const THEOLOGIANS: Theologian[] = [
  // 16th Century
  {
    id: "calvin",
    name: "John Calvin",
    dates: "1509–1564",
    origin: "France / Geneva",
    century: "16th Century",
    description: "The preeminent systematic theologian of the Reformation.",
    works: ["Institutes of the Christian Religion", "Commentaries on Scripture", "The Bondage and Liberation of the Will"],
  },
  {
    id: "zwingli",
    name: "Huldrych Zwingli",
    dates: "1484–1531",
    origin: "Switzerland",
    century: "16th Century",
    description: "Leader of the Reformation in Switzerland, emphasizing the supremacy of Scripture.",
    works: ["Commentary on True and False Religion", "Fiedknecht (The Shepherd)", "An Exposition of the Faith"],
  },
  {
    id: "bullinger",
    name: "Heinrich Bullinger",
    dates: "1504–1575",
    origin: "Switzerland",
    century: "16th Century",
    description: "Successor to Zwingli and a major covenant theologian.",
    works: ["The Decades", "Second Helvetic Confession"],
  },
  {
    id: "knox",
    name: "John Knox",
    dates: "1514–1572",
    origin: "Scotland",
    century: "16th Century",
    description: "Founder of the Presbyterian Church of Scotland.",
    works: ["The First Blast of the Trumpet", "History of the Reformation in Scotland", "The Scots Confession"],
  },
  {
    id: "vermigli",
    name: "Peter Martyr Vermigli",
    dates: "1499–1562",
    origin: "Italy",
    century: "16th Century",
    description: "Influential Reformed scholastic and exegete who impacted the English Reformation.",
    works: ["Loci Communes", "Commentary on Romans", "Treatise on the Eucharist"],
  },

  // 17th Century
  {
    id: "owen",
    name: "John Owen",
    dates: "1616–1683",
    origin: "England",
    century: "17th Century",
    description: "The 'Prince of Puritans', known for deep spiritual and theological insight.",
    works: ["The Death of Death in the Death of Christ", "Communion with God", "Mortification of Sin"],
  },
  {
    id: "turretin",
    name: "Francis Turretin",
    dates: "1623–1687",
    origin: "Switzerland (Geneva)",
    century: "17th Century",
    description: "The high point of Genevan scholasticism.",
    works: ["Institutes of Elenctic Theology"],
  },
  {
    id: "rutherford",
    name: "Samuel Rutherford",
    dates: "1600–1661",
    origin: "Scotland",
    century: "17th Century",
    description: "Scottish commissioner to Westminster and political theorist.",
    works: ["Lex, Rex", "Letters of Samuel Rutherford", "The Covenant of Life Opened"],
  },
  {
    id: "bunyan",
    name: "John Bunyan",
    dates: "1628–1688",
    origin: "England",
    century: "17th Century",
    description: "Puritan preacher and allegorist.",
    works: ["The Pilgrim's Progress", "Grace Abounding to the Chief of Sinners", "The Holy War"],
  },

  // 18th Century
  {
    id: "edwards",
    name: "Jonathan Edwards",
    dates: "1703–1758",
    origin: "America",
    century: "18th Century",
    description: "Widely regarded as America's greatest theologian and philosopher.",
    works: ["The Freedom of the Will", "Religious Affections", "The Nature of True Virtue"],
  },
  {
    id: "whitefield",
    name: "George Whitefield",
    dates: "1714–1770",
    origin: "England",
    century: "18th Century",
    description: "The great evangelist of the Great Awakening.",
    works: ["Sermons", "Journals"],
  },

  // 19th Century
  {
    id: "hodge",
    name: "Charles Hodge",
    dates: "1797–1878",
    origin: "America (Princeton)",
    century: "19th Century",
    description: "Principal of Princeton Theological Seminary and defender of Old School Presbyterianism.",
    works: ["Systematic Theology", "Commentary on Romans", "The Way of Life"],
  },
  {
    id: "bavinck",
    name: "Herman Bavinck",
    dates: "1854–1921",
    origin: "Netherlands",
    century: "19th Century",
    description: "Major Dutch Reformed theologian who engaged with modernism.",
    works: ["Reformed Dogmatics", "Our Reasonable Faith", "The Philosophy of Revelation"],
  },
  {
    id: "kuyper",
    name: "Abraham Kuyper",
    dates: "1837–1920",
    origin: "Netherlands",
    century: "19th Century",
    description: "Theologian and Prime Minister of the Netherlands, emphasized Christ's lordship over all spheres.",
    works: ["Lectures on Calvinism", "To Be Near Unto God", "Common Grace"],
  },
  {
    id: "warfield",
    name: "B.B. Warfield",
    dates: "1851–1921",
    origin: "America (Princeton)",
    century: "19th Century",
    description: "The last of the great Princeton theologians, defender of biblical inerrancy.",
    works: ["The Inspiration and Authority of the Bible", "Counterfeit Miracles", "The Plan of Salvation"],
  },
  {
    id: "spurgeon",
    name: "Charles Spurgeon",
    dates: "1834–1892",
    origin: "England",
    century: "19th Century",
    description: "The 'Prince of Preachers', a particular Baptist.",
    works: ["The Treasury of David", "Lectures to My Students", "Morning and Evening"],
  },

  // 20th Century
  {
    id: "machen",
    name: "J. Gresham Machen",
    dates: "1881–1937",
    origin: "America",
    century: "20th Century",
    description: "Founder of Westminster Theological Seminary and the OPC.",
    works: ["Christianity and Liberalism", "The Origin of Paul's Religion", "New Testament Greek for Beginners"],
  },
  {
    id: "vantil",
    name: "Cornelius Van Til",
    dates: "1895–1987",
    origin: "Netherlands / America",
    century: "20th Century",
    description: "Founder of Presuppositional Apologetics.",
    works: ["The Defense of the Faith", "Christian Apologetics", "Common Grace and the Gospel"],
  },
  {
    id: "berkhof",
    name: "Louis Berkhof",
    dates: "1873–1957",
    origin: "Netherlands / America",
    century: "20th Century",
    description: "Systematizer whose theology became a standard textbook.",
    works: ["Systematic Theology", "History of Christian Doctrines", "Summary of Christian Doctrine"],
  },
  {
    id: "lloyd-jones",
    name: "Martyn Lloyd-Jones",
    dates: "1899–1981",
    origin: "Wales",
    century: "20th Century",
    description: "Influential expository preacher at Westminster Chapel.",
    works: ["Studies in the Sermon on the Mount", "Spiritual Depression", "Great Doctrines of the Bible"],
  }
];

export const BIBLE_VERSIONS: BibleVersion[] = [
  {
    id: "esv",
    title: "English Standard Version",
    shortTitle: "ESV",
    date: "2001",
    description: "An essentially literal translation that seeks as far as possible to capture the precise wording of the original text and the personal style of each Bible writer.",
    tags: ["Modern", "Literal", "Evangelical"],
  },
  {
    id: "nasb-95",
    title: "New American Standard Bible (1995)",
    shortTitle: "NASB 95",
    date: "1995",
    description: "Widely recognized for its fidelity to the original Hebrew, Aramaic, and Greek texts, maintaining a word-for-word translation philosophy.",
    tags: ["Modern", "Literal", "Evangelical"],
  },
  {
    id: "geneva-bible",
    title: "Geneva Bible",
    shortTitle: "Geneva (1599)",
    date: "1560/1599",
    description: "The primary Bible of 16th-century English Protestantism and the Bible used by William Shakespeare, John Knox, John Donne, and John Bunyan.",
    tags: ["Reformation", "Historical", "Annotated"],
  },
  {
    id: "asv",
    title: "American Standard Version",
    shortTitle: "ASV",
    date: "1901",
    description: "Rooted in the work that produced the Revised Version (RV), it is known for its extremely literal accuracy.",
    tags: ["Literal", "American", "Academic"],
  },
];

export const BIBLE_BOOKS: BibleBook[] = [
  // OLD TESTAMENT
  // Pentateuch
  { name: "Genesis", chapters: 50, testament: "Old", category: "Pentateuch" },
  { name: "Exodus", chapters: 40, testament: "Old", category: "Pentateuch" },
  { name: "Leviticus", chapters: 27, testament: "Old", category: "Pentateuch" },
  { name: "Numbers", chapters: 36, testament: "Old", category: "Pentateuch" },
  { name: "Deuteronomy", chapters: 34, testament: "Old", category: "Pentateuch" },
  // History
  { name: "Joshua", chapters: 24, testament: "Old", category: "History" },
  { name: "Judges", chapters: 21, testament: "Old", category: "History" },
  { name: "Ruth", chapters: 4, testament: "Old", category: "History" },
  { name: "1 Samuel", chapters: 31, testament: "Old", category: "History" },
  { name: "2 Samuel", chapters: 24, testament: "Old", category: "History" },
  { name: "1 Kings", chapters: 22, testament: "Old", category: "History" },
  { name: "2 Kings", chapters: 25, testament: "Old", category: "History" },
  { name: "1 Chronicles", chapters: 29, testament: "Old", category: "History" },
  { name: "2 Chronicles", chapters: 36, testament: "Old", category: "History" },
  { name: "Ezra", chapters: 10, testament: "Old", category: "History" },
  { name: "Nehemiah", chapters: 13, testament: "Old", category: "History" },
  { name: "Esther", chapters: 10, testament: "Old", category: "History" },
  // Wisdom
  { name: "Job", chapters: 42, testament: "Old", category: "Wisdom" },
  { name: "Psalms", chapters: 150, testament: "Old", category: "Wisdom" },
  { name: "Proverbs", chapters: 31, testament: "Old", category: "Wisdom" },
  { name: "Ecclesiastes", chapters: 12, testament: "Old", category: "Wisdom" },
  { name: "Song of Solomon", chapters: 8, testament: "Old", category: "Wisdom" },
  // Major Prophets
  { name: "Isaiah", chapters: 66, testament: "Old", category: "Major Prophets" },
  { name: "Jeremiah", chapters: 52, testament: "Old", category: "Major Prophets" },
  { name: "Lamentations", chapters: 5, testament: "Old", category: "Major Prophets" },
  { name: "Ezekiel", chapters: 48, testament: "Old", category: "Major Prophets" },
  { name: "Daniel", chapters: 12, testament: "Old", category: "Major Prophets" },
  // Minor Prophets
  { name: "Hosea", chapters: 14, testament: "Old", category: "Minor Prophets" },
  { name: "Joel", chapters: 3, testament: "Old", category: "Minor Prophets" },
  { name: "Amos", chapters: 9, testament: "Old", category: "Minor Prophets" },
  { name: "Obadiah", chapters: 1, testament: "Old", category: "Minor Prophets" },
  { name: "Jonah", chapters: 4, testament: "Old", category: "Minor Prophets" },
  { name: "Micah", chapters: 7, testament: "Old", category: "Minor Prophets" },
  { name: "Nahum", chapters: 3, testament: "Old", category: "Minor Prophets" },
  { name: "Habakkuk", chapters: 3, testament: "Old", category: "Minor Prophets" },
  { name: "Zephaniah", chapters: 3, testament: "Old", category: "Minor Prophets" },
  { name: "Haggai", chapters: 2, testament: "Old", category: "Minor Prophets" },
  { name: "Zechariah", chapters: 14, testament: "Old", category: "Minor Prophets" },
  { name: "Malachi", chapters: 4, testament: "Old", category: "Minor Prophets" },

  // NEW TESTAMENT
  // Gospels
  { name: "Matthew", chapters: 28, testament: "New", category: "Gospels" },
  { name: "Mark", chapters: 16, testament: "New", category: "Gospels" },
  { name: "Luke", chapters: 24, testament: "New", category: "Gospels" },
  { name: "John", chapters: 21, testament: "New", category: "Gospels" },
  // History
  { name: "Acts", chapters: 28, testament: "New", category: "History (NT)" },
  // Pauline Epistles
  { name: "Romans", chapters: 16, testament: "New", category: "Pauline Epistles" },
  { name: "1 Corinthians", chapters: 16, testament: "New", category: "Pauline Epistles" },
  { name: "2 Corinthians", chapters: 13, testament: "New", category: "Pauline Epistles" },
  { name: "Galatians", chapters: 6, testament: "New", category: "Pauline Epistles" },
  { name: "Ephesians", chapters: 6, testament: "New", category: "Pauline Epistles" },
  { name: "Philippians", chapters: 4, testament: "New", category: "Pauline Epistles" },
  { name: "Colossians", chapters: 4, testament: "New", category: "Pauline Epistles" },
  { name: "1 Thessalonians", chapters: 5, testament: "New", category: "Pauline Epistles" },
  { name: "2 Thessalonians", chapters: 3, testament: "New", category: "Pauline Epistles" },
  { name: "1 Timothy", chapters: 6, testament: "New", category: "Pauline Epistles" },
  { name: "2 Timothy", chapters: 4, testament: "New", category: "Pauline Epistles" },
  { name: "Titus", chapters: 3, testament: "New", category: "Pauline Epistles" },
  { name: "Philemon", chapters: 1, testament: "New", category: "Pauline Epistles" },
  // General Epistles
  { name: "Hebrews", chapters: 13, testament: "New", category: "General Epistles" },
  { name: "James", chapters: 5, testament: "New", category: "General Epistles" },
  { name: "1 Peter", chapters: 5, testament: "New", category: "General Epistles" },
  { name: "2 Peter", chapters: 3, testament: "New", category: "General Epistles" },
  { name: "1 John", chapters: 5, testament: "New", category: "General Epistles" },
  { name: "2 John", chapters: 1, testament: "New", category: "General Epistles" },
  { name: "3 John", chapters: 1, testament: "New", category: "General Epistles" },
  { name: "Jude", chapters: 1, testament: "New", category: "General Epistles" },
  // Prophecy
  { name: "Revelation", chapters: 22, testament: "New", category: "Prophecy" },
];

export const INITIAL_SYSTEM_INSTRUCTION = `
You are a specialized Reformed Theology Assistant.
Your knowledge base is strictly grounded in the following documents:
1. Westminster Confession of Faith
2. Westminster Shorter & Larger Catechisms
3. Heidelberg Catechism
4. Belgic Confession
5. Canons of Dort
6. Second Helvetic Confession
7. 1689 London Baptist Confession of Faith
8. The Scots Confession (1560)
9. **Institutes of the Christian Religion** - **SOURCE: John Allen Translation (1813)**.
   - For all references to the Institutes, you MUST EXCLUSIVELY use the provided text from Project Gutenberg eBook #45001 (Vol 1) and #64392 (Vol 2). 
   - These provided text files are your ONLY source for the Institutes. Do not use other translations (Beveridge, Battles, etc.).
   - Follow the structure in the provided text: Book.Chapter.Section (e.g., 3.14.1).
10. John Calvin's Commentaries on the Bible
11. The Bible (Specific versions: ESV, Geneva Bible, ASV, NASB 95, Latin Vulgate)
12. The Reformed Hymnal (Classic hymns and metrical psalms)
13. Gadsby's Hymns and data from hymns.countedfaithful.org (specifically the number listings)
14. The Valley of Vision (Puritan Prayers edited by Arthur Bennett)

STRICT SOURCE REQUIREMENT:
- You must ONLY answer based on the content found in these original historical documents and specific Bible versions.
- Do NOT use modern theological summaries, blogs, internet articles, or contemporary opinions.
- Every assertion you make must be derived directly from the text of these documents.

CITATION & VERIFICATION PROTOCOL (ZERO TOLERANCE FOR HALLUCINATIONS):
1. **MANDATORY VERIFICATION**: Use the **Google Search Tool** to verify citations for Confessions and Catechisms.
   - For **Institutes of the Christian Religion**, verify against your internal memory of the John Allen 1813 text provided in the prompt context.
   - For other documents, search for the specific Article, Question, or Section.
2. **VERIFY MATCH**:
   - Compare your internal knowledge with the Search Result.
   - Ensure the text is accurate to the original historical document.
   - If you cannot find the text via search, admit it.
3. **COMMENTARIES**:
   - When citing Calvin's Commentaries, ensure the text you provide belongs to the specific Book, Chapter, and Verse you are referencing.
   - Do not conflate comments on adjacent verses.
4. **VERBATIM QUOTING**:
   - When asked to "Fetch" or "Show" text, provide it word-for-word.
   - Do not paraphrase unless explicitly asked.

Scripture Reference Guidelines:
- Prioritize **ESV**, **Geneva Bible**, **ASV**, or **NASB 95**.
- Ensure scripture references are clear (e.g., "Romans 8:28").

INTERLINEAR PROTOCOL:
- When asked for an Interlinear translation (Hebrew/Greek):
  - Provide a table or structured list.
  - Column 1: Original Language Word (Hebrew or Greek script).
  - Column 2: Transliteration.
  - Column 3: English Translation (Gloss).
  - Column 4: Parsing/Strong's (if relevant).
- For Latin requests: Use the **Clementine Vulgate**.

Hymnal Guidelines:
- **MANDATORY SOURCE**: For ALL hymn queries (lyrics, number, author), you MUST use the Google Search tool to verify against https://hymns.countedfaithful.org/numberListing.php or its specific hymn pages.
- Numeric queries (e.g., "123") refer to Gadsby's Hymns on this site.
- Provide lyrics, author, meter, and theological analysis.

Behavior Guidelines:
- Cite specific articles/questions (e.g., "WCF 1.1", "Heidelberg Q.1").
- Maintain a reverent, academic, and helpful tone.
- Use Markdown formatting.
`;

export const DEVOTIONAL_SYSTEM_INSTRUCTION = `
You are a Reformed Pastor and Theologian generating a Daily Devotional.
Your tone should be warm, pastoral, encouraging, and deeply theological.
Use the provided Reformed Confession or Catechism text as the anchor.

**IMPORTANT**: For all 'Institutes' references, you MUST use the John Allen translation (1813) provided in the text context of the prompt.

VERIFICATION PROTOCOL:
- You MUST verify the accuracy of the Catechism Question or Confession text against original free online available works before outputting it.
- You MUST verify that the Scripture references provided accurately match the biblical text (ESV, NASB 95 or Geneva).
- Do not paraphrase the standards; quote them exactly.

Structure your response in Markdown:

### [Title of Devotional]

**The Anchor Text:**
**[Insert Full Source Name Here, e.g. Westminster Shorter Catechism Q. 1]**
[Quote the specific Catechism Question/Answer or Confession Section verbatim]

**Scripture Reading:**
[Quote 1-3 relevant verses from ESV, NASB 95 or Geneva Bible]

**Meditation:**
[A 150-200 word pastoral reflection connecting the doctrine to daily life, comfort, and the Gospel. Focus on Christ.]

**Prayer:**
[A heartfelt, reverent prayer responding to the truth (approx. 50-75 words).]

Do not add any other conversational filler.
`;

export const STUDY_SYSTEM_INSTRUCTION = `
You are a Systematic Theology Professor specializing in Reformed Symbolics (the study of confessions).
Your task is to provide a rigorous, comparative theological analysis of a specific doctrine.

**IMPORTANT**: For all 'Institutes' references, you MUST use the John Allen translation (1813) provided in the text context of the prompt.

VERIFICATION PROTOCOL:
- All confessional quotes must be verbatim and verified.
- Do not generalize; cite specific articles (e.g., "Belgic Confession Art. 12" vs "WCF 4.1").
- For Calvin's Institutes or Commentaries, ensure the reference is precise to the Book, Chapter, and Section (John Allen Trans).

Output Structure (Markdown):

# [Topic Title]

## 1. Definition
Provide a precise, scholastic definition of the doctrine in theological terms.

## 2. Confessional Synthesis
Compare and contrast how this doctrine is articulated across the major standards.
- **Westminster Tradition:** Quote/Analyze specific sections from WCF/WSC/WLC.
- **Continental Tradition:** Quote/Analyze specific sections from Heidelberg/Belgic/Canons of Dort/2nd Helvetic.
- **Baptist Tradition:** Note any modifications in the 1689 LBCF if relevant.
*Highlight distinct nuances or emphases in each tradition.*

## 3. Biblical Basis
Provide the key *sedes doctrinae* (seat of doctrine) texts from Scripture (ESV/NASB 95) that support this view, with brief exegetical notes.

## 4. Key Distinctions
Bullet points clarifying common misunderstandings or distinctions (e.g., "Supralapsarianism vs Infralapsarianism" or "Justification vs Sanctification").

Do not use conversational filler. Be academic and precise.
`;

export const HYMNS: Hymn[] = [
  {
    id: "holy-holy-holy",
    title: "Holy, Holy, Holy",
    author: "Reginald Heber",
    date: "1826",
    description: "A hymn celebrating the Trinity, based on Revelation 4:8.",
    tags: ["Trinity", "Worship", "Classic"]
  },
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    author: "John Newton",
    date: "1779",
    description: "A testimony of salvation by grace alone.",
    tags: ["Grace", "Salvation", "Testimony"]
  },
  {
    id: "psalm-23",
    title: "The King of Love My Shepherd Is",
    author: "Henry Baker",
    date: "1868",
    description: "A beautiful paraphrase of Psalm 23.",
    tags: ["Psalm", "Comfort", "Jesus"]
  },
  {
    id: "mighty-fortress",
    title: "A Mighty Fortress Is Our God",
    author: "Martin Luther",
    date: "1529",
    description: "The battle hymn of the Reformation.",
    tags: ["Reformation", "Protection", "God's Power"]
  },
  {
    id: "be-thou-my-vision",
    title: "Be Thou My Vision",
    author: "Dallan Forgaill",
    date: "6th Century",
    description: "An ancient Irish hymn prayer for God's guidance.",
    tags: ["Prayer", "Guidance", "Ancient"]
  },
  {
    id: "come-thou-fount",
    title: "Come Thou Fount of Every Blessing",
    author: "Robert Robinson",
    date: "1758",
    description: "A prayer acknowledging our proneness to wander and God's keeping grace.",
    tags: ["Grace", "Perseverance", "Prayer"]
  }
];

export const THEOLOGICAL_TOPICS: string[] = [
  "Justification by Faith Alone",
  "The Trinity",
  "The Hypostatic Union",
  "Original Sin",
  "Limited Atonement",
  "Unconditional Election",
  "The Covenant of Grace",
  "Sanctification",
  "The Perseverance of the Saints",
  "Sola Scriptura",
  "Divine Providence",
  "The Canon of Scripture",
  "The Image of God",
  "Effectual Calling",
  "Adoption"
];

export const DOCTRINAL_CONNECTIONS: DoctrinalConnection[] = [
  {
    id: "conn-1",
    source: { title: "Original Sin", description: "The corruption of man's nature", category: "Anthropology" },
    target: { title: "Total Depravity", description: "Inability to do spiritual good", category: "Anthropology" },
    type: "leads_to",
    reasoning: "Because nature is corrupt (Original Sin), the will is in bondage (Total Depravity)."
  },
  {
    id: "conn-2",
    source: { title: "Total Depravity", description: "Man is dead in sin", category: "Anthropology" },
    target: { title: "Unconditional Election", description: "God chooses based on His will alone", category: "Soteriology" },
    type: "supports",
    reasoning: "Since man cannot choose God (Depravity), salvation must depend entirely on God's choice (Election)."
  },
  {
    id: "conn-3",
    source: { title: "Unconditional Election", description: "God chooses a people", category: "Soteriology" },
    target: { title: "Limited Atonement", description: "Christ died for the elect", category: "Christology" },
    type: "leads_to",
    reasoning: "If God chose specific people to save, Christ's death was intended to secure their salvation specifically."
  },
  {
    id: "conn-4",
    source: { title: "Limited Atonement", description: "Christ's death actually saves", category: "Christology" },
    target: { title: "Effectual Calling", description: "The Spirit draws the elect", category: "Soteriology" },
    type: "leads_to",
    reasoning: "The redemption purchased by Christ is applied by the Spirit to those for whom it was intended."
  },
  {
    id: "conn-5",
    source: { title: "Justification", description: "Declared righteous", category: "Soteriology" },
    target: { title: "Sanctification", description: "Made holy", category: "Soteriology" },
    type: "contrasts",
    reasoning: "Justification is a one-time legal declaration; Sanctification is a progressive transformation."
  },
  {
    id: "conn-6",
    source: { title: "Divine Sovereignty", description: "God rules all things", category: "Theology Proper" },
    target: { title: "Divine Providence", description: "God preserves and governs", category: "Theology Proper" },
    type: "explains",
    reasoning: "Providence is the execution of God's sovereign decrees in time and history."
  }
];

export interface NavItem {
  label: string;
  reference?: string;
  isHeader?: boolean;
}

// Titles for Westminster Confession Chapters
const wcfChapters = [
  "Of the Holy Scripture", "Of God, and of the Holy Trinity", "Of God's Eternal Decree", "Of Creation", "Of Providence",
  "Of the Fall of Man, of Sin, and of the Punishment thereof", "Of God's Covenant with Man", "Of Christ the Mediator", "Of Free Will",
  "Of Effectual Calling", "Of Justification", "Of Adoption", "Of Sanctification", "Of Saving Faith", "Of Repentance unto Life",
  "Of Good Works", "Of the Perseverance of the Saints", "Of the Assurance of Grace and Salvation", "Of the Law of God",
  "Of Christian Liberty, and Liberty of Conscience", "Of Religious Worship, and the Sabbath Day", "Of Lawful Oaths and Vows",
  "Of the Civil Magistrate", "Of Marriage and Divorce", "Of the Church", "Of the Communion of Saints", "Of the Sacraments",
  "Of Baptism", "Of the Lord's Supper", "Of Church Censures", "Of Synods and Councils",
  "Of the State of Men after Death, and of the Resurrection of the Dead", "Of the Last Judgment"
];

// Titles for Belgic Confession Articles
const belgicArticles = [
  "There is Only One God", "By What Means God Is Made Known unto Us", "The Written Word of God", "Canonical Books",
  "From Whence the Holy Scriptures Derive Their Dignity and Authority", "The Difference Between the Canonical and Apocryphal Books",
  "The Sufficiency of the Holy Scriptures to Be the Only Rule of Faith", "God Is One in Essence, Yet Distinguished in Three Persons",
  "The Proof of the Foregoing Article of the Trinity of Persons", "Jesus Christ Is True and Eternal God", "The Holy Ghost Is True and Eternal God",
  "The Creation", "Divine Providence", "The Creation and Fall of Man, and His Incapacity to Perform What Is Truly Good", "Original Sin",
  "Eternal Election", "The Recovery of Fallen Man", "The Incarnation of Jesus Christ", "The Union and Distinction of the Two Natures in the Person of Christ",
  "God Has Manifested His Justice and Mercy in Christ", "The Satisfaction of Christ, Our Only High Priest, for Us", "Faith in Jesus Christ",
  "Justification", "Man's Sanctification and Good Works", "The Ceremonial Law", "Christ's Intercession", "The Catholic Christian Church",
  "Everyone Is Bound to Join Himself to the True Church", "The Marks of the True Church, and Wherein She Differs from the False Church",
  "The Government of and Offices in the Church", "The Ministers, Elders, and Deacons", "The Order and Discipline of the Church",
  "The Sacraments", "Holy Baptism", "The Holy Supper of Our Lord Jesus Christ", "The Magistrates", "The Last Judgment"
];

// Apostles' Creed Articles
const apostlesCreedArticles = [
  "I. I believe in God the Father Almighty, Maker of heaven and earth.",
  "II. And in Jesus Christ his only Son our Lord;",
  "III. Who was conceived by the Holy Ghost, Born of the Virgin Mary;",
  "IV. Suffered under Pontius Pilate, Was crucified, dead, and buried;",
  "V. He descended into hell; The third day he rose again from the dead;",
  "VI. He ascended into heaven, And sitteth on the right hand of God the Father Almighty;",
  "VII. From thence he shall come to judge the quick and the dead.",
  "VIII. I believe in the Holy Ghost;",
  "IX. The holy Catholic Church; The Communion of Saints;",
  "X. The Forgiveness of sins;",
  "XI. The Resurrection of the body;",
  "XII. And the Life everlasting. Amen."
];

// Titles for Second Helvetic Confession Chapters
const secondHelveticChapters = [
  "Of the Holy Scripture Being the True Word of God", "Of Interpreting the Holy Scripture; and of Fathers, Councils, and Traditions",
  "Of God, His Unity and Trinity", "Of Idols or Images of God, Christ and the Saints",
  "Of the Adoration, Worship and Invocation of God Through the Only Mediator Jesus Christ", "Of the Providence of God",
  "Of the Creation of All Things: Of Angels, the Devil, and Man", "Of Man's Fall, Sin and the Cause of Sin",
  "Of Free Will, and Thus of Human Powers", "Of the Predestination of God and the Election of the Saints",
  "Of Jesus Christ, True God and Man, the Only Savior of the World", "Of the Law of God",
  "Of the Gospel of Jesus Christ, of the Promises, …", "Of Repentance and the Conversion of Man",
  "Of the True Justification of the Faithful", "Of Faith and Good Works, and of Their Reward, …",
  "Of the Catholic and Holy Church of God, …", "Of the Ministers of the Church, Their Institution and Duties",
  "Of the Sacraments of the Church of Christ", "Of Holy Baptism", "Of the Holy Supper of the Lord",
  "Of Religious and Ecclesiastical Meetings", "Of the Prayers of the Church, of Singing, and of Canonical Hours",
  "Of Holy Days, Fasts and the Choice of Foods", "Of Catechizing and of Comforting and Visiting the Sick",
  "Of the Burial of the Faithful, and of the Care to Be Shown…", "Of Rites, Ceremonies and Things Indifferent",
  "Of the Possessions of the Church", "Of Celibacy, Marriage and the Management of Domestic Affairs", "Of the Magistracy"
];

// Titles for 1689 London Baptist Confession Chapters
const lbcfChapters = [
  "Of the Holy Scriptures", "Of God and the Holy Trinity", "Of God's Decree", "Of Creation", "Of Divine Providence",
  "Of the Fall of Man, of Sin, and of the Punishment Thereof", "Of God's Covenant", "Of Christ the Mediator", "Of Free Will",
  "Of Effectual Calling", "Of Justification", "Of Adoption", "Of Sanctification", "Of Saving Faith",
  "Of Repentance unto Life and Salvation", "Of Good Works", "Of the Perseverance of the Saints",
  "Of the Assurance of Grace and Salvation", "Of the Law of God", "Of the Gospel, and of the Extent of the Grace Thereof",
  "Of Christian Liberty and Liberty of Conscience", "Of Religious Worship and the Sabbath Day", "Of Lawful Oaths and Vows",
  "Of the Civil Magistrate", "Of Marriage", "Of the Church", "Of the Communion of Saints",
  "Of Baptism and the Lord's Supper", "Of Baptism", "Of the Lord's Supper",
  "Of the State of Man after Death and of the Resurrection of the Dead", "Of the Last Judgment"
];

// Chapters for The Scots Confession (1560)
const scotsChapters = [
  "God", "Creation of Man", "Original Sin", "The Revelation of the Promise", "The Continuance, Increase, and Preservation of the Church",
  "The Incarnation of Christ Jesus", "Why It Behooved the Mediator to Be Very God and Very Man", "Election", "Christ's Death, Passion, Burial, etc.",
  "Resurrection", "Ascension", "Faith in the Holy Ghost", "The Cause of Good Works", "The Works Which Are Counted Good Before God",
  "The Perfection of the Law and The Imperfection of Man", "The Kirk", "The Immortality of the Soul",
  "The Notes by Which the True Kirk is Discerned from the False and Who Shall Be Judge of the Doctrine",
  "The Authority of the Scriptures", "General Councils, Their Power, Authority, and Causes of Their Convention",
  "The Sacraments", "The Right Administration of the Sacraments", "To Whom Sacraments Appertain",
  "The Civil Magistrate", "The Gifts Freely Given to the Kirk"
];

// Structure for Institutes of the Christian Religion (Vol 1 & 2 - John Allen 1813)
// Note: This aligns with the provided text source.
const institutesStructure = [
  {
    header: "Book I: On the Knowledge of God the Creator", chapters: [
      "Ch 1: Connection Between Knowledge of God and Self",
      "Ch 2: Nature and Tendency of Knowledge of God",
      "Ch 3: Human Mind Naturally Endued with Knowledge of God",
      "Ch 4: This Knowledge Extinguished or Corrupted",
      "Ch 5: Knowledge of God Conspicuous in Creation",
      "Ch 6: Guidance of Scripture Necessary",
      "Ch 7: Testimony of the Spirit Necessary",
      "Ch 8: Rational Proofs to Establish Scripture",
      "Ch 9: Fanaticism Discarding Scripture",
      "Ch 10: Idolatrous Worship Discountenanced",
      "Ch 11: Unlawfulness of Ascribing Visible Form to God",
      "Ch 12: God Contradistinguished from Idols",
      "Ch 13: One Divine Essence, Three Persons",
      "Ch 14: True God Distinguished by Creation",
      "Ch 15: State of Man at Creation",
      "Ch 16: God's Preservation and Government",
      "Ch 17: Application of Doctrine of Providence",
      "Ch 18: God Uses Agency of Impious"
    ]
  },
  {
    header: "Book II: On the Knowledge of God the Redeemer", chapters: [
      "Ch 1: Fall and Defection of Adam",
      "Ch 2: Man Despoiled of Freedom of Will",
      "Ch 3: Corruption of Human Nature",
      "Ch 4: Operation of God in Hearts of Men",
      "Ch 5: Refutation of Objections to Bondage of Will",
      "Ch 6: Redemption for Lost Man to be Sought in Christ",
      "Ch 7: The Law Given to Encourage Hope",
      "Ch 8: Exposition of the Moral Law",
      "Ch 9: Christ Known Under the Law",
      "Ch 10: Similarity of Old and New Testaments",
      "Ch 11: Difference of the Two Testaments",
      "Ch 12: Necessity of Christ Becoming Man",
      "Ch 13: Christ's Assumption of Real Humanity",
      "Ch 14: Union of Two Natures in Mediator",
      "Ch 15: Consideration of Christ's Three Offices",
      "Ch 16: Christ's Execution of Redeemer's Office",
      "Ch 17: Christ Merited Grace and Salvation"
    ]
  },
  {
    header: "Book III: On Receiving the Grace of Christ", chapters: [
      "Ch 1: Things Declared Concerning Christ",
      "Ch 2: Faith Defined",
      "Ch 3: On Repentance",
      "Ch 4: Sophistry of Schools on Repentance",
      "Ch 5: Indulgences and Purgatory",
      "Ch 6: The Life of a Christian",
      "Ch 7: Summary of Christian Life",
      "Ch 8: Bearing the Cross",
      "Ch 9: Meditation on Future Life",
      "Ch 10: Right Use of Present Life",
      "Ch 11: Justification by Faith Defined",
      "Ch 12: Consideration of Divine Tribunal",
      "Ch 13: Two Things Observed in Gratuitous Justification",
      "Ch 14: Commencement & Progress of Justification",
      "Ch 15: Boasting Subversive of God's Glory",
      "Ch 16: Refutation of Papist Calumnies",
      "Ch 17: Harmony of Law and Gospel Promises",
      "Ch 18: Justification from Works as inferred from Reward",
      "Ch 19: Christian Liberty",
      "Ch 20: Prayer",
      "Ch 21: Eternal Election",
      "Ch 22: Testimonies of Scripture on Election",
      "Ch 23: Refutation of Calumnies on Election",
      "Ch 24: Election Confirmed by God's Call",
      "Ch 25: Final Resurrection"
    ]
  },
  {
    header: "Book IV: On the External Means of Salvation", chapters: [
      "Ch 1: True Church with which we must maintain Unity",
      "Ch 2: Comparison between True and False Church",
      "Ch 3: Teachers and Ministers of the Church",
      "Ch 4: State of the Ancient Church",
      "Ch 5: Ancient Form subverted by Papal Tyranny",
      "Ch 6: Primacy of the Romish See",
      "Ch 7: Rise and Progress of Papal Power",
      "Ch 8: Power of the Church in Articles of Faith",
      "Ch 9: Councils and their Authority",
      "Ch 10: Power of Legislation in the Church",
      "Ch 11: Jurisdiction of the Church & its Abuse",
      "Ch 12: Discipline of the Church (Censures & Fasting)",
      "Ch 13: Vows",
      "Ch 14: Sacraments",
      "Ch 15: Baptism",
      "Ch 16: Pædobaptism",
      "Ch 17: Lord's Supper & its Benefits",
      "Ch 18: Papal Mass as a Sacrilege",
      "Ch 19: Five Other Sacraments (Falsely so called)",
      "Ch 20: Civil Government"
    ]
  }
];


export const getConfessionNavigation = (confession: Confession): NavItem[] => {
  const items: NavItem[] = [];

  if (confession.id === 'westminster-confession') {
    wcfChapters.forEach((title, idx) => {
      items.push({ label: `Ch. ${idx + 1}: ${title}`, reference: `WCF ${idx + 1}` });
    });
  } else if (confession.id === 'westminster-shorter') {
    items.push({ label: "I. God & Decrees (Q. 1-12)", reference: "WSC Q. 1-12", isHeader: true });
    items.push({ label: "Introduction (Q. 1-3)", reference: "WSC Q. 1-3" });
    items.push({ label: "God & Trinity (Q. 4-6)", reference: "WSC Q. 4-6" });
    items.push({ label: "Decrees & Creation (Q. 7-12)", reference: "WSC Q. 7-12" });

    items.push({ label: "II. Sin & The Fall (Q. 13-20)", reference: "WSC Q. 13-20", isHeader: true });
    items.push({ label: "Sin & Fall (Q. 13-19)", reference: "WSC Q. 13-19" });
    items.push({ label: "Election (Q. 20)", reference: "WSC Q. 20" });

    items.push({ label: "III. Christ our Redeemer (Q. 21-28)", reference: "WSC Q. 21-28", isHeader: true });
    items.push({ label: "Christ's Person (Q. 21-22)", reference: "WSC Q. 21-22" });
    items.push({ label: "Christ's Offices (Q. 23-26)", reference: "WSC Q. 23-26" });
    items.push({ label: "Humiliation & Exaltation (Q. 27-28)", reference: "WSC Q. 27-28" });

    items.push({ label: "IV. Application of Redemption (Q. 29-38)", reference: "WSC Q. 29-38", isHeader: true });
    items.push({ label: "Effectual Calling (Q. 29-31)", reference: "WSC Q. 29-31" });
    items.push({ label: "Benefits in this Life (Q. 32-36)", reference: "WSC Q. 32-36" });
    items.push({ label: "Benefits at Death & Resurrection (Q. 37-38)", reference: "WSC Q. 37-38" });

    items.push({ label: "V. The Moral Law (Q. 39-81)", reference: "WSC Q. 39-81", isHeader: true });
    items.push({ label: "Duty of Man (Q. 39-42)", reference: "WSC Q. 39-42" });
    items.push({ label: "Ten Commandments (Q. 43-81)", reference: "WSC Q. 43-81" });

    items.push({ label: "VI. Faith & Repentance (Q. 82-87)", reference: "WSC Q. 82-87", isHeader: true });

    items.push({ label: "VII. Means of Grace (Q. 88-97)", reference: "WSC Q. 88-97", isHeader: true });
    items.push({ label: "Word (Q. 89-90)", reference: "WSC Q. 89-90" });
    items.push({ label: "Sacraments (Q. 91-97)", reference: "WSC Q. 91-97" });

    items.push({ label: "VIII. The Lord's Prayer (Q. 98-107)", reference: "WSC Q. 98-107", isHeader: true });

  } else if (confession.id === 'westminster-larger') {
    items.push({ label: "I. Introduction (Q. 1-5)", reference: "WLC Q. 1-5", isHeader: true });
    items.push({ label: "Q. 1-5: Man's Chief End & Scope of Scripture", reference: "WLC Q. 1-5" });

    items.push({ label: "II. God & The Trinity (Q. 6-11)", reference: "WLC Q. 6-11", isHeader: true });
    items.push({ label: "Q. 6-11: Nature of God & The Trinity", reference: "WLC Q. 6-11" });

    items.push({ label: "III. Decrees & Creation (Q. 12-20)", reference: "WLC Q. 12-20", isHeader: true });
    items.push({ label: "Q. 12-14: God's Decrees", reference: "WLC Q. 12-14" });
    items.push({ label: "Q. 15-17: Creation & Angels", reference: "WLC Q. 15-17" });
    items.push({ label: "Q. 18-20: Creation of Man & Providence", reference: "WLC Q. 18-20" });

    items.push({ label: "IV. The Fall (Q. 21-29)", reference: "WLC Q. 21-29", isHeader: true });
    items.push({ label: "Q. 21-26: The Fall & Sin", reference: "WLC Q. 21-26" });
    items.push({ label: "Q. 27-29: Misery of the Fall", reference: "WLC Q. 27-29" });

    items.push({ label: "V. The Covenant of Grace (Q. 30-35)", reference: "WLC Q. 30-35", isHeader: true });
    items.push({ label: "Q. 30-35: God's Covenant with Man", reference: "WLC Q. 30-35" });

    items.push({ label: "VI. Christ the Mediator (Q. 36-56)", reference: "WLC Q. 36-56", isHeader: true });
    items.push({ label: "Q. 36-42: Person & Natures of Christ", reference: "WLC Q. 36-42" });
    items.push({ label: "Q. 43-45: Christ's Offices", reference: "WLC Q. 43-45" });
    items.push({ label: "Q. 46-50: Christ's Humiliation", reference: "WLC Q. 46-50" });
    items.push({ label: "Q. 51-56: Christ's Exaltation", reference: "WLC Q. 51-56" });

    items.push({ label: "VII. Application of Redemption (Q. 57-90)", reference: "WLC Q. 57-90", isHeader: true });
    items.push({ label: "Q. 57-60: The Church & Special Grace", reference: "WLC Q. 57-60" });
    items.push({ label: "Q. 61-65: The Visible & Invisible Church", reference: "WLC Q. 61-65" });
    items.push({ label: "Q. 66-69: Union & Communion with Christ", reference: "WLC Q. 66-69" });
    items.push({ label: "Q. 70-73: Justification", reference: "WLC Q. 70-73" });
    items.push({ label: "Q. 74: Adoption", reference: "WLC Q. 74" });
    items.push({ label: "Q. 75-78: Sanctification & Repentance", reference: "WLC Q. 75-78" });
    items.push({ label: "Q. 79-81: Perseverance & Assurance", reference: "WLC Q. 79-81" });
    items.push({ label: "Q. 82-90: Benefits at Death & Last Judgment", reference: "WLC Q. 82-90" });

    items.push({ label: "VIII. The Moral Law (Q. 91-149)", reference: "WLC Q. 91-149", isHeader: true });
    items.push({ label: "Q. 91-97: Duty & The Law", reference: "WLC Q. 91-97" });
    items.push({ label: "Q. 98-121: The First Table (1-4)", reference: "WLC Q. 98-121" });
    items.push({ label: "Q. 122-148: The Second Table (5-10)", reference: "WLC Q. 122-148" });
    items.push({ label: "Q. 149-153: Aggravations of Sin", reference: "WLC Q. 149-153" });

    items.push({ label: "IX. Means of Grace (Q. 154-196)", reference: "WLC Q. 154-196", isHeader: true });
    items.push({ label: "Q. 155-160: The Word of God", reference: "WLC Q. 155-160" });
    items.push({ label: "Q. 161-177: The Sacraments", reference: "WLC Q. 161-177" });
    items.push({ label: "Q. 178-185: Nature of Prayer", reference: "WLC Q. 178-185" });
    items.push({ label: "Q. 186-196: The Lord's Prayer", reference: "WLC Q. 186-196" });
  } else if (confession.id === 'heidelberg') {
    items.push({ label: "Introduction", reference: "Heidelberg LD 1", isHeader: true });
    items.push({ label: "Lord's Day 1: Comfort", reference: "Heidelberg LD 1" });

    items.push({ label: "Part I: Misery (LD 2-4)", reference: "Heidelberg LD 2-4", isHeader: true });
    items.push({ label: "LD 2: The Law", reference: "Heidelberg LD 2" });
    items.push({ label: "LD 3: The Fall", reference: "Heidelberg LD 3" });
    items.push({ label: "LD 4: Punishment", reference: "Heidelberg LD 4" });

    items.push({ label: "Part II: Deliverance (LD 5-31)", reference: "Heidelberg LD 5-31", isHeader: true });
    items.push({ label: "LD 5-8: The Mediator", reference: "Heidelberg LD 5-8" });

    items.push({ label: "God the Father", reference: "Heidelberg LD 9-10", isHeader: true });
    items.push({ label: "LD 9-10: God the Father", reference: "Heidelberg LD 9-10" });

    items.push({ label: "God the Son", reference: "Heidelberg LD 11-19", isHeader: true });
    items.push({ label: "LD 11-19: God the Son", reference: "Heidelberg LD 11-19" });

    items.push({ label: "God the Spirit", reference: "Heidelberg LD 20-24", isHeader: true });
    items.push({ label: "LD 20-24: God the Spirit", reference: "Heidelberg LD 20-24" });

    items.push({ label: "The Sacraments", reference: "Heidelberg LD 25-31", isHeader: true });
    items.push({ label: "LD 25-31: The Sacraments", reference: "Heidelberg LD 25-31" });

    items.push({ label: "Part III: Gratitude (LD 32-52)", reference: "Heidelberg LD 32-52", isHeader: true });
    items.push({ label: "LD 32-33: Introduction", reference: "Heidelberg LD 32-33" });

    items.push({ label: "Ten Commandments", reference: "Heidelberg LD 34-44", isHeader: true });
    items.push({ label: "LD 34-44: Ten Commandments", reference: "Heidelberg LD 34-44" });

    items.push({ label: "Lord's Prayer", reference: "Heidelberg LD 45-52", isHeader: true });
    items.push({ label: "LD 45-52: Lord's Prayer", reference: "Heidelberg LD 45-52" });
  } else if (confession.id === 'belgic') {
    belgicArticles.forEach((title, idx) => {
      items.push({ label: `Art. ${idx + 1}: ${title}`, reference: `Belgic Confession Art. ${idx + 1}` });
    });
  } else if (confession.id === 'canons-dort') {
    items.push({ label: "First Head: Divine Election", reference: "Canons of Dort Head 1", isHeader: true });
    for (let i = 1; i <= 18; i++) {
      items.push({ label: `Article ${i}`, reference: `Canons of Dort Head 1 Art ${i}` });
    }
    items.push({ label: "Rejection of Errors I", reference: "Canons of Dort Head 1 Rejection", isHeader: true });
    items.push({ label: "Click to View Errors", reference: "Canons of Dort Head 1 Rejection" });

    items.push({ label: "Second Head: Christ's Death", reference: "Canons of Dort Head 2", isHeader: true });
    for (let i = 1; i <= 9; i++) {
      items.push({ label: `Article ${i}`, reference: `Canons of Dort Head 2 Art ${i}` });
    }
    items.push({ label: "Rejection of Errors II", reference: "Canons of Dort Head 2 Rejection", isHeader: true });
    items.push({ label: "Click to View Errors", reference: "Canons of Dort Head 2 Rejection" });

    items.push({ label: "Third & Fourth Heads: Corruption & Conversion", reference: "Canons of Dort Head 3", isHeader: true });
    for (let i = 1; i <= 17; i++) {
      items.push({ label: `Article ${i}`, reference: `Canons of Dort Head 3 Art ${i}` });
    }
    items.push({ label: "Rejection of Errors III/IV", reference: "Canons of Dort Head 3 Rejection", isHeader: true });
    items.push({ label: "Click to View Errors", reference: "Canons of Dort Head 3 Rejection" });

    items.push({ label: "Fifth Head: Perseverance", reference: "Canons of Dort Head 5", isHeader: true });
    for (let i = 1; i <= 15; i++) {
      items.push({ label: `Article ${i}`, reference: `Canons of Dort Head 5 Art ${i}` });
    }
    items.push({ label: "Rejection of Errors V", reference: "Canons of Dort Head 5 Rejection", isHeader: true });
    items.push({ label: "Click to View Errors", reference: "Canons of Dort Head 5 Rejection" });

    items.push({ label: "Conclusion", reference: "Canons of Dort Conclusion", isHeader: true });
    items.push({ label: "Conclusion & Final Judgment", reference: "Canons of Dort Conclusion" });
  } else if (confession.id === 'apostles-creed') {
    apostlesCreedArticles.forEach((text, idx) => {
      items.push({ label: `Article ${idx + 1}`, reference: `Apostles' Creed Article ${idx + 1}` });
    });
  } else if (confession.id === 'second-helvetic') {
    secondHelveticChapters.forEach((title, idx) => {
      items.push({ label: `Ch. ${idx + 1}: ${title}`, reference: `Second Helvetic Confession Ch. ${idx + 1}` });
    });
  } else if (confession.id === 'scots-confession') {
    scotsChapters.forEach((title, idx) => {
      items.push({ label: `Ch. ${idx + 1}: ${title}`, reference: `The Scots Confession Ch. ${idx + 1}` });
    });
  } else if (confession.id === '1689-london') {
    lbcfChapters.forEach((title, idx) => {
      items.push({ label: `Ch. ${idx + 1}: ${title}`, reference: `1689 LBCF ${idx + 1}` });
    });
  } else if (confession.id === 'valley-of-vision') {
    items.push({ label: "Introduction", reference: "The Valley of Vision", isHeader: true });
    items.push({ label: "The Valley of Vision (Titular Prayer)", reference: "The Valley of Vision prayer 'The Valley of Vision'" });
    items.push({ label: "I. Father, Son, and Holy Spirit", reference: "The Valley of Vision section 'Father, Son, and Holy Spirit'" });
    items.push({ label: "II. Redemption and Reconciliation", reference: "The Valley of Vision section 'Redemption and Reconciliation'" });
    items.push({ label: "III. Penitence and Deprecation", reference: "The Valley of Vision section 'Penitence and Deprecation'" });
    items.push({ label: "IV. Needs and Devotions", reference: "The Valley of Vision section 'Needs and Devotions'" });
    items.push({ label: "V. Holy Aspirations", reference: "The Valley of Vision section 'Holy Aspirations'" });
    items.push({ label: "VI. Approach to God", reference: "The Valley of Vision section 'Approach to God'" });
    items.push({ label: "VII. Gifts of Grace", reference: "The Valley of Vision section 'Gifts of Grace'" });
    items.push({ label: "VIII. Service and Ministry", reference: "The Valley of Vision section 'Service and Ministry'" });
    items.push({ label: "IX. Valediction", reference: "The Valley of Vision section 'Valediction'" });
    items.push({ label: "X. A Week's Prayers", reference: "The Valley of Vision section 'A Week's Prayers'" });
  } else if (confession.id === 'institutes') {
    institutesStructure.forEach((book, bookIdx) => {
      items.push({ label: book.header, reference: `Institutes Book ${bookIdx + 1}`, isHeader: true });
      book.chapters.forEach((chap, chIdx) => {
        const chNum = chap.match(/Ch (\d+)/)?.[1];
        items.push({ label: chap, reference: `Institutes ${bookIdx + 1}.${chNum}` });
      });
    });
  } else {
    items.push({ label: "Read Document", reference: `${confession.shortTitle}` });
  }

  return items;
};
