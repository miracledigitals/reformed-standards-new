
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, Copy, Info, ChevronDown, ChevronUp, Quote } from 'lucide-react';

// --- Shared Typography Components ---

export const StyledH1 = ({ children }: { children?: React.ReactNode }) => (
  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-reformed-900 dark:text-reformed-50 border-b-2 border-reformed-200 dark:border-reformed-800 pb-6 mb-10 text-center tracking-wide leading-tight">
    {children}
  </h1>
);

export const StyledH2 = ({ children }: { children?: React.ReactNode }) => (
  <h2 className="font-display text-xl sm:text-2xl font-bold text-reformed-800 dark:text-reformed-100 mt-12 mb-6 flex items-center tracking-wide">
    <span className="w-8 h-px bg-reformed-400 mr-4 shrink-0 opacity-60"></span>
    {children}
    <span className="w-full h-px bg-reformed-200 dark:bg-reformed-800 ml-4 opacity-60"></span>
  </h2>
);

export const StyledH3 = ({ children }: { children?: React.ReactNode }) => (
  <h3 className="font-display text-lg sm:text-xl font-bold text-reformed-700 dark:text-reformed-200 mt-8 mb-4 uppercase tracking-wider border-l-4 border-reformed-400 pl-3">
    {children}
  </h3>
);

export const StyledP = ({ children }: { children?: React.ReactNode }) => (
  <p className="font-serif text-base sm:text-lg leading-loose text-reformed-800 dark:text-reformed-300 mb-6 last:mb-0 text-justify">
    {children}
  </p>
);

export const StyledUl = ({ children }: { children?: React.ReactNode }) => (
  <ul className="my-6 space-y-3 ml-2 sm:ml-4">
    {children}
  </ul>
);

export const StyledLi = ({ children }: { children?: React.ReactNode }) => (
  <li className="flex items-start font-serif text-reformed-800 dark:text-reformed-300 leading-relaxed text-base">
    <span className="mt-2.5 mr-3 w-1.5 h-1.5 bg-reformed-500 rounded-full shrink-0"></span>
    <span>{children}</span>
  </li>
);

export const StyledStrong = ({ children }: { children?: React.ReactNode }) => (
  <strong className="font-bold text-reformed-900 dark:text-reformed-100">
    {children}
  </strong>
);

export const StyledSeparator = () => (
  <div className="flex items-center justify-center my-12 opacity-50">
    <div className="w-16 h-px bg-gradient-to-r from-transparent to-reformed-400 dark:to-reformed-600"></div>
    <div className="mx-4 text-reformed-500 transform rotate-45">
      <div className="w-2 h-2 border border-reformed-500"></div>
    </div>
    <div className="w-16 h-px bg-gradient-to-l from-transparent to-reformed-400 dark:to-reformed-600"></div>
  </div>
);

// --- Functional Components ---

export const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-reformed-100/80 dark:bg-reformed-800/80 backdrop-blur-sm text-reformed-500 dark:text-reformed-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-reformed-900 dark:hover:text-reformed-100 hover:bg-white dark:hover:bg-reformed-700 shadow-sm z-10"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export const CollapsibleBlockquote = ({ children }: { children?: React.ReactNode }) => {
  const ref = useRef<HTMLQuoteElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const isSupplementary = useMemo(() => {
    let found = false;
    React.Children.forEach(children, (child) => {
      if (found) return;
      if (React.isValidElement(child) && child.type === 'p') {
        const props = child.props as { children?: React.ReactNode };
        React.Children.forEach(props.children, (grandChild) => {
          if (React.isValidElement(grandChild) && grandChild.type === 'strong') {
            const gcProps = grandChild.props as { children?: React.ReactNode };
            const text = String(gcProps.children || '');
            if (text.includes('Supplementary Material')) found = true;
          }
          if (typeof grandChild === 'string' && grandChild.includes('Supplementary Material:')) found = true;
        });
      }
    });
    return found;
  }, [children]);

  useEffect(() => {
    if (ref.current && !isSupplementary) {
      if (ref.current.scrollHeight > 250) {
        setIsOverflowing(true);
      }
    }
  }, [children, isSupplementary]);

  const getText = () => {
    return ref.current?.innerText || '';
  };

  if (isSupplementary) {
    return (
      <div className="my-6 border border-reformed-200 dark:border-reformed-800 rounded-lg overflow-hidden bg-white dark:bg-black/20 shadow-sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 bg-reformed-50 dark:bg-reformed-900/50 text-xs font-bold uppercase tracking-wider text-reformed-600 dark:text-reformed-400 hover:bg-reformed-100 dark:hover:bg-reformed-800 transition-colors"
        >
          <span className="flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Supplementary Material
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {isExpanded && (
          <div className="p-5 bg-white dark:bg-reformed-950 text-sm text-reformed-700 dark:text-reformed-300 font-serif border-t border-reformed-200 dark:border-reformed-800 animate-in slide-in-from-top-2 duration-200 leading-relaxed">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group my-8">
      <CopyButton text={getText()} />
      <div className={`relative transition-all duration-300 ${!isExpanded && isOverflowing ? 'max-h-[250px] overflow-hidden' : ''}`}>
        <div className="absolute top-0 left-0 text-reformed-300 dark:text-reformed-700 opacity-30 transform -translate-y-1/2 -translate-x-1/2">
          <Quote className="w-8 h-8 fill-current" />
        </div>
        <blockquote ref={ref} className="relative z-10 pl-6 sm:pl-8 py-2 pr-4 font-serif text-lg italic text-reformed-700 dark:text-reformed-300 border-l-4 border-reformed-400 dark:border-reformed-600 bg-gradient-to-r from-reformed-50 to-transparent dark:from-reformed-900/40 dark:to-transparent rounded-r-lg">
          {children}
        </blockquote>
        {!isExpanded && isOverflowing && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-reformed-950 to-transparent pointer-events-none" />
        )}
      </div>
      {isOverflowing && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-bold text-reformed-500 hover:text-reformed-800 dark:text-reformed-400 dark:hover:text-reformed-200 flex items-center transition-colors focus:outline-none ml-6 uppercase tracking-wide"
        >
          {isExpanded ? 'Show Less' : 'Continue Reading'}
          {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </button>
      )}
    </div>
  );
};

export const CopyablePre = ({ children }: { children?: React.ReactNode }) => {
  const ref = useRef<HTMLPreElement>(null);

  const getText = () => {
    return ref.current?.innerText || '';
  };

  return (
    <div className="relative group my-6">
      <CopyButton text={getText()} />
      <pre ref={ref} className="overflow-x-auto p-5 rounded-lg bg-reformed-900 dark:bg-black text-reformed-50 text-sm font-mono border border-reformed-700 shadow-inner">
        {children}
      </pre>
    </div>
  );
};

// Default styling mapping for ReactMarkdown
export const commonMarkdownComponents = {
  h1: StyledH1,
  h2: StyledH2,
  h3: StyledH3,
  p: StyledP,
  ul: StyledUl,
  li: StyledLi,
  strong: StyledStrong,
  hr: StyledSeparator,
  blockquote: ({ node, ...props }: any) => <CollapsibleBlockquote {...props} />,
  pre: ({ node, ...props }: any) => <CopyablePre {...props} />,
};
