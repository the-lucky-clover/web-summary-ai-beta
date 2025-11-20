#!/bin/bash
echo "🔍 Testing Web Summary AI Extension..."
echo ""

# Check required files
echo "✓ Checking core files..."
files=("manifest.json" "background/index.js" "content-script/index.js" "popup/index.html" "popup/index.js" "popup/index.css")
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file exists"
  else
    echo "  ✗ $file MISSING"
    exit 1
  fi
done

# Check icons
echo ""
echo "✓ Checking icons..."
icons=("icons/logo-16.png" "icons/logo-32.png" "icons/logo-48.png" "icons/logo-128.png")
for icon in "${icons[@]}"; do
  if [ -f "$icon" ]; then
    size=$(wc -c < "$icon")
    echo "  ✓ $icon ($size bytes)"
  else
    echo "  ✗ $icon MISSING"
    exit 1
  fi
done

# Validate manifest JSON
echo ""
echo "✓ Validating manifest.json..."
if python3 -m json.tool manifest.json > /dev/null 2>&1; then
  echo "  ✓ Valid JSON syntax"
else
  echo "  ✗ Invalid JSON syntax"
  exit 1
fi

# Check permissions
echo ""
echo "✓ Checking permissions..."
perms=$(grep -A 5 '"permissions"' manifest.json)
echo "$perms"

echo ""
echo "🎉 All checks passed! Extension is ready to load."
echo ""
echo "📝 Next steps:"
echo "1. Open Brave Browser → brave://extensions/"
echo "2. Enable Developer Mode"
echo "3. Click 'Load unpacked'"
echo "4. Select: $(pwd)"
echo "5. Test on any webpage"
