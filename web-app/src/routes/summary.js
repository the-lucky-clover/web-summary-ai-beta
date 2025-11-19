import { Hono } from 'hono';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const summary = new Hono();

// Validation schemas
const summarizeSchema = z.object({
  url: z.string().url().optional(),
  content: z.string().min(10),
  options: z.object({
    provider: z.enum(['gemini', 'openai']).default('gemini'),
    maxLength: z.number().min(50).max(1000).default(300),
    format: z.enum(['bullet-points', 'paragraph', 'key-insights']).default('bullet-points')
  }).optional()
});

// Middleware to verify JWT
async function verifyToken(c, next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, c.env.JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}

// Summarize content endpoint
summary.post('/', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { url, content, options = {} } = summarizeSchema.parse(body);

    // Check user's subscription limits
    const userData = await c.env.DB.prepare(
      'SELECT subscription_status, api_usage_count FROM users WHERE id = ?'
    ).bind(user.userId).first();

    if (userData.subscription_status === 'free' && userData.api_usage_count >= 50) {
      return c.json({
        error: 'Free tier limit reached. Upgrade to Pro for unlimited summaries.',
        upgradeUrl: 'https://ytldr.com/pricing'
      }, 429);
    }

    const startTime = Date.now();

    // Generate summary using Hugging Face (free)
    const summaryText = await summarizeWithHuggingFace(content, options);

    const processingTime = Date.now() - startTime;

    // Save summary to database
    const summaryResult = await c.env.DB.prepare(
      `INSERT INTO summaries
       (user_id, original_url, original_content, summary_text, summary_metadata, ai_provider, processing_time_ms, content_type, word_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      user.userId,
      url || null,
      content,
      summaryText,
      JSON.stringify({
        format: options.format || 'bullet-points',
        maxLength: options.maxLength || 300
      }),
      'gemini',
      processingTime,
      url ? 'webpage' : 'text',
      content.split(' ').length
    ).run();

    // Update usage count
    await c.env.DB.prepare(
      'UPDATE users SET api_usage_count = api_usage_count + 1 WHERE id = ?'
    ).bind(user.userId).run();

    // Store in R2 if content is large
    let storageKey = null;
    if (content.length > 10000) {
      storageKey = `summaries/${user.userId}/${summaryResult.meta.last_row_id}.json`;
      await c.env.STORAGE.put(storageKey, JSON.stringify({
        originalContent: content,
        summary: summaryText,
        metadata: {
          url,
          processingTime,
          wordCount: content.split(' ').length
        }
      }));
    }

    return c.json({
      summary: summaryText,
      metadata: {
        processingTime,
        wordCount: content.split(' ').length,
        format: options.format || 'bullet-points',
        storageKey
      },
      usage: {
        current: userData.api_usage_count + 1,
        limit: userData.subscription_status === 'free' ? 50 : -1
      }
    });

  } catch (error) {
    console.error('Summary error:', error);
    return c.json({ error: 'Failed to generate summary' }, 500);
  }
});

// Get user's summaries
summary.get('/history', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const limit = parseInt(c.req.query('limit')) || 20;
    const offset = parseInt(c.req.query('offset')) || 0;

    const summaries = await c.env.DB.prepare(
      `SELECT id, original_url, summary_text, summary_metadata, created_at, processing_time_ms, word_count
       FROM summaries
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(user.userId, limit, offset).all();

    return c.json({
      summaries: summaries.results,
      pagination: {
        limit,
        offset,
        hasMore: summaries.results.length === limit
      }
    });

  } catch (error) {
    console.error('History error:', error);
    return c.json({ error: 'Failed to fetch history' }, 500);
  }
});

// Delete summary (move to rubbish bin)
summary.delete('/:id', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const summaryId = c.req.param('id');

    // Get the summary data
    const summary = await c.env.DB.prepare(
      `SELECT * FROM summaries WHERE id = ? AND user_id = ?`
    ).bind(summaryId, user.userId).first();

    if (!summary) {
      return c.json({ error: 'Summary not found' }, 404);
    }

    // Move to rubbish bin with 30-day recovery period
    const autoDeleteAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await c.env.DB.prepare(
      `INSERT INTO deleted_summaries (user_id, original_summary_id, summary_data, auto_delete_at)
       VALUES (?, ?, ?, ?)`
    ).bind(user.userId, summaryId, JSON.stringify(summary), autoDeleteAt).run();

    // Remove from favorites if it was favorited
    await c.env.DB.prepare(
      'DELETE FROM favorites WHERE summary_id = ? AND user_id = ?'
    ).bind(summaryId, user.userId).run();

    // Delete from main summaries table
    await c.env.DB.prepare(
      'DELETE FROM summaries WHERE id = ? AND user_id = ?'
    ).bind(summaryId, user.userId).run();

    return c.json({
      message: 'Summary moved to rubbish bin. You have 30 days to recover it.',
      recoveryDeadline: autoDeleteAt
    });

  } catch (error) {
    console.error('Delete error:', error);
    return c.json({ error: 'Failed to delete summary' }, 500);
  }
});

