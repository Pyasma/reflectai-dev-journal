'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Key, Sparkles, Code, Trash2, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const DEFAULT_SYSTEM_PROMPT = `You are an expert technical writer helping developers document their coding sessions.

**Task:**
Generate a concise, professional development journal entry with the following sections:

1. **Summary** (2-3 sentences)
   - What was accomplished in this session
   - Key changes made
   - Why this work was important

2. **Technical Details** (3-5 bullet points)
   - Specific files modified
   - Methods/functions added or changed
   - Technologies or libraries used
   - Architecture decisions made

**Guidelines:**
- Be specific and factual, not generic
- Use technical terminology appropriate to the codebase
- Focus on "why" decisions were made, not just "what" changed
- Keep tone professional but conversational
- Limit total response to 300-400 words

**Output Format:** Markdown with clear section headers`;

export default function SettingsPage() {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash-exp');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setGeminiApiKey(data.gemini_api_key || '');
        setGeminiModel(data.gemini_model_preference || 'gemini-2.0-flash-exp');
        setCustomPrompt(data.custom_system_prompt || '');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.from('user_settings').upsert(
        {
          user_id: user.id,
          gemini_api_key: geminiApiKey || null,
          gemini_model_preference: geminiModel,
          custom_system_prompt: customPrompt || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(error.message || 'Database error');
      }

      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error: unknown) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetPrompt = () => {
    setCustomPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  const deleteApiKey = async () => {
    if (!geminiApiKey) {
      toast({
        title: 'No API key',
        description: 'There is no API key to delete',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('user_settings')
        .update({
          gemini_api_key: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(error.message || 'Database error');
      }

      setGeminiApiKey('');
      
      toast({
        title: 'API key deleted',
        description: 'Your Gemini API key has been removed successfully.',
      });
    } catch (error: unknown) {
      console.error('Failed to delete API key:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your API keys and AI preferences
        </p>
      </div>

      {/* Gemini API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Gemini API Key</CardTitle>
          </div>
          <CardDescription>
            Enter your Google Gemini API key to enable AI-powered journal summaries.
            Get your free key at{' '}
            <a
              href="https://ai.google.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ai.google.dev
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="dark:text-neutral-200">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Gemini API key"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={deleteApiKey}
                disabled={isDeleting || !geminiApiKey}
                title="Delete API Key"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-300">
              Your API key is stored securely and never shared
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Model Selection</CardTitle>
          </div>
          <CardDescription>
            Choose which Gemini model to use for generating journal summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={geminiModel} onValueChange={setGeminiModel}>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="gemini-2.0-flash-exp" id="flash-exp" />
                <div className="flex-1">
                  <Label htmlFor="flash-exp" className="font-semibold cursor-pointer">
                    Gemini 2.0 Flash Experimental
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Latest experimental model - fastest and most capable (Recommended)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="gemini-1.5-flash" id="flash" />
                <div className="flex-1">
                  <Label htmlFor="flash" className="font-semibold cursor-pointer">
                    Gemini 1.5 Flash
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Balanced performance and speed - 10 RPM, 250 requests/day
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="gemini-1.5-flash-8b" id="flash-lite" />
                <div className="flex-1">
                  <Label htmlFor="flash-lite" className="font-semibold cursor-pointer">
                    Gemini 1.5 Flash-8B
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    High-frequency queries - 15 RPM, 1,000 requests/day
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <RadioGroupItem value="gemini-1.5-pro" id="pro" />
                <div className="flex-1">
                  <Label htmlFor="pro" className="font-semibold cursor-pointer">
                    Gemini 1.5 Pro
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complex reasoning - 5 RPM, 100 requests/day (slower but more detailed)
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Custom System Prompt */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>Custom System Prompt (Advanced)</CardTitle>
          </div>
          <CardDescription>
            Customize how the AI generates your journal summaries. Leave empty to use default.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customPrompt">System Prompt</Label>
            <Textarea
              id="customPrompt"
              placeholder="Enter custom system prompt or leave empty for default"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={resetPrompt}>
            Reset to Default
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
