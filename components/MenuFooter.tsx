
import React from 'react';
import { motion } from 'framer-motion';
import { Library, Book, Music, Coffee, GraduationCap, GitCompare, Layers, Workflow, Share2, Clock, Users, Bookmark, Scroll } from 'lucide-react';

interface MenuFooterProps {
    activeView: string;
    onViewChange: (view: any) => void;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    isRight?: boolean;
}> = ({ isActive, onClick, icon, label, isRight }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-200 group relative ${isActive
                ? 'bg-reformed-800/20 text-reformed-200'
                : 'text-reformed-400 hover:text-reformed-100 hover:bg-reformed-800/10'
            }`}
    >
        <div className={`${isActive ? 'text-reformed-200' : 'text-reformed-400 group-hover:text-reformed-200'}`}>
            {icon}
        </div>
        <span className={`text-[11px] font-bold uppercase tracking-wider hidden lg:block ${isActive ? 'text-reformed-100' : ''}`}>
            {label}
        </span>
        {isActive && (
            <motion.div
                layoutId="footer-active-indicator"
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-reformed-400 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />
        )}
    </motion.button>
);

export const MenuFooter: React.FC<MenuFooterProps> = ({ activeView, onViewChange }) => {
    const leftItems = [
        { id: 'library', label: 'Library', icon: Library },
        { id: 'bible', label: 'Bible', icon: Book },
        { id: 'hymnal', label: 'Hymnal', icon: Music },
    ];

    const rightItems = [
        { id: 'devotional', label: 'Daily', icon: Coffee },
        { id: 'augustine', label: 'Confessions', icon: Scroll },
        { id: 'study', label: 'Study', icon: GraduationCap },
        { id: 'comparison', label: 'Compare', icon: GitCompare },
        { id: 'systematics', label: 'Systematics', icon: Layers },
        { id: 'connections', label: 'Map', icon: Workflow },
        { id: 'cross-reference', label: 'Cross-Ref', icon: Share2 },
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'theologians', label: 'History', icon: Users },
        { id: 'notebook', label: 'Bookmarks', icon: Bookmark },
    ];

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-reformed-950/90 backdrop-blur-md border-t border-reformed-900/50 px-4 py-2 hidden sm:block">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">

                {/* Left Section */}
                <div className="flex-1 flex items-center justify-start space-x-1 min-w-0 overflow-x-auto no-scrollbar">
                    {leftItems.map((item) => (
                        <NavButton
                            key={item.id}
                            label={item.label}
                            icon={<item.icon className="w-4 h-4" />}
                            isActive={activeView === item.id}
                            onClick={() => onViewChange(item.id)}
                        />
                    ))}
                </div>

                {/* Center Logo Section */}
                <div className="shrink-0 px-4 flex flex-col items-center justify-center border-l border-r border-reformed-800/30">
                    <div className="flex flex-col items-center leading-none">
                        <span className="text-white font-display font-black text-sm tracking-[0.2em] uppercase">Reformed</span>
                        <span className="text-reformed-400 font-sans text-[8px] tracking-[0.4em] uppercase mt-0.5">Standards</span>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex-1 flex items-center justify-end space-x-1 min-w-0 overflow-x-auto no-scrollbar">
                    {rightItems.map((item) => (
                        <NavButton
                            key={item.id}
                            label={item.label}
                            icon={<item.icon className="w-4 h-4" />}
                            isActive={activeView === item.id}
                            onClick={() => onViewChange(item.id)}
                            isRight
                        />
                    ))}
                </div>

            </div>
        </footer>
    );
};
