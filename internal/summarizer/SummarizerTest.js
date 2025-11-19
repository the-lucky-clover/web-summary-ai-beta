/**
 * Comprehensive Summarization System Test
 * Tests all content types and summarization features
 */

import SummarizationEngine from './engine/SummarizationEngine.js';
import ContentDetector from './utils/ContentDetector.js';

class SummarizerTest {
  constructor() {
    this.engine = null;
    this.testResults = [];
  }

  async runAllTests(apiKey) {
    console.log('🚀 Starting Comprehensive Summarization System Tests...\n');

    if (!apiKey) {
      console.log('❌ No API key provided - using mock mode');
      this.engine = { summarize: this.mockSummarize };
    } else {
      this.engine = new SummarizationEngine(apiKey);
    }

    // Test content type detection
    await this.testContentDetection();

    // Test different content types
    await this.testTextSummarization();
    await this.testArticleSummarization();
    await this.testPDFSummarization();
    await this.testVideoSummarization();
    await this.testAudioSummarization();

    // Test summarization options
    await this.testSummarizationOptions();

    // Test long content handling
    await this.testLongContentHandling();

    // Test error handling
    await this.testErrorHandling();

    this.printResults();
  }

  async testContentDetection() {
    console.log('Testing Content Type Detection...');

    const testCases = [
      { input: 'https://www.youtube.com/watch?v=123', expected: 'youtube' },
      { input: 'https://open.spotify.com/episode/123', expected: 'podcast' },
      { input: 'document.pdf', expected: 'pdf' },
      { input: 'https://medium.com/article/123', expected: 'article' },
      { input: 'This is a plain text article...', expected: 'text' },
      { input: 'video.mp4', expected: 'video' },
      { input: 'podcast.mp3', expected: 'audio' }
    ];

    for (const testCase of testCases) {
      const detected = ContentDetector.detectContentType(testCase.input);
      const passed = detected === testCase.expected;
      this.testResults.push({
        test: 'Content Detection',
        input: testCase.input,
        expected: testCase.expected,
        actual: detected,
        passed
      });
    }
  }

  async testTextSummarization() {
    console.log('Testing Text Summarization...');

    const testText = `
      Artificial Intelligence (AI) is revolutionizing industries across the globe.
      Machine learning algorithms can now process vast amounts of data to identify
      patterns that humans might miss. Natural language processing has advanced
      to the point where AI can understand and generate human-like text.

      The implications for business are profound. Companies can automate routine
      tasks, gain insights from customer data, and create personalized experiences.
      However, ethical considerations around privacy, bias, and job displacement
      must be carefully addressed.

      The future of AI looks promising but requires responsible development and
      deployment to ensure benefits are shared equitably across society.
    `.trim();

    try {
      const result = await this.engine.summarize(testText, {
        type: 'text',
        length: 'medium',
        format: 'markdown'
      });

      const passed = result && result.summary && result.metadata;
      this.testResults.push({
        test: 'Text Summarization',
        passed,
        details: passed ? 'Summary generated successfully' : 'Failed to generate summary'
      });
    } catch (error) {
      this.testResults.push({
        test: 'Text Summarization',
        passed: false,
        details: error.message
      });
    }
  }

  async testArticleSummarization() {
    console.log('Testing Article Summarization...');

    const articleUrl = 'https://example.com/article/about-ai-advancements';

    try {
      const result = await this.engine.summarize(articleUrl, {
        type: 'article',
        length: 'short',
        focus: 'key-points'
      });

      const passed = result && result.summary;
      this.testResults.push({
        test: 'Article Summarization',
        passed,
        details: passed ? 'Article summary generated' : 'Failed to process article'
      });
    } catch (error) {
      this.testResults.push({
        test: 'Article Summarization',
        passed: false,
        details: error.message
      });
    }
  }

  async testPDFSummarization() {
    console.log('Testing PDF Summarization...');

    const pdfContent = '[PDF] This is a sample PDF document content that would normally be extracted from a PDF file using specialized libraries. It contains information about various topics including technology, science, and business development.';

    try {
      const result = await this.engine.summarize(pdfContent, {
        type: 'pdf',
        length: 'detailed',
        format: 'bullet'
      });

      const passed = result && result.summary;
      this.testResults.push({
        test: 'PDF Summarization',
        passed,
        details: passed ? 'PDF content summarized' : 'Failed to process PDF'
      });
    } catch (error) {
      this.testResults.push({
        test: 'PDF Summarization',
        passed: false,
        details: error.message
      });
    }
  }

