/**
 * Content Type Detection Utility
 * Automatically detects content type from various sources
 */

class ContentDetector {
  static detectContentType(content, url = null, mimeType = null) {
    // Check MIME type first (most reliable)
    if (mimeType) {
      return this.detectFromMimeType(mimeType);
    }

    // Check URL patterns
    if (url) {
      return this.detectFromUrl(url);
    }

    // Check content patterns
    if (typeof content === 'string') {
      return this.detectFromContent(content);
    }

    // Check file properties
    if (content && typeof content === 'object') {
      return this.detectFromFileProperties(content);
    }

    return 'text';
  }

  static detectFromMimeType(mimeType) {
    const mimeMap = {
      'application/pdf': 'pdf',
      'video/mp4': 'video',
      'video/avi': 'video',
      'video/mov': 'video',
      'video/quicktime': 'video',
      'audio/mp3': 'audio',
      'audio/wav': 'audio',
      'audio/mpeg': 'audio',
      'audio/m4a': 'audio',
      'text/plain': 'text',
      'text/html': 'article',
      'application/json': 'data'
    };

    return mimeMap[mimeType] || 'text';
  }

  static detectFromUrl(url) {
    const urlPatterns = [
      { pattern: /youtube\.com|youtu\.be/, type: 'youtube' },
      { pattern: /spotify\.com.*podcast/, type: 'podcast' },
      { pattern: /apple\.com.*podcast/, type: 'podcast' },
      { pattern: /soundcloud\.com/, type: 'audio' },
      { pattern: /\.pdf(\?|$)/, type: 'pdf' },
      { pattern: /medium\.com|nytimes\.com|bbc\.com|wikipedia\.org/, type: 'article' },
      { pattern: /twitter\.com|x\.com/, type: 'social' },
      { pattern: /\.mp4$|\.avi$|\.mov$|\.mkv$/, type: 'video' },
      { pattern: /\.mp3$|\.wav$|\.m4a$|\.aac$/, type: 'audio' }
    ];

    for (const { pattern, type } of urlPatterns) {
      if (pattern.test(url)) {
        return type;
      }
    }

    return 'article'; // Default for web URLs
  }

  static detectFromContent(content) {
    // Check for PDF markers
    if (content.includes('%PDF-') || content.includes('[PDF]')) {
      return 'pdf';
    }

    // Check for video/audio transcript markers
    if (content.includes('[VIDEO') || content.includes('TRANSCRIPT')) {
      if (content.includes('SPEAKER') || content.includes('[00:')) {
        return content.includes('VIDEO') ? 'video' : 'audio';
      }
    }

    // Check for structured content
    if (content.includes('# ') || content.includes('## ')) {
      return 'markdown';
    }

    // Check for JSON
    try {
      JSON.parse(content);
      return 'data';
    } catch {}

    // Check for HTML
    if (content.includes('<html') || content.includes('<body')) {
      return 'html';
    }

    // Check length for long content
    if (content.length > 50000) {
      return 'long-text';
    }

    // Check for article-like structure
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;

    if (sentences > 20 && words > 300) {
      return 'article';
    }

    return 'text';
  }

  static detectFromFileProperties(file) {
    if (file.type) {
      return this.detectFromMimeType(file.type);
    }

    if (file.name) {
      const extension = file.name.split('.').pop().toLowerCase();
      const extensionMap = {
        'pdf': 'pdf',
        'mp4': 'video',
        'avi': 'video',
        'mov': 'video',
        'mp3': 'audio',
        'wav': 'audio',
        'm4a': 'audio',
        'txt': 'text',
        'md': 'markdown',
        'html': 'html',
        'htm': 'html'
      };

      return extensionMap[extension] || 'text';
    }

    return 'text';
  }

  static getContentMetadata(content, type) {
    const metadata = {
      type,
      size: typeof content === 'string' ? content.length : 0,
      estimatedWords: 0,
      estimatedReadingTime: 0,
      language: 'en', // Default assumption
      hasMedia: false,
      complexity: 'simple'
    };

    if (typeof content === 'string') {
      metadata.estimatedWords = content.split(/\s+/).length;
      metadata.estimatedReadingTime = Math.ceil(metadata.estimatedWords / 200); // 200 words per minute

      // Detect language (basic)
      if (content.includes('él') || content.includes('ça')) {
        metadata.language = 'fr';
      } else if (content.includes('der') || content.includes('die') || content.includes('das')) {
        metadata.language = 'de';
      }

      // Check for media references
      metadata.hasMedia = /\[VIDEO\]|\[AUDIO\]|\[IMAGE\]|\[PDF\]/.test(content);

      // Estimate complexity
      const avgWordLength = content.replace(/\s/g, '').length / metadata.estimatedWords;
      const longWords = content.match(/\b\w{8,}\b/g)?.length || 0;

      if (avgWordLength > 6 || longWords > metadata.estimatedWords * 0.1) {
        metadata.complexity = 'complex';
      } else if (metadata.estimatedWords > 1000) {
        metadata.complexity = 'long';
      }
    }

    return metadata;
  }

  static getSupportedTypes() {
    return [
      'text',
      'markdown',
      'html',
      'pdf',
      'article',
      'youtube',
      'video',
      'podcast',
      'audio',
      'social',
      'data',
      'long-text'
    ];
  }

  static getTypeCapabilities(type) {
    const capabilities = {
      text: { extractable: true, summarizable: true, translatable: true },
      markdown: { extractable: true, summarizable: true, translatable: true },
      html: { extractable: true, summarizable: true, translatable: true },
      pdf: { extractable: true, summarizable: true, translatable: false },
      article: { extractable: true, summarizable: true, translatable: true },
      youtube: { extractable: false, summarizable: true, translatable: true }, // Would need transcript API
      video: { extractable: false, summarizable: true, translatable: true }, // Would need speech-to-text
      podcast: { extractable: false, summarizable: true, translatable: true }, // Would need transcript API
      audio: { extractable: false, summarizable: true, translatable: true }, // Would need speech-to-text
      social: { extractable: true, summarizable: true, translatable: true },
      data: { extractable: true, summarizable: false, translatable: false },
      'long-text': { extractable: true, summarizable: true, translatable: true }
    };

    return capabilities[type] || { extractable: true, summarizable: true, translatable: false };
  }
}

export default ContentDetector;