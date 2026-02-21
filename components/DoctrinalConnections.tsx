

import React, { useState, useEffect } from 'react';
import { DOCTRINAL_CONNECTIONS } from '../constants';
import { ConnectionType, DoctrinalCategory } from '../types';
import { ArrowRight, RotateCcw, Filter, Network, Scale, ShieldCheck, ArrowLeft, Loader2, Scroll, Printer, ChevronRight, Bookmark, Copy, Check } from 'lucide-react';
import { getGeminiClient, DEFAULT_SAFETY_SETTINGS } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { commonMarkdownComponents } from './MarkdownComponents';
import { saveItem, isItemSaved, removeItem, getSavedItems } from '../services/storageService';

interface SelectedConcept {
    title: string;
    category: DoctrinalCategory;
    description: string;
}

interface DoctrinalConnectionsProps {
    initialConcept?: string | null;
}

export const DoctrinalConnections: React.FC<DoctrinalConnectionsProps> = ({ initialConcept }) => {
    const [selectedCategory, setSelectedCategory] = useState<DoctrinalCategory | 'All'>('All');
    const [selectedType, setSelectedType] = useState<ConnectionType | 'All'>('All');

    // Detail View State
    const [selectedConcept, setSelectedConcept] = useState<SelectedConcept | null>(null);
    const [conceptDetails, setConceptDetails] = useState<string | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Action State
    const [isSaved, setIsSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    // Auto-select concept if passed via props
    useEffect(() => {
        if (initialConcept) {
            const foundConnection = DOCTRINAL_CONNECTIONS.find(
                c => c.source.title === initialConcept || c.target.title === initialConcept
            );

            if (foundConnection) {
                const conceptToSelect = foundConnection.source.title === initialConcept
                    ? foundConnection.source
                    : foundConnection.target;

                // Only trigger if it's different from what's currently selected
                if (selectedConcept?.title !== conceptToSelect.title) {
                    handleConceptClick(conceptToSelect);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialConcept]);

    useEffect(() => {
        if (selectedConcept) {
            const refId = `connection-${selectedConcept.title}`;
            setIsSaved(isItemSaved(refId, 'connection'));
        }
    }, [selectedConcept, conceptDetails]);

    const filteredConnections = DOCTRINAL_CONNECTIONS.filter(conn => {
        const categoryMatch = selectedCategory === 'All' || conn.source.category === selectedCategory || conn.target.category === selectedCategory;
        const typeMatch = selectedType === 'All' || conn.type === selectedType;
        return categoryMatch && typeMatch;
    });

    const categories: DoctrinalCategory[] = (Array.from(new Set(DOCTRINAL_CONNECTIONS.flatMap(c => [c.source.category, c.target.category]))) as DoctrinalCategory[]).sort();

    const handleRefresh = () => {
        setSelectedCategory('All');
        setSelectedType('All');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleConceptClick = async (concept: SelectedConcept) => {
        setSelectedConcept(concept);
        setConceptDetails(null);
        setIsLoadingDetails(true);
        // Scroll to top to simulate page navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            const ai = getGeminiClient();
            const prompt = `
            Act as a Reformed Theologian and Professor. Provide a detailed theological analysis of the doctrine: "${concept.title}" (Category: ${concept.category}).
            Context Description: ${concept.description}

            Format the response in Markdown with the following specific sections:
            ## Overview
            Define the doctrine clearly and concisely in theological terms.

            ## Historical Context
            How was this doctrine formulated or defended in church history? Mention specific Reformed Confessions (Westminster, Heidelberg, Belgic, Canons of Dort) or key theologians (Calvin, Turretin, Hodge, etc.) where relevant.

            ## Scripture Foundations
            Provide key biblical texts that support this doctrine. List them with citations (Book Chapter:Verse) and a brief sentence on how they support the doctrine.

            ## Logical Connections
            Explain how this doctrine logically connects to other parts of systematic theology (e.g., how it flows from Theology Proper or leads to Soteriology).

            ## Related Doctrines
            List 3-5 related theological terms or concepts that a student should study next.

            Tone: Academic, reverent, and strictly Reformed (Confessional).
        `;

            const safetySettings = [...DEFAULT_SAFETY_SETTINGS];

            let text: string | undefined;

            // Attempt 1: With Search
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        temperature: 0.2,
                        maxOutputTokens: 8192,
                        tools: [{ googleSearch: {} }],
                        safetySettings: safetySettings
                    }
                });
                text = response.text;
            } catch (e) {
                console.warn("Primary generation attempt failed", e);
            }

            // Attempt 2: Fallback (No Search)
            if (!text) {
                console.log("Retrying without search...");
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        temperature: 0.3,
                        maxOutputTokens: 8192,
                        // No tools
                        safetySettings: safetySettings
                    }
                });
                text = response.text;
            }

            setConceptDetails(text || "Unable to generate details. Please try again.");
        } catch (e) {
            console.error(e);
            setConceptDetails("Error retrieving details. Please try again.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleBackToGrid = () => {
        setSelectedConcept(null);
        setConceptDetails(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleSave = () => {
        if (!selectedConcept || !conceptDetails) return;
        const refId = `connection-${selectedConcept.title}`;

        if (isSaved) {
            const items = getSavedItems();
            const item = items.find(i => i.refId === refId && i.type === 'connection');
            if (item) removeItem(item.id);
            setIsSaved(false);
        } else {
            saveItem({
                type: 'connection',
                refId: refId,
                title: selectedConcept.title,
                subtitle: selectedConcept.category,
                content: conceptDetails,
                userNotes: '',
                tags: ['Theology', 'Connection', selectedConcept.category]
            });
            setIsSaved(true);
        }
    };

    const handleCopy = () => {
        if (!conceptDetails) return;
        navigator.clipboard.writeText(conceptDetails);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getConnectionColor = (type: ConnectionType) => {
        switch (type) {
            case 'leads_to': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'supports': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'explains': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
            case 'contrasts': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getConnectionIcon = (type: ConnectionType) => {
        switch (type) {
            case 'leads_to': return <ArrowRight className="w-4 h-4" />;
            case 'supports': return <ShieldCheck className="w-4 h-4" />;
            case 'explains': return <Network className="w-4 h-4" />;
            case 'contrasts': return <Scale className="w-4 h-4" />;
        }
    };

    const getTypeLabel = (type: ConnectionType) => {
        return type.replace('_', ' ');
    };

    // Logic to find related connections for the sidebar
    const getRelatedConnections = (title: string) => {
        return DOCTRINAL_CONNECTIONS.filter(c => c.source.title === title || c.target.title === title);
    };

    // --- DETAIL VIEW RENDER ---
    if (selectedConcept) {
        const relatedLinks = getRelatedConnections(selectedConcept.title);

        return (
            <div className="min-h-screen bg-reformed-50 dark:bg-reformed-950 animate-in fade-in slide-in-from-right-8 duration-300">
                {/* Sticky Top Bar */}
                <div className="sticky top-16 z-30 bg-white/80 dark:bg-reformed-900/80 backdrop-blur-md border-b border-reformed-200 dark:border-reformed-800 px-4 py-3 sm:px-8 flex justify-between items-center">
                    <button
                        onClick={handleBackToGrid}
                        className="flex items-center text-sm font-bold text-reformed-600 dark:text-reformed-300 hover:text-reformed-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Connections
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handleToggleSave}
                            className={`p-2 rounded-full transition-colors ${isSaved ? 'bg-reformed-800 text-white' : 'text-reformed-500 hover:bg-reformed-100 dark:hover:bg-reformed-800'}`}
                            title={isSaved ? "Saved" : "Save Analysis"}
                        >
                            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="p-2 text-reformed-500 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
                            title="Copy Analysis"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="p-2 text-reformed-500 hover:bg-reformed-100 dark:hover:bg-reformed-800 rounded-full transition-colors"
                            title="Print Analysis"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="bg-reformed-900 dark:bg-black text-white px-4 py-12 sm:px-8 sm:py-16 text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-reformed-800 border border-reformed-700 text-xs font-bold uppercase tracking-widest text-reformed-300 mb-6">
                            <Scroll className="w-3 h-3" />
                            {selectedConcept.category}
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-display font-bold mb-6 leading-tight">
                            {selectedConcept.title}
                        </h1>
                        <p className="text-lg sm:text-xl text-reformed-200 font-serif italic max-w-2xl mx-auto">
                            {selectedConcept.description}
                        </p>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Analysis */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-reformed-900 rounded-xl shadow-sm border border-reformed-200 dark:border-reformed-800 p-8 sm:p-12 min-h-[400px]">
                            {isLoadingDetails ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-reformed-100 dark:border-reformed-800 rounded-full"></div>
                                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-reformed-500 border-t-transparent rounded-full animate-spin"></div>
                                        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-reformed-500 animate-pulse" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-reformed-900 dark:text-reformed-100 mb-2">Conducting Theological Analysis</h3>
                                        <p className="text-reformed-500 dark:text-reformed-400 font-serif text-sm">Consulting Confessions, Catechisms, and Scripture...</p>
                                    </div>
                                </div>
                            ) : (
                                // Use unified components
                                <div className="max-w-none">
                                    <ReactMarkdown components={commonMarkdownComponents}>
                                        {conceptDetails || ''}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* System Context Card */}
                        <div className="bg-reformed-50 dark:bg-reformed-900/50 rounded-xl border border-reformed-200 dark:border-reformed-800 p-6 sticky top-32">
                            <h3 className="text-sm font-bold text-reformed-900 dark:text-reformed-100 uppercase tracking-wider mb-6 flex items-center">
                                <Network className="w-4 h-4 mr-2" />
                                Systematic Context
                            </h3>

                            {relatedLinks.length > 0 ? (
                                <div className="space-y-4">
                                    {relatedLinks.map((link) => {
                                        const isSource = link.source.title === selectedConcept.title;
                                        const otherNode = isSource ? link.target : link.source;

                                        return (
                                            <button
                                                key={link.id}
                                                onClick={() => handleConceptClick(otherNode)}
                                                className="w-full text-left bg-white dark:bg-reformed-900 p-4 rounded-lg shadow-sm border border-reformed-200 dark:border-reformed-800 hover:shadow-md hover:border-reformed-400 dark:hover:border-reformed-600 transition-all group"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getConnectionColor(link.type)}`}>
                                                        {getTypeLabel(link.type)}
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-reformed-300 group-hover:text-reformed-600 transition-colors" />
                                                </div>
                                                <div className="font-display font-bold text-reformed-900 dark:text-reformed-100 mb-1">
                                                    {otherNode.title}
                                                </div>
                                                <div className="text-xs text-reformed-500 dark:text-reformed-400 font-serif line-clamp-2">
                                                    {otherNode.description}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-reformed-500 italic">No direct systematic connections mapped in this diagram.</p>
                            )}

                            <div className="mt-8 pt-6 border-t border-reformed-200 dark:border-reformed-800">
                                <h4 className="text-xs font-bold text-reformed-500 dark:text-reformed-400 uppercase tracking-wider mb-2">
                                    Study Tools
                                </h4>
                                <p className="text-xs text-reformed-600 dark:text-reformed-400 font-serif mb-4">
                                    Use the chat to ask specific questions about this doctrine.
                                </p>
                                {/* Placeholder for future tools */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- GRID VIEW RENDER (Existing) ---
    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative min-h-screen">
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
                <div className="inline-flex items-center justify-center p-3 bg-reformed-900 dark:bg-reformed-100 text-reformed-50 dark:text-reformed-900 rounded-xl mb-6 shadow-lg">
                    <Network className="w-8 h-8" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-4 transition-colors">
                    Doctrinal Connections
                </h2>
                <p className="text-lg text-reformed-700 dark:text-reformed-200 max-w-3xl mx-auto font-serif transition-colors leading-relaxed">
                    Explore the logical relationships between Reformed doctrines. Click on any doctrine card to open its detailed theological analysis page.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-reformed-900 rounded-xl shadow-sm border border-reformed-200 dark:border-reformed-800 p-4 mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-reformed-500 dark:text-reformed-400 font-bold uppercase tracking-wider text-xs w-full md:w-auto">
                    <Filter className="w-4 h-4" /> Filter By:
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1 justify-end">
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as DoctrinalCategory | 'All')}
                            className="w-full sm:w-48 appearance-none bg-reformed-50 dark:bg-reformed-800 border border-reformed-200 dark:border-reformed-700 text-reformed-900 dark:text-reformed-100 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-reformed-500 text-sm font-medium"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-reformed-500">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as ConnectionType | 'All')}
                            className="w-full sm:w-48 appearance-none bg-reformed-50 dark:bg-reformed-800 border border-reformed-200 dark:border-reformed-700 text-reformed-900 dark:text-reformed-100 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-reformed-500 text-sm font-medium"
                        >
                            <option value="All">All Types</option>
                            <option value="leads_to">Leads To</option>
                            <option value="supports">Supports</option>
                            <option value="explains">Explains</option>
                            <option value="contrasts">Contrasts</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-reformed-500">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
                {(['leads_to', 'supports', 'explains', 'contrasts'] as ConnectionType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(selectedType === type ? 'All' : type)}
                        className={`flex items-center px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all
                    ${getConnectionColor(type)} 
                    ${selectedType !== 'All' && selectedType !== type ? 'opacity-40 grayscale' : 'opacity-100'}
                `}
                    >
                        <span className="mr-2">{getConnectionIcon(type)}</span>
                        {getTypeLabel(type)}
                    </button>
                ))}
            </div>

            {/* Connections Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredConnections.map((conn) => (
                    <div
                        key={conn.id}
                        className="bg-white dark:bg-reformed-900 rounded-xl shadow-md border border-reformed-200 dark:border-reformed-800 overflow-hidden flex flex-col md:flex-row group"
                    >
                        {/* Source - Clickable */}
                        <div
                            onClick={() => handleConceptClick(conn.source)}
                            className="flex-1 p-6 md:p-8 bg-reformed-50 dark:bg-reformed-950/50 flex flex-col justify-center relative cursor-pointer hover:bg-reformed-100 dark:hover:bg-reformed-900/80 transition-colors group/source"
                        >
                            <div className="absolute top-4 left-6 text-[10px] font-bold uppercase tracking-widest text-reformed-400 bg-white dark:bg-reformed-900 px-2 py-1 rounded border border-reformed-200 dark:border-reformed-800 group-hover/source:bg-reformed-50 dark:group-hover/source:bg-reformed-800">
                                {conn.source.category}
                            </div>
                            <h3 className="text-xl md:text-2xl font-display font-bold text-reformed-900 dark:text-reformed-100 mt-4 mb-2 group-hover/source:text-reformed-700 dark:group-hover/source:text-reformed-50 transition-colors underline decoration-dotted decoration-reformed-300 dark:decoration-reformed-700 underline-offset-4">
                                {conn.source.title}
                            </h3>
                            <p className="text-reformed-600 dark:text-reformed-400 font-serif text-sm">
                                {conn.source.description}
                            </p>
                            <div className="mt-4 flex items-center text-xs font-bold text-reformed-400 uppercase tracking-wider opacity-0 group-hover/source:opacity-100 transition-opacity">
                                View Analysis <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>

                        {/* Connection Node */}
                        <div className="relative flex flex-col items-center justify-center p-4 md:px-8 border-y md:border-y-0 md:border-x border-reformed-200 dark:border-reformed-800 bg-white dark:bg-reformed-900 z-10 min-w-[200px]">
                            <div className={`
                         flex flex-col items-center justify-center
                         px-4 py-2 rounded-lg border-2 font-bold uppercase text-xs tracking-wider mb-3 shadow-sm
                         ${getConnectionColor(conn.type)}
                      `}>
                                <span className="mb-1">{getConnectionIcon(conn.type)}</span>
                                {getTypeLabel(conn.type)}
                            </div>
                            <div className="text-center font-serif text-sm italic text-reformed-700 dark:text-reformed-300 leading-snug max-w-[200px]">
                                "{conn.reasoning}"
                            </div>
                            {/* Decorative Lines */}
                            <div className="absolute top-1/2 -left-4 w-4 h-0.5 bg-reformed-200 dark:bg-reformed-800 hidden md:block"></div>
                            <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-reformed-200 dark:bg-reformed-800 hidden md:block"></div>
                            <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-reformed-200 dark:bg-reformed-800 md:hidden"></div>
                            <div className="absolute -bottom-4 left-1/2 w-0.5 h-4 bg-reformed-200 dark:bg-reformed-800 md:hidden"></div>
                        </div>

                        {/* Target - Clickable */}
                        <div
                            onClick={() => handleConceptClick(conn.target)}
                            className="flex-1 p-6 md:p-8 bg-reformed-900 dark:bg-black/40 flex flex-col justify-center relative text-white cursor-pointer hover:bg-reformed-800 dark:hover:bg-black/60 transition-colors group/target"
                        >
                            <div className="absolute top-4 left-6 text-[10px] font-bold uppercase tracking-widest text-reformed-300 bg-reformed-800 px-2 py-1 rounded border border-reformed-700 group-hover/target:bg-reformed-700 group-hover/target:border-reformed-600">
                                {conn.target.category}
                            </div>
                            <h3 className="text-xl md:text-2xl font-display font-bold text-white mt-4 mb-2 underline decoration-dotted decoration-reformed-600 underline-offset-4">
                                {conn.target.title}
                            </h3>
                            <p className="text-reformed-200 font-serif text-sm opacity-90">
                                {conn.target.description}
                            </p>
                            <div className="mt-4 flex items-center text-xs font-bold text-reformed-300 uppercase tracking-wider opacity-0 group-hover/target:opacity-100 transition-opacity">
                                View Analysis <ArrowRight className="w-3 h-3 ml-1" />
                            </div>
                        </div>
                    </div>
                ))}

                {filteredConnections.length === 0 && (
                    <div className="text-center py-20 bg-reformed-50 dark:bg-reformed-900/50 rounded-xl border-2 border-dashed border-reformed-200 dark:border-reformed-800">
                        <Network className="w-12 h-12 mx-auto text-reformed-300 mb-4" />
                        <p className="text-reformed-500 font-medium">No connections found matching your filters.</p>
                        <button onClick={handleRefresh} className="mt-4 text-reformed-700 dark:text-reformed-300 underline text-sm">Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};
