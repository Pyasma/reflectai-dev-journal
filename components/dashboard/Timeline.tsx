'use client';

import { EntryCard } from './EntryCard';
import { format, isSameDay, parseISO } from 'date-fns';

interface TimelineProps {
  entries: Array<{
    id: string;
    session_date: string;
    command_type: string;
    user_message: string;
    ai_summary: string | null;
    ai_technical_details: string | null;
    repositories: {
      name: string;
      full_name: string;
      language: string | null;
    };
  }>;
}

export function Timeline({ entries }: TimelineProps) {
  // Group entries by date
  const groupedEntries: { [key: string]: typeof entries } = {};

  entries.forEach((entry) => {
    const date = format(parseISO(entry.session_date), 'yyyy-MM-dd');
    if (!groupedEntries[date]) {
      groupedEntries[date] = [];
    }
    groupedEntries[date].push(entry);
  });

  const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-4">
          {/* Date Header */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-32">
              <div className="text-sm font-medium text-muted-foreground">
                {format(parseISO(date), 'EEEE')}
              </div>
              <div className="text-2xl font-bold">
                {format(parseISO(date), 'MMM d, yyyy')}
              </div>
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Entries for this date */}
          <div className="pl-0 md:pl-36 space-y-4">
            {groupedEntries[date].map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
