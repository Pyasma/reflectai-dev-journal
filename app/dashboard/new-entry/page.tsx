'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2, RefreshCw, Sparkles, Save, GitCommit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Repository {
  id: string;
  name: string;
  full_name: string;
}

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export default function NewEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Form state
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [commandType, setCommandType] = useState<string>('development');
  const [userMessage, setUserMessage] = useState<string>('');
  const [commits, setCommits] = useState<Commit[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiTechnicalDetails, setAiTechnicalDetails] = useState<string>('');
  const [lessonsLearned, setLessonsLearned] = useState<string>('');
  const [nextSteps, setNextSteps] = useState<string>('');

  // Loading states
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isSyncingRepos, setIsSyncingRepos] = useState(false);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load repositories on mount
  useEffect(() => {
    loadRepositories();
  }, []);

  // Load commits when repository is selected
  useEffect(() => {
    if (selectedRepo) {
      loadCommits();
    }
  }, [selectedRepo]);

  const loadRepositories = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('repositories')
        .select('id, name, full_name')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      setRepositories(data || []);
    } catch (error) {
      console.error('Failed to load repositories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load repositories',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const syncRepositories = async () => {
    setIsSyncingRepos(true);
    try {
      const response = await fetch('/api/github/sync-repos', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync repositories');
      }

      await loadRepositories();
      toast({
        title: 'Success',
        description: 'Repositories synced successfully',
      });
    } catch (error) {
      console.error('Failed to sync repositories:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync repositories',
        variant: 'destructive',
      });
    } finally {
      setIsSyncingRepos(false);
    }
  };

  const loadCommits = async () => {
    if (!selectedRepo) return;

    setIsLoadingCommits(true);
    try {
      const repo = repositories.find((r) => r.id === selectedRepo);
      if (!repo) return;

      const [owner, repoName] = repo.full_name.split('/');

      // Get last entry date for this repo to fetch commits since then
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lastEntry } = await supabase
        .from('journal_entries')
        .select('session_date')
        .eq('user_id', user.id)
        .eq('repository_id', selectedRepo)
        .order('session_date', { ascending: false })
        .limit(1)
        .single();

      const since = lastEntry?.session_date || undefined;

      const params = new URLSearchParams({
        owner,
        repo: repoName,
        ...(since && { since: new Date(since).toISOString() }),
      });

      const response = await fetch(`/api/github/commits?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch commits');
      }

      const data = await response.json();
      setCommits(data.commits || []);
    } catch (error) {
      console.error('Failed to load commits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load commits',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCommits(false);
    }
  };

  const generateSummary = async () => {
    if (!selectedRepo || !userMessage) {
      toast({
        title: 'Missing information',
        description: 'Please select a repository and enter a message',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const repo = repositories.find((r) => r.id === selectedRepo);
      if (!repo) return;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryName: repo.name,
          commandType,
          userMessage,
          commits: commits.slice(0, 10), // Send up to 10 commits
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate summary');
      }

      const data = await response.json();
      setAiSummary(data.summary);
      setAiTechnicalDetails(data.technicalDetails);

      toast({
        title: 'Success',
        description: 'AI summary generated successfully',
      });
    } catch (error: unknown) {
      console.error('Failed to generate summary:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate summary',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveEntry = async () => {
    if (!selectedRepo || !userMessage) {
      toast({
        title: 'Missing information',
        description: 'Please select a repository and enter a message',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user settings to get model used
      const { data: settings } = await supabase
        .from('user_settings')
        .select('gemini_model_preference')
        .eq('user_id', user.id)
        .single();

      // Insert journal entry
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          repository_id: selectedRepo,
          session_date: new Date().toISOString(),
          command_type: commandType,
          user_message: userMessage,
          ai_summary: aiSummary || null,
          ai_technical_details: aiTechnicalDetails || null,
          user_lessons_learned: lessonsLearned || null,
          user_next_steps: nextSteps || null,
          gemini_model_used: settings?.gemini_model_preference || null,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Insert entry commits
      if (commits.length > 0 && entry) {
        const commitsToInsert = commits.map((commit) => ({
          entry_id: entry.id,
          commit_sha: commit.sha,
          commit_message: commit.message,
          commit_author: commit.author,
          commit_date: commit.date,
        }));

        const { error: commitsError } = await supabase
          .from('entry_commits')
          .insert(commitsToInsert);

        if (commitsError) {
          console.error('Failed to save commits:', commitsError);
        }
      }

      toast({
        title: 'Success',
        description: 'Journal entry saved successfully',
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to save entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save journal entry',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingRepos) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Journal Entry</h1>
        <p className="text-muted-foreground mt-1">
          Document your coding session and let AI help you reflect
        </p>
      </div>

      {/* Repository Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Repository</CardTitle>
          <CardDescription>
            Select the repository you worked on
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={syncRepositories}
              disabled={isSyncingRepos}
              variant="outline"
            >
              {isSyncingRepos ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          {repositories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No repositories found. Click the refresh button to sync your GitHub repositories.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            Describe what you worked on during this session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Session Type</Label>
            <RadioGroup value={commandType} onValueChange={setCommandType}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="development" id="development" />
                  <Label htmlFor="development" className="cursor-pointer">Development</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maintenance" id="maintenance" />
                  <Label htmlFor="maintenance" className="cursor-pointer">Maintenance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planning" id="planning" />
                  <Label htmlFor="planning" className="cursor-pointer">Planning</Label>
                </div>
              </div>
            </RadioGroup>
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

      {/* Commits */}
      {selectedRepo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Commits</CardTitle>
                <CardDescription>
                  Commits since your last journal entry
                </CardDescription>
              </div>
              <Badge variant="secondary">
                {commits.length} commit{commits.length !== 1 && 's'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCommits ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : commits.length > 0 ? (
              <div className="space-y-2">
                {commits.slice(0, 10).map((commit) => (
                  <div
                    key={commit.sha}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{commit.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {commit.author} • {new Date(commit.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No commits found since last entry
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generate AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Summary</CardTitle>
          <CardDescription>
            Let Gemini AI analyze your work and generate a summary
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateSummary}
            disabled={isGenerating || !selectedRepo || !userMessage}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate AI Summary
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

      {/* Save Button */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          Cancel
        </Button>
        <Button
          onClick={saveEntry}
          disabled={isSaving || !selectedRepo || !userMessage}
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Entry
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
