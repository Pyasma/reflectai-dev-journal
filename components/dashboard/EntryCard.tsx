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
  development: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  maintenance: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  planning: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
};

export function EntryCard({ entry }: EntryCardProps) {
  const sessionDate = new Date(entry.session_date);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono text-xs">
                {entry.repositories.name}
              </Badge>
              <Badge
                variant="secondary"
                className={commandTypeColors[entry.command_type as keyof typeof commandTypeColors]}
              >
                {entry.command_type}
              </Badge>
              {entry.repositories.language && (
                <Badge variant="secondary" className="text-xs">
                  {entry.repositories.language}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg line-clamp-2">
              {entry.user_message}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <time dateTime={entry.session_date}>
              {format(sessionDate, 'MMM d, yyyy')}
            </time>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entry.ai_summary && (
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2 text-muted-foreground">Summary</h4>
            <p className="text-sm line-clamp-3">{entry.ai_summary}</p>
          </div>
        )}

        {entry.ai_technical_details && (
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2 text-muted-foreground">Technical Details</h4>
            <div
              className="text-sm line-clamp-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: entry.ai_technical_details }}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <GitCommit className="h-3 w-3" />
            <span>View full entry</span>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/edit/${entry.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
