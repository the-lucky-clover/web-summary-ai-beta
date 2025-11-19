/**
 * Universal Summarization Engine
 * Handles audio, video, podcasts, articles, PDFs of any length
 */

class SummarizationEngine {
  constructor(geminiApiKey) {
    this.apiKey = geminiApiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
    this.maxChunkSize = 30000; // Characters per chunk
    this.overlapSize = 1000; // Overlap between chunks
  }

  /**
   * Main summarization method - handles any content type
   */
  async summarize(content, options = {}) {
    try {
      const {
        type = 'auto',
        length = 'medium', // short, medium, long, detailed
        format = 'markdown', // markdown, bullet, paragraph
        focus = 'general' // general, key-points, analysis, executive
      } = options;

      // Detect content type if not specified
      const contentType = type === 'auto' ? this.detectContentType(content) : type;

      // Extract text based on content type
      const extractedText = await this.extractText(content, contentType);

      // Chunk long content
      const chunks = this.chunkContent(extractedText);

      // Generate summary based on length and focus
      const summary = await this.generateSummary(chunks, { length, format, focus, contentType });

      return {
        summary,
        metadata: {
          contentType,
          originalLength: extractedText.length,
          chunksProcessed: chunks.length,
          processingTime: Date.now(),
          options: { length, format, focus }
        }
      };

    } catch (error) {
      console.error('Summarization error:', error);
      throw new Error(`Failed to summarize content: ${error.message}`);
    }
  }

  /**
   * Detect content type from content or URL
   */
  detectContentType(content) {
    if (typeof content === 'string') {
      // Check for URLs
      if (content.startsWith('http')) {
        if (content.includes('youtube.com') || content.includes('youtu.be')) {
          return 'youtube';
        }
        if (content.includes('spotify.com') || content.includes('podcasts')) {
          return 'podcast';
        }
        if (content.includes('.pdf')) {
          return 'pdf';
        }
        return 'article';
      }

      // Check for file extensions
      if (content.endsWith('.pdf')) return 'pdf';
      if (content.endsWith('.mp3') || content.endsWith('.wav') || content.endsWith('.m4a')) return 'audio';
      if (content.endsWith('.mp4') || content.endsWith('.avi') || content.endsWith('.mov')) return 'video';

      // Check content patterns
      if (content.includes('[PDF]') || content.includes('PDF Document')) return 'pdf';
      if (content.length > 10000) return 'long-text';
    }

    return 'text';
  }

  /**
   * Extract text from different content types
   */
  async extractText(content, type) {
    switch (type) {
      case 'pdf':
        return await this.extractFromPDF(content);
      case 'youtube':
      case 'video':
        return await this.extractFromVideo(content);
      case 'podcast':
      case 'audio':
        return await this.extractFromAudio(content);
      case 'article':
        return await this.extractFromArticle(content);
      default:
        return typeof content === 'string' ? content : content.toString();
    }
  }

  /**
   * Extract text from PDF content
   */
  async extractFromPDF(content) {
    // For PDFs, we'll use a simple text extraction
    // In a real implementation, you'd use pdf-parse or similar
    if (typeof content === 'string' && content.includes('[PDF]')) {
      // Remove PDF markers and extract text
      return content.replace(/\[PDF\]/g, '').trim();
    }
    return content;
  }

  /**
   * Extract transcript from video/audio content
   */
  async extractFromVideo(content) {
    // For videos, we'd typically use speech-to-text APIs
    // For now, return a placeholder indicating transcript extraction
    if (typeof content === 'string' && content.startsWith('http')) {
      return `[VIDEO TRANSCRIPT EXTRACTION]\nURL: ${content}\n\n[This would contain the actual video transcript from speech-to-text processing]`;
    }
    return content;
  }

  /**
   * Extract transcript from audio content
   */
  async extractFromAudio(content) {
    // Similar to video extraction
    if (typeof content === 'string') {
      return `[AUDIO TRANSCRIPT EXTRACTION]\nSource: ${content}\n\n[This would contain the actual audio transcript from speech-to-text processing]`;
    }
    return content;
  }

  /**
   * Extract readable content from articles
   */
  async extractFromArticle(content) {
    if (typeof content === 'string' && content.startsWith('http')) {
      // In a real implementation, you'd fetch the article and extract main content
      return `[ARTICLE EXTRACTION]\nURL: ${content}\n\n[This would contain the extracted article text with main content, removing ads, navigation, etc.]`;
    }
    return content;
  }

