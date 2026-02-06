#!/bin/bash

# Test script for AI Sales Configurator
# Run this to verify the integration works

echo "🧪 Testing EA Accounting Platform - AI Sales Configurator"
echo "=========================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API endpoint
API_URL="${API_URL:-http://localhost:3000}/api/v1/sales/configure"

echo "📍 Testing API endpoint: $API_URL"
echo ""

# Test 1: Small Retail Business
echo "${YELLOW}Test 1: Small Retail Business (Kenya)${NC}"
echo "----------------------------------------"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "company_size": "11-50",
    "industry": "retail",
    "countries": ["KE"],
    "offline_required": false,
    "modules_needed": ["accounting", "invoicing", "tax", "inventory"]
  }')

if echo "$RESPONSE" | grep -q "recommended_deployment"; then
  echo "${GREEN}✓ Test 1 PASSED${NC}"
  echo "Deployment: $(echo $RESPONSE | grep -o '"recommended_deployment":"[^"]*"' | cut -d'"' -f4)"
  echo "Tier: $(echo $RESPONSE | grep -o '"license_tier":"[^"]*"' | cut -d'"' -f4)"
  echo "Price: \$$(echo $RESPONSE | grep -o '"total_first_year":[0-9]*' | cut -d':' -f2)"
else
  echo "${RED}✗ Test 1 FAILED${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 2: Large NGO (Multi-country, Offline)
echo "${YELLOW}Test 2: Large NGO (Multi-country, Offline)${NC}"
echo "--------------------------------------------"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "company_size": "201-500",
    "industry": "ngo",
    "countries": ["KE", "UG"],
    "offline_required": true,
    "modules_needed": ["accounting", "invoicing", "tax", "payroll"]
  }')

if echo "$RESPONSE" | grep -q "recommended_deployment"; then
  echo "${GREEN}✓ Test 2 PASSED${NC}"
  echo "Deployment: $(echo $RESPONSE | grep -o '"recommended_deployment":"[^"]*"' | cut -d'"' -f4)"
  echo "Tier: $(echo $RESPONSE | grep -o '"license_tier":"[^"]*"' | cut -d'"' -f4)"
  echo "Price: \$$(echo $RESPONSE | grep -o '"total_first_year":[0-9]*' | cut -d':' -f2)"
  
  # Verify it's on-premise and enterprise
  if echo "$RESPONSE" | grep -q '"recommended_deployment":"onprem"'; then
    echo "${GREEN}✓ Correctly recommended on-premise for offline NGO${NC}"
  else
    echo "${RED}✗ Should recommend on-premise for offline requirement${NC}"
  fi
  
  if echo "$RESPONSE" | grep -q '"license_tier":"enterprise"'; then
    echo "${GREEN}✓ Correctly recommended enterprise for NGO${NC}"
  else
    echo "${RED}✗ Should recommend enterprise tier for NGO${NC}"
  fi
else
  echo "${RED}✗ Test 2 FAILED${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 3: Missing Required Fields
echo "${YELLOW}Test 3: Validation (Missing Fields)${NC}"
echo "-------------------------------------"

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "company_size": "11-50"
  }')

if echo "$RESPONSE" | grep -q "error"; then
  echo "${GREEN}✓ Test 3 PASSED - Validation working${NC}"
  echo "Error: $(echo $RESPONSE | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
else
  echo "${RED}✗ Test 3 FAILED - Should return validation error${NC}"
fi
echo ""

# Summary
echo "=========================================================="
echo "${GREEN}🎉 Integration tests complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start your backend: cd backend && npm run dev"
echo "2. Start your frontend: npm run dev"
echo "3. Navigate to Sales Configurator in your app"
echo "4. Test with real client profiles"
echo ""
echo "API endpoint: $API_URL"
echo "Frontend component: /src/app/components/sales/SalesConfigurator.tsx"
