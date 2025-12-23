'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, GitCommit, Edit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface EntryCardProps {
  entry: {
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
  };
}

const commandTypeColors = {
  development: 'bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-400 border-blue-500/40',
  maintenance: 'bg-yellow-500/20 dark:bg-yellow-500/30 text-yellow-700 dark:text-yellow-400 border-yellow-500/40',
  planning: 'bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-purple-400 border-purple-500/40',
};

export function EntryCard({ entry }: EntryCardProps) {
  const sessionDate = new Date(entry.session_date);

  return (
    <Link href={`/dashboard/entry/${entry.id}`} className="block">
      <Card className="group hover-lift hover:shadow-2xl dark:hover:shadow-[0_20px_60px_rgba(249,115,22,0.3)] transition-all duration-500 hover:border-primary/40 cursor-pointer overflow-hidden">
        {/* Animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-primary/5 transition-all duration-500 pointer-events-none" />
        
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className="font-mono text-xs hover:scale-105 transition-transform duration-300 animate-fade-in"
                >
                  {entry.repositories.name}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`${commandTypeColors[entry.command_type as keyof typeof commandTypeColors]} hover:scale-105 transition-transform duration-300 animate-fade-in animation-delay-100`}
                >
                  {entry.command_type}
                </Badge>
                {entry.repositories.language && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs hover:scale-105 transition-transform duration-300 animate-fade-in animation-delay-200"
                  >
                    {entry.repositories.language}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {entry.user_message}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-orange-400 text-sm group-hover:text-primary transition-colors duration-300">
              <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <time dateTime={entry.session_date}>
                {format(sessionDate, 'MMM d, yyyy')}
              </time>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          {entry.ai_summary && (
            <div className="mb-4 animate-fade-in-up">
              <h4 className="font-medium text-sm mb-2 text-orange-400 group-hover:text-primary/80 transition-colors duration-300">Summary</h4>
              <p className="text-sm line-clamp-3 leading-relaxed">{entry.ai_summary}</p>
            </div>
          )}

          {entry.ai_technical_details && (
            <div className="mb-4 animate-fade-in-up animation-delay-100">
              <h4 className="font-medium text-sm mb-2 text-muted-foreground dark:text-neutral-200 group-hover:text-primary/80 transition-colors duration-300">Technical Details</h4>
              <div
                className="text-sm line-clamp-4 prose prose-sm max-w-none dark:prose-invert dark:text-neutral-300"
                dangerouslySetInnerHTML={{ __html: entry.ai_technical_details }}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/50 group-hover:border-primary/30 transition-colors duration-300">
            <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary/70 transition-colors duration-300">
              <GitCommit className="h-3 w-3 group-hover:rotate-90 transition-transform duration-500" />
              <span>View full entry</span>
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/dashboard/edit/${entry.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover-scale hover:shadow-lg hover:border-primary/50 dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
