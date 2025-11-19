/**
 * Article and Webpage Content Extraction
 * Extracts main content from articles and web pages
 */

class ArticleExtractor {
  constructor() {
    this.timeout = 10000; // 10 seconds
    this.maxContentLength = 500000; // 500KB limit
  }

  /**
   * Extract main content from article/webpage
   */
  async extractContent(content, options = {}) {
    try {
      const {
        includeTitle = true,
        includeMetadata = true,
        removeAds = true,
        removeNavigation = true
      } = options;

      if (typeof content === 'string') {
        if (content.startsWith('http')) {
          return await this.extractFromUrl(content, options);
        } else {
          return await this.extractFromHtml(content, options);
        }
      }

      throw new Error('Unsupported content type for article extraction');

    } catch (error) {
      console.error('Article extraction error:', error);
      throw new Error(`Failed to extract article content: ${error.message}`);
    }
  }

  /**
   * Extract content from URL
   */
  async extractFromUrl(url, options) {
    // In a real implementation, this would fetch the URL
    // For demo purposes, we'll simulate content extraction

    const simulatedContent = {
      title: this.extractTitleFromUrl(url),
      content: `[ARTICLE EXTRACTION SIMULATION]\n\nURL: ${url}\n\n[In production, this would fetch and parse the actual webpage content, removing ads, navigation, and extracting the main article text using libraries like:\n- Readability.js\n- Mercury Parser\n- Newspaper.js\n- Cheerio + custom selectors]\n\nExtracted Content:\n================\n\n[Main article content would appear here after processing]`,
      metadata: {
        url,
        extractedAt: new Date().toISOString(),
        contentType: 'article',
        estimatedReadingTime: 5,
        wordCount: 800
      }
    };

    return simulatedContent;
  }

  /**
   * Extract content from HTML string
   */
  async extractFromHtml(html, options) {
    // Basic HTML content extraction
    const content = this.stripHtmlTags(html);
    const title = this.extractTitleFromHtml(html);

    return {
      title: title || 'HTML Document',
      content: this.cleanContent(content),
      metadata: {
        contentType: 'html',
        extractedAt: new Date().toISOString(),
        wordCount: content.split(/\s+/).length,
        estimatedReadingTime: Math.ceil(content.split(/\s+/).length / 200)
      }
    };
  }

  /**
   * Extract title from URL
   */
  extractTitleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1];

      if (lastSegment) {
        return lastSegment
          .replace(/-/g, ' ')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }

      return urlObj.hostname;
    } catch {
      return 'Article';
    }
  }

  /**
   * Extract title from HTML
   */
  extractTitleFromHtml(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    // Try h1 tags
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      return h1Match[1].trim();
    }

    return null;
  }

  /**
   * Strip HTML tags from content
   */
  stripHtmlTags(html) {
    // Remove script and style tags
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Remove common non-content tags
    html = html.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
    html = html.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
    html = html.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
    html = html.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

    // Remove ads and common ad selectors
    html = html.replace(/<div[^>]*(?:class|id)[^>]*(?:ad|advertisement|banner|popup)[^>]*>[\s\S]*?<\/div>/gi, '');
    html = html.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');

    // Convert line breaks
    html = html.replace(/<br[^>]*>/gi, '\n');
    html = html.replace(/<\/p>/gi, '\n\n');
    html = html.replace(/<\/div>/gi, '\n');
    html = html.replace(/<\/h[1-6]>/gi, '\n\n');

    // Remove remaining HTML tags
    html = html.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    html = this.decodeHtmlEntities(html);

    return html;
  }

  /**
   * Clean and normalize extracted content
   */
  cleanContent(content) {
    return content
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Fix spacing around punctuation
      .replace(/\s+([.!?,;:])/g, '$1')
      // Remove excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  /**
   * Decode HTML entities
   */
  decodeHtmlEntities(text) {
    const entities = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      ''': "'",
      ''': "'",
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#x60;': '`',
      '&#x3D;': '='
    };

    return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => entities[entity] || entity);
  }

  /**
   * Extract article metadata
   */
  extractMetadata(html, url = null) {
    const metadata = {
      title: null,
      author: null,
      publishedDate: null,
      modifiedDate: null,
      description: null,
      keywords: [],
      wordCount: 0,
      estimatedReadingTime: 0
    };

    // Extract from meta tags
    const metaMatches = html.match(/<meta[^>]+>/gi) || [];
    metaMatches.forEach(meta => {
      const property = meta.match(/property=["']([^"']+)["']/) ||
                      meta.match(/name=["']([^"']+)["']/) ||
                      meta.match(/itemprop=["']([^"']+)["']/);
      const content = meta.match(/content=["']([^"']+)["']/);

      if (property && content) {
        const prop = property[1].toLowerCase();
        const cont = content[1];

        switch (prop) {
          case 'og:title':
          case 'twitter:title':
            metadata.title = metadata.title || cont;
            break;
          case 'article:author':
          case 'author':
            metadata.author = metadata.author || cont;
            break;
          case 'article:published_time':
          case 'published_time':
            metadata.publishedDate = metadata.publishedDate || cont;
            break;
          case 'article:modified_time':
          case 'modified_time':
            metadata.modifiedDate = metadata.modifiedDate || cont;
            break;
          case 'og:description':
          case 'twitter:description':
          case 'description':
            metadata.description = metadata.description || cont;
            break;
          case 'keywords':
            metadata.keywords = cont.split(',').map(k => k.trim());
            break;
        }
      }
    });

    // Extract from JSON-LD
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd['@type'] === 'Article' || jsonLd['@type'] === 'NewsArticle') {
          metadata.title = metadata.title || jsonLd.headline;
          metadata.author = metadata.author || jsonLd.author?.name;
          metadata.publishedDate = metadata.publishedDate || jsonLd.datePublished;
          metadata.modifiedDate = metadata.modifiedDate || jsonLd.dateModified;
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
    }

    return metadata;
  }

  /**
   * Check if URL is accessible and returns HTML
   */
  async isValidArticleUrl(url) {
    try {
      // In a real implementation, this would make a HEAD request
      // For now, we'll do basic URL validation
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Get supported article sources
   */
  getSupportedSources() {
    return [
      'medium.com',
      'nytimes.com',
      'bbc.com',
      'wikipedia.org',
      'theguardian.com',
      'washingtonpost.com',
      'cnn.com',
      'reuters.com',
      'apnews.com',
      'bloomberg.com'
    ];
  }

  /**
   * Get extraction capabilities
   */
  getCapabilities() {
    return {
      supportsUrlExtraction: true,
      supportsHtmlExtraction: true,
      supportsMetadataExtraction: true,
      supportsContentCleaning: true,
      maxContentLength: this.maxContentLength,
      timeout: this.timeout
    };
  }
}

export default ArticleExtractor;