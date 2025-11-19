/**
 * Forensic-Level Summarization Engine
 * Ultra-detailed, sequential step extraction with surgical precision
 */

import SummarizationEngine from './SummarizationEngine.js';
import ThumbnailExtractor from '../extractors/ThumbnailExtractor.js';

class ForensicSummarizer extends SummarizationEngine {
  constructor(geminiApiKey) {
    super(geminiApiKey);
    this.thumbnailExtractor = new ThumbnailExtractor();
    this.forensicPrompt = this.buildForensicPrompt();
  }

  /**
   * Forensic summarization with ultra-detailed extraction
   */
  async summarizeForensic(content, options = {}) {
    try {
      const {
        url = null,
        includeThumbnail = true,
        includeMetadata = true
      } = options;

      // Extract metadata and thumbnail
      let metadata = null;
      if (url && includeMetadata) {
        metadata = await this.thumbnailExtractor.extractMetadata(url);
      }

      // Perform forensic summarization
      const forensicResult = await this.performForensicAnalysis(content, options);

      // Format output according to specifications
      const formattedOutput = this.formatForensicOutput(forensicResult, metadata);

      return {
        summary: formattedOutput,
        metadata: {
          ...metadata,
          contentType: 'forensic-analysis',
          processingTime: Date.now(),
          options
        }
      };

    } catch (error) {
      console.error('Forensic summarization error:', error);
      throw new Error(`Forensic analysis failed: ${error.message}`);
    }
  }

  /**
   * Perform forensic-level analysis
   */
  async performForensicAnalysis(content, options) {
    const prompt = `${this.forensicPrompt}

CONTENT TO ANALYZE:
${content}

ADDITIONAL CONTEXT:
- URL: ${options.url || 'Not provided'}
- Content Type: ${this.detectContentType(content)}
- Analysis Level: Ultra-detailed forensic extraction
- Output Format: Strictly follow the specified structure

PERFORM THE ANALYSIS NOW:`;

    const result = await this.callGeminiAPI(prompt);
    return this.parseForensicResult(result);
  }

  /**
   * Build the forensic analysis prompt
   */
  buildForensicPrompt() {
    return `You are an ultra-intelligent, semi-autonomous AI summarizer with forensic-level detail extraction capabilities. Your mission is to analyze the provided content and report back every technical, procedural, and contextual detail with surgical precision.

CRITICAL REQUIREMENTS:
- You are NOT allowed to generalize, skip steps, or group actions vaguely
- Every individual action, setting, and config MUST be extracted and documented in order
- Break down content into sections, then into detailed, sequential steps
- Every action, tool, file, and command should be an individual sub-step
- Include any visual references: buttons, menu names, tabs, sliders, filenames
- Never combine steps or skip names, models, commands, links, or tool versions
- Think like an engineer writing documentation for a system rebuild
- Assume the user needs to rebuild the whole demo from scratch using your output

MANDATORY OUTPUT FORMAT:

1. **Structured Outline of Content Title**
   - Break the content down into sections
   - Further break into detailed, sequential steps (not grouped)
   - Every action, tool, file, and command as individual sub-step
   - Include visual references: buttons, menu names, tabs, sliders, filenames

2. **Bullet Summary (w/ Emojis):**
   - 🛠️ Tools/frameworks used
   - 📋 Ordered steps performed
   - 💻 Devices/Specs mentioned
   - 🧪 Test/benchmarks conducted
   - 📁 Files/config paths referenced
   - 💰 Pricing/sponsorship information
   - 🔗 Full URLs mentioned
   - 🔒 Privacy/telemetry concerns

3. **TL;DR (3-15 Sentences):**
   - Write a detailed yet readable synthesis
   - Must include all named devices, tools, techniques, and results
   - If steps were shown, summarize their purpose and result
   - Never summarize vaguely - be relentlessly thorough

4. **Full Link Breakdown:**
   - Show every URL in full
   - Label: Free, Affiliate/Sponsored, Docs, Risky or tracking
   - Include context for each link

OUTPUT ONLY TEXT. Be relentlessly thorough.`;
  }

  /**
   * Parse forensic result into structured format
   */
  parseForensicResult(rawResult) {
    // Parse the structured output from Gemini
    const sections = this.extractSections(rawResult);

    return {
      structuredOutline: sections.structuredOutline || '',
      bulletSummary: sections.bulletSummary || '',
      tldr: sections.tldr || '',
      linkBreakdown: sections.linkBreakdown || '',
      rawAnalysis: rawResult
    };
  }

