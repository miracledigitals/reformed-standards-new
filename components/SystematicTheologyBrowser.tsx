
import React, { useState, useEffect } from 'react';
import { SYSTEMATIC_THEOLOGY_STRUCTURE } from '../constants';
import { ChevronRight, ChevronDown, BookOpen, Layers, Menu, X, Loader2, Bookmark, Check, Copy } from 'lucide-react';
import { getGeminiClient, DEFAULT_SAFETY_SETTINGS } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { commonMarkdownComponents } from './MarkdownComponents';
import { saveItem, isItemSaved, removeItem, getSavedItems } from '../services/storageService';

export const SystematicTheologyBrowser: React.FC = () => {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([SYSTEMATIC_THEOLOGY_STRUCTURE[0].category]));
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [content, setContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    // Auto-load the first topic of the first category if nothing is selected
    useEffect(() => {
        if (!selectedTopic) {
            handleTopicSelect(SYSTEMATIC_THEOLOGY_STRUCTURE[0].topics[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedTopic) {
            const refId = `systematic-${selectedTopic}`;
            setIsSaved(isItemSaved(refId, 'systematic'));
        }
    }, [selectedTopic, content]);

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const handleTopicSelect = async (topic: string) => {
        setSelectedTopic(topic);
        setIsLoading(true);

        // Close sidebar on mobile upon selection
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }

        try {
            // Check cache
            const cacheKey = `systematic-${topic}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setContent(cached);
                setIsLoading(false);
                return;
            }

            const ai = getGeminiClient();
            const prompt = `
            Provide a comprehensive theological summary of "${topic}" from a strictly Reformed perspective.
            
            Structure the response in Markdown with the following sections:
            
            # ${topic}

            ## 1. Definition
            A precise theological definition.

            ## 2. Biblical Basis
            Key Scripture proofs (cite ESV/NASB).

            ## 3. Confessional Support
            Direct citations from the Westminster Standards, Three Forms of Unity, or Second Helvetic Confession.

            ## 4. Key Distinctions
            Clarify any common misunderstandings or distinctions (e.g., distinguishing this from Roman Catholic or Arminian views).
        `;

            const safetySettings = [...DEFAULT_SAFETY_SETTINGS];

            let text: string | undefined;

            // Attempt 1: With Search Grounding
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt + " Use Google Search to verify citations.",
                    config: {
                        temperature: 0.3,
                        maxOutputTokens: 8192,
                        tools: [{ googleSearch: {} }],
                        safetySettings: safetySettings
                    }
                });
                text = response.text;
            } catch (e) {
                console.warn("Primary generation attempt failed, trying fallback...", e);
            }

            // Attempt 2: Fallback to Internal Knowledge (No Search) if Attempt 1 failed or returned empty
            if (!text) {
                console.log("Attempting fallback generation without search tools...");
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt, // Removed search instruction
                    config: {
                        temperature: 0.4,
                        maxOutputTokens: 8192,
                        // No tools provided here to avoid search-related blocks
                        safetySettings: safetySettings
                    }
                });
                text = response.text;
            }

            if (!text) {
                setContent("### Content Unavailable\n\nWe apologize, but we could not generate this content at the moment. Please check your internet connection or try selecting the topic again.");
            } else {
                setContent(text);
                localStorage.setItem(cacheKey, text);
            }

        } catch (error) {
            console.error(error);
            setContent("### System Error\n\nAn unexpected error occurred while communicating with the knowledge base. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSave = () => {
        if (!selectedTopic || !content) return;
        const refId = `systematic-${selectedTopic}`;

        if (isSaved) {
            const items = getSavedItems();
            const item = items.find(i => i.refId === refId && i.type === 'systematic');
            if (item) removeItem(item.id);
            setIsSaved(false);
        } else {
            saveItem({
                type: 'systematic',
                refId: refId,
                title: `Systematic Theology: ${selectedTopic}`,
                subtitle: 'Reformed Standards',
                content: content,
                userNotes: '',
                tags: ['Systematic', 'Theology', selectedTopic]
            });
            setIsSaved(true);
        }
    };

    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-reformed-50 dark:bg-black/20 overflow-hidden relative">

            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden absolute top-4 left-4 z-40 p-2 bg-reformed-800 text-white rounded-md shadow-lg"
            >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar Navigation */}
            <aside
                className={`
            fixed lg:static inset-y-0 left-0 z-30 w-72 bg-reformed-900/95 dark:bg-black/95 backdrop-blur-md text-reformed-100 border-r border-reformed-800 dark:border-reformed-900 transform transition-transform duration-300 ease-in-out flex flex-col
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="p-4 border-b border-reformed-800 flex items-center justify-between">
                    <h2 className="font-display font-bold text-lg tracking-wide text-white flex items-center">
                        <Layers className="w-5 h-5 mr-2" />
                        SYSTEMATIC THEOLOGY
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {SYSTEMATIC_THEOLOGY_STRUCTURE.map((section) => (
                        <div key={section.category} className="mb-1">
                            <button
                                onClick={() => toggleCategory(section.category)}
                                className="w-full flex items-center justify-between p-3 text-sm font-bold uppercase tracking-wider text-reformed-300 hover:text-white hover:bg-reformed-800 rounded-md transition-colors text-left"
                            >
                                <span>{section.category}</span>
                                {expandedCategories.has(section.category) ? (
                                    <ChevronDown className="w-4 h-4 shrink-0 ml-2" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 shrink-0 ml-2" />
                                )}
                            </button>

                            {expandedCategories.has(section.category) && (
                                <div className="mt-1 ml-2 space-y-0.5 border-l-2 border-reformed-800 pl-2">
                                    {section.topics.map((topic) => (
                                        <button
                                            key={topic}
                                            onClick={() => handleTopicSelect(topic)}
                                            className={`
                                        w-full text-left px-3 py-2 text-sm font-serif rounded-md transition-all
                                        ${selectedTopic === topic
                                                    ? 'bg-reformed-800 text-white shadow-sm border-l-4 border-reformed-500 pl-2'
                                                    : 'text-reformed-400 hover:text-reformed-100 hover:bg-reformed-800/50'}
                                    `}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-reformed-800 text-xs text-reformed-500 text-center font-sans">
                    Select a doctrine to view analysis
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-white dark:bg-reformed-950 p-4 lg:p-12 relative w-full" onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}>
                {/* Top decorative bar & toolbar */}
                <div className="h-14 absolute top-0 left-0 right-0 z-20 flex justify-end items-center px-4 bg-white/90 dark:bg-reformed-950/90 backdrop-blur-sm border-b border-reformed-200 dark:border-reformed-800">
                    <div className="flex gap-2">
                        <button
                            onClick={handleToggleSave}
                            className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-reformed-800 text-white' : 'text-reformed-500 hover:bg-reformed-100 dark:hover:bg-reformed-800'}`}
                            title={isSaved ? "Saved to Bookmarks" : "Bookmark this"}
                            disabled={isLoading}
                        >
                            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="p-2 text-reformed-500 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
                            title="Copy Text"
                            disabled={isLoading}
                        >
                            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto pt-16 lg:pt-8 pb-12">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 animate-in fade-in duration-500">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-reformed-100 dark:border-reformed-800 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-reformed-600 border-t-transparent rounded-full animate-spin"></div>
                                <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-reformed-600 animate-pulse" />
                            </div>
                            <p className="text-reformed-500 dark:text-reformed-400 font-serif text-lg">Consulting the Standards...</p>
                        </div>
                    ) : (
                        // Use custom components instead of prose class
                        <div className="animate-in fade-in duration-500">
                            <ReactMarkdown components={commonMarkdownComponents}>
                                {content || ''}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