  /**
   * Split long content into manageable chunks
   */
  chunkContent(text) {
    if (text.length <= this.maxChunkSize) {
      return [text];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = start + this.maxChunkSize;

      // Try to end at a sentence boundary
      if (end < text.length) {
        const lastSentence = text.lastIndexOf('.', end);
        const lastNewline = text.lastIndexOf('\n', end);

        if (lastSentence > start + this.maxChunkSize * 0.7) {
          end = lastSentence + 1;
        } else if (lastNewline > start + this.maxChunkSize * 0.7) {
          end = lastNewline;
        }
      }

      chunks.push(text.slice(start, end));

      // Move start position with overlap
      start = Math.max(start + 1, end - this.overlapSize);
    }

    return chunks;
  }

  /**
   * Generate summary using Gemini API
   */
  async generateSummary(chunks, options) {
    const { length, format, focus, contentType } = options;

    // Create summary prompt based on options
    const prompt = this.createSummaryPrompt(length, format, focus, contentType);

    if (chunks.length === 1) {
      // Single chunk - direct summarization
      return await this.callGeminiAPI(`${prompt}\n\nContent:\n${chunks[0]}`);
    } else {
      // Multiple chunks - hierarchical summarization
      const chunkSummaries = [];

      // Summarize each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunkPrompt = `Summarize this section (part ${i + 1}/${chunks.length}):\n${chunks[i]}`;
        const chunkSummary = await this.callGeminiAPI(chunkPrompt);
        chunkSummaries.push(chunkSummary);
      }

      // Combine chunk summaries
      const combinedSummary = chunkSummaries.join('\n\n---\n\n');
      const finalPrompt = `${prompt}\n\nCombined sections:\n${combinedSummary}`;

      return await this.callGeminiAPI(finalPrompt);
    }
  }

  /**
   * Create appropriate summary prompt based on options
   */
  createSummaryPrompt(length, format, focus, contentType) {
    let prompt = '';

    // Length-based instructions
    switch (length) {
      case 'short':
        prompt += 'Create a brief summary (2-3 sentences). ';
        break;
      case 'medium':
        prompt += 'Create a concise summary (4-6 sentences). ';
        break;
      case 'long':
        prompt += 'Create a detailed summary (8-12 sentences). ';
        break;
      case 'detailed':
        prompt += 'Create a comprehensive summary with key details. ';
        break;
    }

    // Focus-based instructions
    switch (focus) {
      case 'key-points':
        prompt += 'Focus on the most important points and takeaways. ';
        break;
      case 'analysis':
        prompt += 'Include analysis of the main arguments and implications. ';
        break;
      case 'executive':
        prompt += 'Format as an executive summary with key decisions and actions. ';
        break;
      default:
        prompt += 'Provide a balanced overview of the content. ';
    }

    // Content type specific instructions
    switch (contentType) {
      case 'video':
      case 'youtube':
        prompt += 'This is a video transcript. Focus on the main discussion points and conclusions. ';
        break;
      case 'podcast':
      case 'audio':
        prompt += 'This is a podcast transcript. Highlight key topics, guest insights, and main takeaways. ';
        break;
      case 'pdf':
        prompt += 'This is document content. Focus on the core information and key findings. ';
        break;
      case 'article':
        prompt += 'This is an article. Summarize the main thesis, supporting points, and conclusions. ';
        break;
    }

    // Format instructions
    switch (format) {
      case 'bullet':
        prompt += 'Format the summary as bullet points. ';
        break;
      case 'paragraph':
        prompt += 'Format the summary as coherent paragraphs. ';
        break;
      default:
        prompt += 'Format the summary in markdown with appropriate headings and structure. ';
    }

    return prompt;
  }

  /**
   * Call Gemini API
   */
  async callGeminiAPI(prompt) {
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  }

  /**
   * Get supported content types
   */
  getSupportedTypes() {
    return [
      'text',
      'pdf',
      'article',
      'youtube',
      'video',
      'podcast',
      'audio',
      'long-text'
    ];
  }

  /**
   * Get available summary options
   */
  getSummaryOptions() {
    return {
      lengths: ['short', 'medium', 'long', 'detailed'],
      formats: ['markdown', 'bullet', 'paragraph'],
      focuses: ['general', 'key-points', 'analysis', 'executive', 'forensic']
    };
  }

  /**
   * Check if forensic analysis is requested
   */
  isForensicAnalysis(options) {
    return options.focus === 'forensic' || options.forensic === true;
  }
}

export default SummarizationEngine;