  /**
   * Extract sections from forensic analysis
   */
  extractSections(text) {
    const sections = {};

    // Extract Structured Outline
    const outlineMatch = text.match(/1\.\s*\*\*Structured Outline[^}]*?\*\*([\s\S]*?)(?=2\.|\*\*Bullet|$)/i);
    sections.structuredOutline = outlineMatch ? outlineMatch[1].trim() : '';

    // Extract Bullet Summary
    const bulletMatch = text.match(/2\.\s*\*\*Bullet Summary[^}]*?\*\*([\s\S]*?)(?=3\.|\*\*TL;DR|$)/i);
    sections.bulletSummary = bulletMatch ? bulletMatch[1].trim() : '';

    // Extract TL;DR
    const tldrMatch = text.match(/3\.\s*\*\*TL;DR[^}]*?\*\*([\s\S]*?)(?=4\.|\*\*Full|$)/i);
    sections.tldr = tldrMatch ? tldrMatch[1].trim() : '';

    // Extract Link Breakdown
    const linkMatch = text.match(/4\.\s*\*\*Full Link Breakdown[^}]*?\*\*([\s\S]*?)$/i);
    sections.linkBreakdown = linkMatch ? linkMatch[1].trim() : '';

    return sections;
  }

  /**
   * Format forensic output with thumbnail and metadata
   */
  formatForensicOutput(forensicResult, metadata) {
    let output = '';

    // Add thumbnail and metadata header
    if (metadata) {
      output += `📸 **Site Thumbnail:** ${metadata.thumbnail || 'Not available'}\n`;
      output += `🔗 **URL:** ${metadata.url}\n`;
      output += `📄 **Title:** ${metadata.title || 'Not extracted'}\n`;
      output += `📝 **Description:** ${metadata.description || 'Not available'}\n\n`;
      output += `---\n\n`;
    }

    // Add forensic analysis sections
    output += `## 🔍 FORENSIC ANALYSIS REPORT\n\n`;

    if (forensicResult.structuredOutline) {
      output += `### 1. Structured Outline\n\n`;
      output += `${forensicResult.structuredOutline}\n\n`;
    }

    if (forensicResult.bulletSummary) {
      output += `### 2. Bullet Summary (w/ Emojis)\n\n`;
      output += `${forensicResult.bulletSummary}\n\n`;
    }

    if (forensicResult.tldr) {
      output += `### 3. TL;DR\n\n`;
      output += `${forensicResult.tldr}\n\n`;
    }

    if (forensicResult.linkBreakdown) {
      output += `### 4. Full Link Breakdown\n\n`;
      output += `${forensicResult.linkBreakdown}\n\n`;
    }

    // Add metadata footer
    output += `---\n\n`;
    output += `**Analysis completed at:** ${new Date().toISOString()}\n`;
    output += `**Analysis method:** Ultra-detailed forensic extraction\n`;
    output += `**AI Model:** Google Gemini Flash 2.5\n`;

    return output;
  }

  /**
   * Enhanced content type detection for forensic analysis
   */
  detectContentType(content) {
    const baseType = super.detectContentType(content);

    // Add forensic-specific type detection
    if (typeof content === 'string') {
      if (content.includes('tutorial') || content.includes('guide')) {
        return 'tutorial';
      }
      if (content.includes('demo') || content.includes('demonstration')) {
        return 'demo';
      }
      if (content.includes('review') || content.includes('comparison')) {
        return 'review';
      }
      if (content.includes('configuration') || content.includes('setup')) {
        return 'configuration';
      }
    }

    return baseType;
  }

  /**
   * Get forensic analysis capabilities
   */
  getForensicCapabilities() {
    return {
      sequentialStepExtraction: true,
      visualReferenceDetection: true,
      commandAndFileExtraction: true,
      technicalDetailPrecision: true,
      rebuildDocumentation: true,
      thumbnailIntegration: true,
      metadataExtraction: true,
      linkAnalysis: true
    };
  }

  /**
   * Validate forensic analysis result
   */
  validateForensicResult(result) {
    const requiredSections = ['structuredOutline', 'bulletSummary', 'tldr', 'linkBreakdown'];

    for (const section of requiredSections) {
      if (!result[section] || result[section].trim().length === 0) {
        console.warn(`Forensic analysis missing required section: ${section}`);
        return false;
      }
    }

    return true;
  }
}

export default ForensicSummarizer;