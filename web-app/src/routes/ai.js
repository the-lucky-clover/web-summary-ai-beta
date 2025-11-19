import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const aiRoutes = new Hono();

// Middleware
aiRoutes.use('*', cors());
aiRoutes.use('*', logger());

// Authentication middleware
const authenticate = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  // In a real app, you'd verify the JWT token here
  // For now, we'll just check if it exists
  if (!token) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  await next();
};

// Apply authentication to all routes
aiRoutes.use('*', authenticate);

// Summarization endpoint
aiRoutes.post('/summarize', async (c) => {
  try {
    const { content, type = 'concise', agent = 'auto' } = await c.req.json();

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    // Get Gemini API key from environment
    const geminiKey = c.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return c.json({ error: 'AI service unavailable' }, 503);
    }

    // Prepare prompt based on type
    let prompt = '';
    switch (type) {
      case 'concise':
        prompt = `Please provide a concise summary of the following content in 2-3 bullet points:\n\n${content}`;
        break;
      case 'detailed':
        prompt = `Please provide a detailed summary of the following content with key insights and main points:\n\n${content}`;
        break;
      case 'bullet-points':
        prompt = `Please summarize the following content in clear, actionable bullet points:\n\n${content}`;
        break;
      default:
        prompt = `Please summarize the following content:\n\n${content}`;
    }

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;

    return c.json({
      summary,
      agent,
      type,
      timestamp: new Date().toISOString(),
      wordCount: content.split(' ').length
    });

  } catch (error) {
    console.error('Summarization error:', error);
    return c.json({ error: 'Failed to generate summary' }, 500);
  }
});

// Content analysis endpoint
aiRoutes.post('/analyze', async (c) => {
  try {
    const { content, analysis = ['sentiment', 'topics', 'insights'] } = await c.req.json();

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    const geminiKey = c.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return c.json({ error: 'AI service unavailable' }, 503);
    }

    const analysisPrompt = `Please analyze the following content and provide:
${analysis.includes('sentiment') ? '- Sentiment analysis (positive/negative/neutral)' : ''}
${analysis.includes('topics') ? '- Main topics and themes' : ''}
${analysis.includes('insights') ? '- Key insights and takeaways' : ''}

Content to analyze:
${content}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisResult = data.candidates[0].content.parts[0].text;

    return c.json({
      analysis: analysisResult,
      requestedAnalysis: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ error: 'Failed to analyze content' }, 500);
  }
});

// Research endpoint
aiRoutes.post('/research', async (c) => {
  try {
    const { query, depth = 'comprehensive' } = await c.req.json();

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const geminiKey = c.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return c.json({ error: 'AI service unavailable' }, 503);
    }

    const researchPrompt = `Please research and provide ${depth} information about: ${query}

Include:
- Key facts and background
- Current status and developments
- Important insights and implications
- Sources and references where applicable

Provide well-structured, factual information.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: researchPrompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const researchResult = data.candidates[0].content.parts[0].text;

    return c.json({
      research: researchResult,
      query,
      depth,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Research error:', error);
    return c.json({ error: 'Failed to perform research' }, 500);
  }
});

// Content generation endpoint
aiRoutes.post('/generate', async (c) => {
  try {
    const { prompt, style = 'professional', length = 'medium' } = await c.req.json();

    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    const geminiKey = c.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return c.json({ error: 'AI service unavailable' }, 503);
    }

    const generationPrompt = `Please generate content based on this prompt: ${prompt}

Style: ${style}
Length: ${length}

Ensure the content is well-written, engaging, and matches the requested style.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: generationPrompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: length === 'short' ? 500 : length === 'long' ? 2000 : 1000,
          temperature: style === 'creative' ? 0.7 : 0.3
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates[0].content.parts[0].text;

    return c.json({
      content: generatedContent,
      prompt,
      style,
      length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generation error:', error);
    return c.json({ error: 'Failed to generate content' }, 500);
  }
});

// General task processing endpoint
aiRoutes.post('/process', async (c) => {
  try {
    const { task, context, agent = 'auto' } = await c.req.json();

    if (!task) {
      return c.json({ error: 'Task description is required' }, 400);
    }

    const geminiKey = c.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return c.json({ error: 'AI service unavailable' }, 503);
    }

    const taskPrompt = `Please help with this task: ${task}

${context ? `Additional context: ${context}` : ''}

Provide a helpful, accurate response that addresses the task requirements.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: taskPrompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.candidates[0].content.parts[0].text;

    return c.json({
      result,
      task,
      agent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Task processing error:', error);
    return c.json({ error: 'Failed to process task' }, 500);
  }
});

// Agent status endpoint
aiRoutes.get('/agents/status', async (c) => {
  // In a real implementation, this would return actual agent statuses
  return c.json({
    agents: [
      { id: 'summarizer-001', type: 'summarizer', status: 'idle', tasksCompleted: 42 },
      { id: 'analyzer-001', type: 'analyzer', status: 'processing', tasksCompleted: 38 },
      { id: 'researcher-001', type: 'researcher', status: 'idle', tasksCompleted: 29 },
      { id: 'writer-001', type: 'writer', status: 'idle', tasksCompleted: 31 }
    ],
    system: {
      totalAgents: 4,
      activeAgents: 1,
      queuedTasks: 3,
      completedTasks: 140
    }
  });
});

// Task queue status endpoint
aiRoutes.get('/tasks/queue', async (c) => {
  // In a real implementation, this would return actual queue status
  return c.json({
    queued: [
      { id: 'task_001', type: 'summarize', status: 'queued', priority: 'normal' },
      { id: 'task_002', type: 'analyze', status: 'processing', priority: 'high' }
    ],
    processing: [
      { id: 'task_002', type: 'analyze', agent: 'analyzer-001', progress: 65 }
    ],
    completed: [
      { id: 'task_003', type: 'generate', completedAt: new Date().toISOString() }
    ]
  });
});

export { aiRoutes };