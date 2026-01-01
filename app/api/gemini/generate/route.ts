import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

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

interface GenerateRequest {
  repositoryName: string;
  commandType: string;
  userMessage: string;
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
  }>;
}
{/*Hello World*/}

async function generateWithRetry(
  genAI: GoogleGenerativeAI,
  model: string,
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const generativeModel = genAI.getGenerativeModel({ model });
      const result = await generativeModel.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '';
      const errorStatus = typeof error === 'object' && error !== null && 'status' in error 
        ? (error as { status: number }).status 
        : undefined;
      
      const isRateLimit =
        errorMessage?.includes('429') ||
        errorMessage?.includes('rate limit') ||
        errorStatus === 429;

      if (isRateLimit && attempt < maxRetries - 1) {
        // Exponential backoff: 2^attempt seconds
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited. Retrying in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings (API key and model preference)
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('gemini_api_key, gemini_model_preference, custom_system_prompt')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.gemini_api_key) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add it in Settings.' },
        { status: 400 }
      );
    }

    // Parse request body
    const body: GenerateRequest = await request.json();
    const { repositoryName, commandType, userMessage, commits } = body;

    if (!repositoryName || !commandType || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build context for Gemini
    const systemPrompt = settings.custom_system_prompt || DEFAULT_SYSTEM_PROMPT;
    const commitsContext = commits
      .map(
        (commit) =>
          `- ${commit.message} (by ${commit.author} on ${new Date(
            commit.date
          ).toLocaleDateString()})`
      )
      .join('\n');

    const fullPrompt = `${systemPrompt}

**Context:**
The developer worked on: ${repositoryName}
Session type: ${commandType}
Developer's note: ${userMessage}

**Recent commits:**
${commitsContext || 'No commits provided'}

Generate the development journal entry now:`;

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(settings.gemini_api_key);
    const modelName = settings.gemini_model_preference || 'gemini-2.0-flash-exp';

    // Generate content with retry logic
    const generatedText = await generateWithRetry(genAI, modelName, fullPrompt);

    // Parse the response to extract sections
    // Simple parsing: split by "Summary" and "Technical Details" headers
    const summaryMatch = generatedText.match(
      /##?\s*Summary\s*\n([\s\S]*?)(?=##?\s*Technical Details|$)/i
    );
    const technicalMatch = generatedText.match(
      /##?\s*Technical Details\s*\n([\s\S]*?)$/i
    );

    const summary = summaryMatch ? summaryMatch[1].trim() : generatedText;
    const technical = technicalMatch ? technicalMatch[1].trim() : '';

    return NextResponse.json({
      success: true,
      summary,
      technicalDetails: technical,
      fullResponse: generatedText,
      modelUsed: modelName,
    });
  } catch (error: unknown) {
    console.error('Gemini generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : '';

    // Handle specific error types
    if (errorMessage?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid Gemini API key. Please check your settings.' },
        { status: 400 }
      );
    }

    if (errorMessage?.includes('429') || errorMessage?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Gemini API rate limit exceeded. Please try again in a few moments.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: errorMessage || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
