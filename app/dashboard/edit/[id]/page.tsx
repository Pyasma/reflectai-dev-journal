'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Save, GitCommit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Repository {
  id: string;
  name: string;
  full_name: string;
}

interface Commit {
  commit_sha: string;
  commit_message: string;
  commit_author: string;
  commit_date: string;
}

interface JournalEntry {
  id: string;
  repository_id: string;
  command_type: string;
  user_message: string;
  ai_summary: string | null;
  ai_technical_details: string | null;
  user_lessons_learned: string | null;
  user_next_steps: string | null;
  repositories: {
    name: string;
    full_name: string;
  };
}

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;
  const { toast } = useToast();
  const supabase = createClient();

  // Form state
  const [repository, setRepository] = useState<Repository | null>(null);
  const [commandType, setCommandType] = useState<string>('development');
  const [userMessage, setUserMessage] = useState<string>('');
  const [commits, setCommits] = useState<Commit[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiTechnicalDetails, setAiTechnicalDetails] = useState<string>('');
  const [lessonsLearned, setLessonsLearned] = useState<string>('');
  const [nextSteps, setNextSteps] = useState<string>('');

  // Loading states
  const [isLoadingEntry, setIsLoadingEntry] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load entry on mount
  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        });
        router.push('/dashboard');
        return;
      }

      // Fetch journal entry with repository info
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .select(`
          id,
          repository_id,
          command_type,
          user_message,
          ai_summary,
          ai_technical_details,
          user_lessons_learned,
          user_next_steps,
          repositories:repository_id (
            id,
            name,
            full_name
          )
        `)
        .eq('id', entryId)
        .eq('user_id', user.id)
        .single();

      if (entryError || !entry) {
        toast({
          title: 'Error',
          description: 'Entry not found or access denied',
          variant: 'destructive',
        });
        router.push('/dashboard');
        return;
      }

      // Fetch commits for this entry
      const { data: commitsData, error: commitsError } = await supabase
        .from('entry_commits')
        .select('commit_sha, commit_message, commit_author, commit_date')
        .eq('entry_id', entryId)
        .order('commit_date', { ascending: false });

      if (commitsError) {
        console.error('Failed to load commits:', commitsError);
      }

      // Pre-fill form fields
      const repoData = Array.isArray(entry.repositories)
        ? entry.repositories[0]
        : entry.repositories;

      setRepository(repoData as Repository);
      setCommandType(entry.command_type);
      setUserMessage(entry.user_message);
      setAiSummary(entry.ai_summary || '');
      setAiTechnicalDetails(entry.ai_technical_details || '');
      setLessonsLearned(entry.user_lessons_learned || '');
      setNextSteps(entry.user_next_steps || '');
      setCommits(commitsData || []);
    } catch (error) {
      console.error('Failed to load entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to load journal entry',
        variant: 'destructive',
      });
      router.push('/dashboard');
    } finally {
      setIsLoadingEntry(false);
    }
  };

  const regenerateSummary = async () => {
    if (!repository || !userMessage) {
      toast({
        title: 'Missing information',
        description: 'Message is required to regenerate summary',
        variant: 'destructive',
      });
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryName: repository.name,
          commandType,
          userMessage,
          commits: commits.slice(0, 10).map(c => ({
            sha: c.commit_sha,
            message: c.commit_message,
            author: c.commit_author,
            date: c.commit_date,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to regenerate summary');
      }

      const data = await response.json();
      setAiSummary(data.summary);
      setAiTechnicalDetails(data.technicalDetails);

      toast({
        title: 'Success',
        description: 'AI summary regenerated successfully',
      });
    } catch (error: unknown) {
      console.error('Failed to regenerate summary:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to regenerate summary',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const updateEntry = async () => {
    if (!userMessage) {
      toast({
        title: 'Missing information',
        description: 'Message is required',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update journal entry
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({
          user_message: userMessage,
          ai_summary: aiSummary || null,
          ai_technical_details: aiTechnicalDetails || null,
          user_lessons_learned: lessonsLearned || null,
          user_next_steps: nextSteps || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Journal entry updated successfully',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to update entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update journal entry',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoadingEntry) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Journal Entry</h1>
        <p className="text-muted-foreground mt-1">
          Update your coding session details
        </p>
      </div>

      {/* Repository Selection (Locked) */}
      <Card>
        <CardHeader>
          <CardTitle>Repository</CardTitle>
          <CardDescription>
            Repository (locked)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={repository?.id} disabled>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={repository?.name || 'Loading...'} />
            </SelectTrigger>
            <SelectContent>
              {repository && (
                <SelectItem value={repository.id}>
                  {repository.name}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            The repository cannot be changed when editing an entry
          </p>
        </CardContent>
      </Card>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            Update what you worked on during this session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Session Type (locked)</Label>
            <RadioGroup value={commandType} disabled>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="development" id="development" />
                  <Label htmlFor="development" className="cursor-not-allowed opacity-60">Development</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maintenance" id="maintenance" />
                  <Label htmlFor="maintenance" className="cursor-not-allowed opacity-60">Maintenance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planning" id="planning" />
                  <Label htmlFor="planning" className="cursor-not-allowed opacity-60">Planning</Label>
                </div>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              The session type cannot be changed when editing an entry
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Describe what you worked on, the challenges you faced, and what you accomplished..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Commits (Read-only) */}
      {commits.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Commits</CardTitle>
                <CardDescription>
                  Commits from this journal entry
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {commits.length} commit{commits.length !== 1 && 's'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commits.map((commit) => (
                <div
                  key={commit.commit_sha}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{commit.commit_message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {commit.commit_author} • {new Date(commit.commit_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regenerate AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Summary</CardTitle>
          <CardDescription>
            Regenerate or edit the AI summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={regenerateSummary}
            disabled={isRegenerating || !userMessage}
            className="w-full"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Regenerate AI Summary
              </>
            )}
          </Button>

          {aiSummary && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Summary</Label>
                  <Textarea
                    value={aiSummary}
                    onChange={(e) => setAiSummary(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Technical Details</Label>
                  <Textarea
                    value={aiTechnicalDetails}
                    onChange={(e) => setAiTechnicalDetails(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lessons Learned */}
      <Card>
        <CardHeader>
          <CardTitle>Lessons Learned</CardTitle>
          <CardDescription>
            What insights did you gain from this session?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TiptapEditor
            content={lessonsLearned}
            onChange={setLessonsLearned}
            placeholder="What did you learn? What worked well? What would you do differently?"
          />
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            What should be done next?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TiptapEditor
            content={nextSteps}
            onChange={setNextSteps}
            placeholder="What are the logical next steps? What needs attention?"
          />
        </CardContent>
      </Card>

      {/* Update Button */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          Cancel
        </Button>
        <Button
          onClick={updateEntry}
          disabled={isUpdating || !userMessage}
          size="lg"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Update Entry
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
