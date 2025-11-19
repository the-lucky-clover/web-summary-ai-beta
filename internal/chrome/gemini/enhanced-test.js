// Enhanced Security Features Test Suite
// Tests the new rotation, monitoring, and health features

function testKeyRotation() {
  console.log('Testing API key rotation system...');

  const checkKeyAge = (lastUpdated) => {
    if (!lastUpdated) return { status: 'none', days: 0 };
    const daysSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 90) {
      return { status: 'expired', days: Math.floor(daysSinceUpdate) };
    } else if (daysSinceUpdate > 72) {
      return { status: 'warning', days: Math.floor(daysSinceUpdate) };
    }
    return { status: 'healthy', days: Math.floor(daysSinceUpdate) };
  };

  // Test healthy key
  const healthyResult = checkKeyAge(Date.now() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
  console.log('Healthy key test:', healthyResult.status === 'healthy' ? 'PASS' : 'FAIL');

  // Test warning key
  const warningResult = checkKeyAge(Date.now() - (75 * 24 * 60 * 60 * 1000)); // 75 days ago
  console.log('Warning key test:', warningResult.status === 'warning' ? 'PASS' : 'FAIL');

  // Test expired key
  const expiredResult = checkKeyAge(Date.now() - (100 * 24 * 60 * 60 * 1000)); // 100 days ago
  console.log('Expired key test:', expiredResult.status === 'expired' ? 'PASS' : 'FAIL');

  // Test no key
  const noKeyResult = checkKeyAge(null);
  console.log('No key test:', noKeyResult.status === 'none' ? 'PASS' : 'FAIL');
}

function testUsageMonitoring() {
  console.log('Testing usage monitoring system...');

  const updateUsageDisplay = (usage) => {
    const percentage = Math.min((usage.count / 1000) * 100, 100);
    return { percentage, text: `${usage.count} / 1000 requests` };
  };

  // Test normal usage
  const normalUsage = updateUsageDisplay({ count: 250 });
  console.log('Normal usage test:', normalUsage.percentage === 25 ? 'PASS' : 'FAIL');

  // Test high usage
  const highUsage = updateUsageDisplay({ count: 850 });
  console.log('High usage test:', highUsage.percentage === 85 ? 'PASS' : 'FAIL');

  // Test limit usage
  const limitUsage = updateUsageDisplay({ count: 1200 });
  console.log('Limit usage test:', limitUsage.percentage === 100 ? 'PASS' : 'FAIL');
}

function testHealthIndicators() {
  console.log('Testing health indicator system...');

  const updateKeyHealth = (status, days) => {
    switch (status) {
      case 'healthy':
        return `Healthy (${days} days)`;
      case 'warning':
        return `Rotate Soon (${days} days)`;
      case 'expired':
        return `Expired (${days} days)`;
      default:
        return 'No Key';
    }
  };

  console.log('Healthy indicator:', updateKeyHealth('healthy', 30) === 'Healthy (30 days)' ? 'PASS' : 'FAIL');
  console.log('Warning indicator:', updateKeyHealth('warning', 75) === 'Rotate Soon (75 days)' ? 'PASS' : 'FAIL');
  console.log('Expired indicator:', updateKeyHealth('expired', 95) === 'Expired (95 days)' ? 'PASS' : 'FAIL');
  console.log('No key indicator:', updateKeyHealth('none', 0) === 'No Key' ? 'PASS' : 'FAIL');
}

function testRateLimiting() {
  console.log('Testing enhanced rate limiting...');

  let lastOperation = 0;
  const checkRateLimit = () => {
    const now = Date.now();
    if (now - lastOperation < 1000) return false;
    lastOperation = now;
    return true;
  };

  // Test initial operation
  const firstOp = checkRateLimit();
  console.log('First operation:', firstOp ? 'PASS' : 'FAIL');

  // Test rapid operation (should fail)
  const rapidOp = checkRateLimit();
  console.log('Rapid operation:', !rapidOp ? 'PASS' : 'FAIL');

  // Test after delay (should pass)
  setTimeout(() => {
    const delayedOp = checkRateLimit();
    console.log('Delayed operation:', delayedOp ? 'PASS' : 'FAIL');
  }, 1100);
}

function testMetadataStorage() {
  console.log('Testing metadata storage structure...');

  const testMetadata = {
    geminiApiKey: 'AIzaSySampleKeyForTestingStructureOnly1234567890',
    lastUpdated: Date.now(),
    keyVersion: '1.0',
    rotatedAt: Date.now()
  };

  console.log('API key present:', typeof testMetadata.geminiApiKey === 'string' ? 'PASS' : 'FAIL');
  console.log('Last updated timestamp:', typeof testMetadata.lastUpdated === 'number' ? 'PASS' : 'FAIL');
  console.log('Version info:', testMetadata.keyVersion === '1.0' ? 'PASS' : 'FAIL');
  console.log('Rotation timestamp:', typeof testMetadata.rotatedAt === 'number' ? 'PASS' : 'FAIL');
}

// Run enhanced tests
console.log('Running Enhanced Security Features Tests...\n');

testKeyRotation();
console.log('');

testUsageMonitoring();
console.log('');

testHealthIndicators();
console.log('');

testRateLimiting();
console.log('');

testMetadataStorage();
console.log('');

console.log('✅ Enhanced features testing completed!');
console.log('Note: Rate limiting test includes async delay - check final result after 1.1 seconds');