// Clear all history
summary.delete('/history/all', verifyToken, async (c) => {
  try {
    const user = c.get('user');

    // Get all summaries for this user
    const summaries = await c.env.DB.prepare(
      'SELECT * FROM summaries WHERE user_id = ?'
    ).bind(user.userId).all();

    if (summaries.results.length === 0) {
      return c.json({ message: 'No summaries to delete' });
    }

    // Move all to rubbish bin
    const autoDeleteAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    for (const summary of summaries.results) {
      await c.env.DB.prepare(
        `INSERT INTO deleted_summaries (user_id, original_summary_id, summary_data, auto_delete_at)
         VALUES (?, ?, ?, ?)`
      ).bind(user.userId, summary.id, JSON.stringify(summary), autoDeleteAt).run();
    }

    // Clear favorites
    await c.env.DB.prepare(
      'DELETE FROM favorites WHERE user_id = ?'
    ).bind(user.userId).run();

    // Delete all summaries
    await c.env.DB.prepare(
      'DELETE FROM summaries WHERE user_id = ?'
    ).bind(user.userId).run();

    return c.json({
      message: `All ${summaries.results.length} summaries moved to rubbish bin. 30 days to recover.`,
      recoveryDeadline: autoDeleteAt,
      deletedCount: summaries.results.length
    });

  } catch (error) {
    console.error('Clear history error:', error);
    return c.json({ error: 'Failed to clear history' }, 500);
  }
});

// Batch summarize multiple URLs
summary.post('/batch', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { urls, options = {} } = z.object({
      urls: z.array(z.string().url()).max(10),
      options: summarizeSchema.shape.options.optional()
    }).parse(body);

    const results = [];

    for (const url of urls) {
      try {
        // Fetch content from URL (simplified - in real app, use proper scraping)
        const response = await fetch(url);
        const html = await response.text();

        // Extract text content (simplified)
        const content = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        if (content.length < 100) continue;

        // Generate summary
        const genAI = new GoogleGenerativeAI(c.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = buildSummaryPrompt(content, options);
        const result = await model.generateContent(prompt);
        const summaryText = result.response.text();

        results.push({
          url,
          summary: summaryText,
          success: true
        });

      } catch (error) {
        results.push({
          url,
          error: error.message,
          success: false
        });
      }
    }

    return c.json({ results });

  } catch (error) {
    console.error('Batch summary error:', error);
    return c.json({ error: 'Failed to process batch request' }, 500);
  }
});

// Add to favorites
summary.post('/:id/favorite', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const summaryId = c.req.param('id');

    // Verify summary exists and belongs to user
    const summary = await c.env.DB.prepare(
      'SELECT id FROM summaries WHERE id = ? AND user_id = ?'
    ).bind(summaryId, user.userId).first();

    if (!summary) {
      return c.json({ error: 'Summary not found' }, 404);
    }

    // Check if already favorited
    const existing = await c.env.DB.prepare(
      'SELECT id FROM favorites WHERE summary_id = ? AND user_id = ?'
    ).bind(summaryId, user.userId).first();

    if (existing) {
      return c.json({ error: 'Already in favorites' }, 400);
    }

    // Add to favorites
    await c.env.DB.prepare(
      'INSERT INTO favorites (user_id, summary_id) VALUES (?, ?)'
    ).bind(user.userId, summaryId).run();

    return c.json({ message: 'Added to favorites' });

  } catch (error) {
    console.error('Favorite error:', error);
    return c.json({ error: 'Failed to add to favorites' }, 500);
  }
});

// Remove from favorites
summary.delete('/:id/favorite', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const summaryId = c.req.param('id');

    await c.env.DB.prepare(
      'DELETE FROM favorites WHERE summary_id = ? AND user_id = ?'
    ).bind(summaryId, user.userId).run();

    return c.json({ message: 'Removed from favorites' });

  } catch (error) {
    console.error('Unfavorite error:', error);
    return c.json({ error: 'Failed to remove from favorites' }, 500);
  }
});

