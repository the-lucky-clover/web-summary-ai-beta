#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

async function runLighthouse(url, options = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
  });

  const runnerResult = await lighthouse(url, {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    ...options
  });

  await chrome.kill();

  return runnerResult.lhr;
}

async function runPerformanceTests() {
  const urls = [
    'http://localhost:8787',
    'http://localhost:8787/dashboard',
    'http://localhost:8787/auth'
  ];

  const results = {};

  console.log('🚀 Starting YTLDR Performance Tests...\n');

  for (const url of urls) {
    console.log(`📊 Testing: ${url}`);

    try {
      const result = await runLighthouse(url, {
        // Custom Lighthouse config for YTLDR
        settings: {
          emulatedFormFactor: 'desktop',
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
          },
        },
      });

      const pageName = url.split('/').pop() || 'home';
      results[pageName] = {
        performance: Math.round(result.categories.performance.score * 100),
        accessibility: Math.round(result.categories.accessibility.score * 100),
        bestPractices: Math.round(result.categories['best-practices'].score * 100),
        seo: Math.round(result.categories.seo.score * 100),
        metrics: {
          firstContentfulPaint: Math.round(result.audits['first-contentful-paint'].numericValue),
          largestContentfulPaint: Math.round(result.audits['largest-contentful-paint'].numericValue),
          totalBlockingTime: Math.round(result.audits['total-blocking-time'].numericValue),
          cumulativeLayoutShift: result.audits['cumulative-layout-shift'].numericValue.toFixed(4),
          speedIndex: Math.round(result.audits['speed-index'].numericValue),
        }
      };

      // Save detailed report
      const reportPath = path.join(REPORTS_DIR, `lighthouse-${pageName}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

      console.log(`✅ ${pageName}: Performance ${results[pageName].performance}/100`);

    } catch (error) {
      console.error(`❌ Failed to test ${url}:`, error.message);
      results[url] = { error: error.message };
    }
  }

  // Generate summary report
  const summaryPath = path.join(REPORTS_DIR, 'performance-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  // Print summary
  console.log('\n📈 Performance Test Summary:');
  console.log('=' .repeat(50));

  Object.entries(results).forEach(([page, scores]) => {
    if (scores.error) {
      console.log(`❌ ${page}: ${scores.error}`);
    } else {
      console.log(`📊 ${page}:`);
      console.log(`   Performance: ${scores.performance}/100`);
      console.log(`   Accessibility: ${scores.accessibility}/100`);
      console.log(`   Best Practices: ${scores.bestPractices}/100`);
      console.log(`   SEO: ${scores.seo}/100`);
      console.log(`   FCP: ${scores.metrics.firstContentfulPaint}ms`);
      console.log(`   LCP: ${scores.metrics.largestContentfulPaint}ms`);
      console.log('');
    }
  });

  // Check thresholds
  const failedTests = Object.entries(results).filter(([_, scores]) => {
    return !scores.error && (
      scores.performance < 90 ||
      scores.accessibility < 95 ||
      scores.metrics.firstContentfulPaint > 2000
    );
  });

  if (failedTests.length > 0) {
    console.log('❌ Performance thresholds not met:');
    failedTests.forEach(([page]) => console.log(`   - ${page}`));
    process.exit(1);
  } else {
    console.log('✅ All performance thresholds met!');
  }
}

// Run accessibility tests with axe
async function runAccessibilityTests() {
  console.log('\n♿ Running Accessibility Tests...');

  const { AxePuppeteer } = require('@axe-core/puppeteer');
  const puppeteer = require('puppeteer');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:8787');

    const results = await new AxePuppeteer(page).analyze();

    const violations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');

    if (violations.length > 0) {
      console.log('❌ Accessibility violations found:');
      violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.help} (${violation.impact})`);
        console.log(`   ${violation.description}`);
      });
      process.exit(1);
    } else {
      console.log('✅ No critical accessibility violations!');
    }

  } catch (error) {
    console.error('❌ Accessibility test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Main execution
async function main() {
  try {
    await runPerformanceTests();
    await runAccessibilityTests();
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runLighthouse, runPerformanceTests, runAccessibilityTests };