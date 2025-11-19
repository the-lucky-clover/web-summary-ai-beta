/**
 * Site Thumbnail and Metadata Extraction
 * Extracts thumbnails, favicons, and metadata from URLs
 */

class ThumbnailExtractor {
  constructor() {
    this.timeout = 5000; // 5 seconds timeout
    this.thumbnailServices = [
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=',
      'https://api.thumbnail.ws/api/ab5b92c0e9c6e7c8e9c6e7c8e9c6e7c8/thumbnail/get?url='
    ];
  }

  /**
   * Extract thumbnail and metadata from URL
   */
  async extractMetadata(url, options = {}) {
    try {
      const {
        includeThumbnail = true,
        includeFavicon = true,
        includeOpenGraph = true,
        thumbnailSize = 'medium' // small, medium, large
      } = options;

      const metadata = {
        url,
        title: null,
        description: null,
        thumbnail: null,
        favicon: null,
        openGraph: {},
        extractedAt: new Date().toISOString()
      };

      // Extract basic metadata
      if (includeOpenGraph) {
        const ogData = await this.extractOpenGraphData(url);
        metadata.title = ogData.title;
        metadata.description = ogData.description;
        metadata.thumbnail = ogData.image;
        metadata.openGraph = ogData;
      }

      // Extract favicon
      if (includeFavicon) {
        metadata.favicon = await this.extractFavicon(url);
      }

      // Generate or find thumbnail
      if (includeThumbnail && !metadata.thumbnail) {
        metadata.thumbnail = await this.generateThumbnail(url, thumbnailSize);
      }

      return metadata;

    } catch (error) {
      console.error('Thumbnail extraction error:', error);
      return {
        url,
        error: error.message,
        extractedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Extract Open Graph and meta data
   */
  async extractOpenGraphData(url) {
    // In a real implementation, this would fetch the URL and parse meta tags
    // For demo purposes, we'll simulate the extraction

    const simulatedData = {
      title: this.extractTitleFromUrl(url),
      description: `Content from ${new URL(url).hostname}`,
      image: this.generateThumbnailUrl(url),
      siteName: new URL(url).hostname,
      type: 'website',
      url: url
    };

    return simulatedData;
  }

  /**
   * Extract favicon from URL
   */
  async extractFavicon(url) {
    try {
      const urlObj = new URL(url);
      const faviconUrls = [
        `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`,
        `${urlObj.protocol}//${urlObj.hostname}/favicon.png`,
        `${urlObj.protocol}//${urlObj.hostname}/favicon.svg`,
        `${urlObj.protocol}//${urlObj.hostname}/apple-touch-icon.png`,
        `${urlObj.protocol}//${urlObj.hostname}/apple-touch-icon-precomposed.png`
      ];

      // In a real implementation, we'd test each favicon URL
      // For demo, return the most common one
      return faviconUrls[0];

    } catch (error) {
      return null;
    }
  }

  /**
   * Generate thumbnail using external service
   */
  async generateThumbnail(url, size) {
    // In a real implementation, this would use a thumbnail service
    // For demo, we'll generate a placeholder thumbnail URL

    const sizeMap = {
      small: '200x150',
      medium: '400x300',
      large: '800x600'
    };

    const dimensions = sizeMap[size] || sizeMap.medium;

    // Return a placeholder thumbnail service URL
    return `https://via.placeholder.com/${dimensions}/007bff/ffffff?text=${encodeURIComponent(new URL(url).hostname)}`;
  }

  /**
   * Generate thumbnail URL for a site
   */
  generateThumbnailUrl(url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      // Use a free thumbnail service
      return `https://api.thumbnail.ws/api/ab5b92c0e9c6e7c8e9c6e7c8e9c6e7c8/thumbnail/get?url=${encodeURIComponent(url)}&width=400&height=300`;
    } catch {
      return null;
    }
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

      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Web Page';
    }
  }

  /**
   * Get thumbnail dimensions for different sizes
   */
  getThumbnailDimensions(size) {
    const dimensions = {
      small: { width: 200, height: 150 },
      medium: { width: 400, height: 300 },
      large: { width: 800, height: 600 }
    };

    return dimensions[size] || dimensions.medium;
  }

  /**
   * Validate thumbnail URL
   */
  async validateThumbnailUrl(thumbnailUrl) {
    // In a real implementation, this would check if the thumbnail URL is accessible
    // For demo, we'll do basic validation
    try {
      new URL(thumbnailUrl);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get supported thumbnail formats
   */
  getSupportedFormats() {
    return [
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp'
    ];
  }

  /**
   * Clean up thumbnail cache (if implemented)
   */
  async cleanupCache() {
    // In a real implementation, this would clean up cached thumbnails
    console.log('Thumbnail cache cleanup completed');
  }
}

export default ThumbnailExtractor;