// Get favorites
summary.get('/favorites/all', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const limit = parseInt(c.req.query('limit')) || 20;
    const offset = parseInt(c.req.query('offset')) || 0;

    const favorites = await c.env.DB.prepare(
      `SELECT s.*, f.created_at as favorited_at
       FROM summaries s
       JOIN favorites f ON s.id = f.summary_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(user.userId, limit, offset).all();

    return c.json({
      favorites: favorites.results,
      pagination: {
        limit,
        offset,
        hasMore: favorites.results.length === limit
      }
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    return c.json({ error: 'Failed to get favorites' }, 500);
  }
});

// Get rubbish bin
summary.get('/rubbish-bin/all', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const limit = parseInt(c.req.query('limit')) || 20;
    const offset = parseInt(c.req.query('offset')) || 0;

    const deleted = await c.env.DB.prepare(
      `SELECT * FROM deleted_summaries
       WHERE user_id = ? AND auto_delete_at > CURRENT_TIMESTAMP
       ORDER BY deleted_at DESC
       LIMIT ? OFFSET ?`
    ).bind(user.userId, limit, offset).all();

    return c.json({
      deleted: deleted.results.map(item => ({
        ...JSON.parse(item.summary_data),
        deleted_at: item.deleted_at,
        recovery_deadline: item.auto_delete_at
      })),
      pagination: {
        limit,
        offset,
        hasMore: deleted.results.length === limit
      }
    });

  } catch (error) {
    console.error('Get rubbish bin error:', error);
    return c.json({ error: 'Failed to get rubbish bin' }, 500);
  }
});

// Recover from rubbish bin
summary.post('/rubbish-bin/:id/recover', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const deletedId = c.req.param('id');

    const deleted = await c.env.DB.prepare(
      'SELECT * FROM deleted_summaries WHERE id = ? AND user_id = ?'
    ).bind(deletedId, user.userId).first();

    if (!deleted) {
      return c.json({ error: 'Item not found in rubbish bin' }, 404);
    }

    const summaryData = JSON.parse(deleted.summary_data);

    // Restore to summaries table
    await c.env.DB.prepare(
      `INSERT INTO summaries
       (user_id, original_url, original_content, summary_text, summary_metadata, ai_provider, processing_time_ms, content_type, word_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      user.userId,
      summaryData.original_url,
      summaryData.original_content,
      summaryData.summary_text,
      summaryData.summary_metadata,
      summaryData.ai_provider,
      summaryData.processing_time_ms,
      summaryData.content_type,
      summaryData.word_count,
      summaryData.created_at
    ).run();

    // Remove from rubbish bin
    await c.env.DB.prepare(
      'DELETE FROM deleted_summaries WHERE id = ? AND user_id = ?'
    ).bind(deletedId, user.userId).run();

    return c.json({ message: 'Summary recovered successfully' });

  } catch (error) {
    console.error('Recover error:', error);
    return c.json({ error: 'Failed to recover summary' }, 500);
  }
});

// Permanently delete from rubbish bin
summary.delete('/rubbish-bin/:id', verifyToken, async (c) => {
  try {
    const user = c.get('user');
    const deletedId = c.req.param('id');

    await c.env.DB.prepare(
      'DELETE FROM deleted_summaries WHERE id = ? AND user_id = ?'
    ).bind(deletedId, user.userId).run();

    return c.json({ message: 'Permanently deleted' });

  } catch (error) {
    console.error('Permanent delete error:', error);
    return c.json({ error: 'Failed to permanently delete' }, 500);
  }
});

// Hugging Face free summarization
async function summarizeWithHuggingFace(content, options = {}) {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: content,
        parameters: {
          max_length: options.maxLength || 200,
          min_length: 50,
          do_sample: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0]?.summary_text) {
      const summary = data[0].summary_text;

      // Format based on options
      switch (options.format) {
        case 'bullet-points':
          return `• ${summary}`;
        case 'paragraph':
          return summary;
        case 'key-insights':
          return `Key insights: ${summary}`;
        default:
          return `• ${summary}`;
      }
    }

    throw new Error('Unexpected response format from Hugging Face');
  } catch (error) {
    console.error('Hugging Face summarization error:', error);
    // Fallback to local summarization
    return await summarizeLocally(content, options);
  }
}

// Local fallback summarization
async function summarizeLocally(content, options = {}) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const summary = sentences.slice(0, 3).map(s => `• ${s.trim()}`).join('\n');

  return summary || '• Content is too short for meaningful summarization.';
}

function buildSummaryPrompt(content, options = {}) {
  const { maxLength = 300, format = 'bullet-points' } = options;

  let prompt = `Please summarize the following content`;

  switch (format) {
    case 'bullet-points':
      prompt += ` in 3-5 concise bullet points`;
      break;
    case 'paragraph':
      prompt += ` in a coherent paragraph`;
      break;
    case 'key-insights':
      prompt += ` focusing on the key insights and main takeaways`;
      break;
  }

  prompt += `. Keep the summary under ${maxLength} characters.\n\nContent: ${content}`;

  return prompt;
}

export { summary as summaryRoutes };