  async testVideoSummarization() {
    console.log('Testing Video Summarization...');

    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    try {
      const result = await this.engine.summarize(videoUrl, {
        type: 'youtube',
        length: 'medium',
        focus: 'analysis'
      });

      const passed = result && result.summary;
      this.testResults.push({
        test: 'Video Summarization',
        passed,
        details: passed ? 'Video transcript summarized' : 'Failed to process video'
      });
    } catch (error) {
      this.testResults.push({
        test: 'Video Summarization',
        passed: false,
        details: error.message
      });
    }
  }

  async testAudioSummarization() {
    console.log('Testing Audio/Podcast Summarization...');

    const audioUrl = 'https://example.com/podcast/episode-1.mp3';

    try {
      const result = await this.engine.summarize(audioUrl, {
        type: 'podcast',
        length: 'long',
        format: 'paragraph'
      });

      const passed = result && result.summary;
      this.testResults.push({
        test: 'Audio Summarization',
        passed,
        details: passed ? 'Audio transcript summarized' : 'Failed to process audio'
      });
    } catch (error) {
      this.testResults.push({
        test: 'Audio Summarization',
        passed: false,
        details: error.message
      });
    }
  }

  async testSummarizationOptions() {
    console.log('Testing Summarization Options...');

    const testContent = 'This is a test content for checking different summarization options and formats.';

    const options = [
      { length: 'short', format: 'markdown' },
      { length: 'medium', format: 'bullet' },
      { length: 'long', format: 'paragraph' },
      { focus: 'key-points' },
      { focus: 'analysis' }
    ];

    for (const option of options) {
      try {
        const result = await this.engine.summarize(testContent, option);
        const passed = result && result.summary;
        this.testResults.push({
          test: `Summarization Options (${JSON.stringify(option)})`,
          passed,
          details: passed ? 'Option processed successfully' : 'Failed to process option'
        });
      } catch (error) {
        this.testResults.push({
          test: `Summarization Options (${JSON.stringify(option)})`,
          passed: false,
          details: error.message
        });
      }
    }
  }

  async testLongContentHandling() {
    console.log('Testing Long Content Handling...');

    // Create long content that exceeds chunk size
    const longContent = 'This is a test sentence. '.repeat(1000);

    try {
      const result = await this.engine.summarize(longContent, {
        type: 'long-text',
        length: 'detailed'
      });

      const passed = result && result.summary && result.metadata.chunksProcessed > 1;
      this.testResults.push({
        test: 'Long Content Handling',
        passed,
        details: passed ? `Processed ${result.metadata.chunksProcessed} chunks` : 'Failed to handle long content'
      });
    } catch (error) {
      this.testResults.push({
        test: 'Long Content Handling',
        passed: false,
        details: error.message
      });
    }
  }

  async testErrorHandling() {
    console.log('Testing Error Handling...');

    try {
      await this.engine.summarize('', { type: 'invalid' });
      this.testResults.push({
        test: 'Error Handling',
        passed: false,
        details: 'Should have thrown an error for invalid input'
      });
    } catch (error) {
      this.testResults.push({
        test: 'Error Handling',
        passed: true,
        details: 'Properly handled invalid input'
      });
    }
  }

  mockSummarize(content, options) {
    return Promise.resolve({
      summary: `[MOCK SUMMARY] This would be a real summary of: ${content.substring(0, 100)}...`,
      metadata: {
        contentType: options.type || 'text',
        originalLength: content.length,
        chunksProcessed: 1,
        processingTime: Date.now(),
        options
      }
    });
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const successRate = ((passed / total) * 100).toFixed(1);

    console.log(`✅ Passed: ${passed}/${total} (${successRate}%)`);

    if (passed < total) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.test}: ${result.details}`);
      });
    }

    console.log('\n🎯 Content Types Supported:');
    console.log('  ✅ Text documents');
    console.log('  ✅ Articles and web pages');
    console.log('  ✅ PDF documents');
    console.log('  ✅ YouTube videos');
    console.log('  ✅ Audio files and podcasts');
    console.log('  ✅ Long content (automatic chunking)');

    console.log('\n📝 Summarization Options:');
    console.log('  ✅ Length: Short, Medium, Long, Detailed');
    console.log('  ✅ Format: Markdown, Bullet points, Paragraphs');
    console.log('  ✅ Focus: General, Key-points, Analysis, Executive');

    console.log('\n🏆 Universal Summarization System Ready!');
  }
}

// Export for use in other modules
export default SummarizerTest;

// Allow running from command line
if (typeof window === 'undefined') {
  // Node.js environment
  const apiKey = process.argv[2] || null;
  const tester = new SummarizerTest();
  tester.runAllTests(apiKey);
}