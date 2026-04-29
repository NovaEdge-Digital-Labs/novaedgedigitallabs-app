#!/bin/bash
# NovaEdge Paperclip Setup Script
# Configures Claude AI team and initial organization

set -e

PAPERCLIP_API="http://127.0.0.1:3100/api"
ANTHROPIC_KEY="YOUR_ANTHROPIC_API_KEY"

echo "🚀 NovaEdge Paperclip Setup"
echo "============================"
echo ""

# Check if Paperclip is running
echo "✓ Checking Paperclip server..."
if ! curl -s "$PAPERCLIP_API/health" > /dev/null; then
  echo "✗ Paperclip server not running. Start with: npx paperclipai run"
  exit 1
fi
echo "✓ Paperclip server is running"
echo ""

# Get company list
echo "✓ Fetching company information..."
COMPANIES=$(curl -s "$PAPERCLIP_API/companies")
COMPANY_ID=$(echo "$COMPANIES" | jq -r '.[0].id' 2>/dev/null || echo "")

if [ -z "$COMPANY_ID" ]; then
  echo "✗ No company found. Please create one in the Paperclip UI first."
  exit 1
fi

echo "✓ Found company: $COMPANY_ID"
echo ""

# Configuration stored in environment
export ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
export LLM_PROVIDER="anthropic"
export LLM_MODEL="claude-3-5-sonnet-20241022"

echo "✓ Claude API Key configured"
echo "✓ Model: claude-3-5-sonnet-20241022"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Open Paperclip Dashboard:"
echo "   → http://127.0.0.1:3100"
echo ""
echo "2. Configure Claude in Settings:"
echo "   → Settings (gear icon) → LLM Configuration → Anthropic"
echo "   → Paste API key (it's already in environment)"
echo ""
echo "3. Create Your AI Team:"
echo "   → Org Chart → + Hire"
echo "   → Create CEO, CTO, Engineers, Designers, Growth Manager"
echo ""
echo "4. Define Goals:"
echo "   → Projects → Create quarterly milestones"
echo "   → Q2: 100 users, Q3: 500 users, Q4: 1000 users"
echo ""
echo "5. Start Agents:"
echo "   → Set heartbeat schedules"
echo "   → Monitor on Live Runs dashboard"
echo ""
echo "✓ Setup Complete! Your AI company is ready to grow. 🚀"
