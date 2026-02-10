
import React, { useMemo } from 'react';
import { THEOLOGIANS, CONFESSIONS } from '../constants';
import { Confession } from '../types';
import { Clock, History, Scroll, User } from 'lucide-react';

interface HistoricalTimelineProps {
  onSelectConfession: (confession: Confession) => void;
}

export const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({ onSelectConfession }) => {
  const timelineData = useMemo(() => {
    const items: Array<{
      year: number;
      label: string;
      type: 'theologian' | 'confession';
      data: any;
    }> = [];

    THEOLOGIANS.forEach(t => {
      const birthYear = parseInt(t.dates.split('–')[0]);
      if (!isNaN(birthYear)) {
        items.push({ year: birthYear, label: t.name, type: 'theologian', data: t });
      }
    });

    CONFESSIONS.forEach(c => {
      const yearStr = c.date.split(' ')[0].replace(/[^0-9]/g, '');
      const year = parseInt(yearStr);
      if (!isNaN(year)) {
        items.push({ year, label: c.shortTitle, type: 'confession', data: c });
      }
    });

    return items.sort((a, b) => a.year - b.year);
  }, []);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-reformed-900 text-white rounded-full mb-6">
          <History className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-reformed-900 dark:text-reformed-50 mb-4">
          Historical Timeline
        </h2>
        <p className="text-lg text-reformed-700 dark:text-reformed-200 font-serif">
          Chronological mapping of the giants and documents of the Reformed Faith.
        </p>
      </div>

      <div className="relative border-l-4 border-reformed-200 dark:border-reformed-800 ml-4 sm:ml-8 pl-8 space-y-12">
        {timelineData.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[42px] top-0 w-5 h-5 bg-white dark:bg-reformed-900 border-4 border-reformed-800 dark:border-reformed-400 rounded-full z-10 group-hover:scale-125 transition-transform"></div>

            {/* Year Badge */}
            <div className="inline-block bg-reformed-800 text-white px-3 py-1 rounded-md text-xs font-bold font-mono mb-3 shadow-md">
              {item.year}
            </div>

            <div className={`p-6 rounded-xl border transition-all ${item.type === 'confession'
                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 hover:shadow-lg cursor-pointer'
                : 'bg-white dark:bg-reformed-900 border-reformed-200 dark:border-reformed-800'
              }`}
              onClick={() => item.type === 'confession' && onSelectConfession(item.data)}
            >
              <div className="flex items-center gap-2 mb-2">
                {item.type === 'confession' ? <Scroll className="w-4 h-4 text-amber-600" /> : <User className="w-4 h-4 text-reformed-600" />}
                <h3 className="text-lg font-display font-bold text-reformed-900 dark:text-reformed-100">
                  {item.label}
                </h3>
              </div>

              <p className="text-sm text-reformed-600 dark:text-reformed-400 font-serif leading-relaxed">
                {item.data.description}
              </p>

              {item.type === 'confession' && (
                <div className="mt-4 text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Document <Clock className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
