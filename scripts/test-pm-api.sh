#!/bin/bash

# Test script for PM API endpoints
# Run with: bash scripts/test-pm-api.sh

BASE_URL="http://localhost:3000"
API_BASE="${BASE_URL}/api/pm"

echo "🧪 Testing Project Management API Endpoints"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3

    echo -n "Testing ${method} ${endpoint} ... "

    response=$(curl -s -o /dev/null -w "%{http_code}" -X ${method} "${API_BASE}${endpoint}")

    # 200-299 = success, 400-499 = expected errors (validation, not found), 500+ = server error
    if [ $response -ge 200 ] && [ $response -lt 500 ]; then
        echo -e "${GREEN}✓${NC} HTTP ${response}"
    else
        echo -e "${RED}✗${NC} HTTP ${response} - Server Error"
    fi
}

echo "📋 Tasks Endpoints"
echo "------------------"
test_endpoint "GET" "/tasks" "List all tasks"
test_endpoint "GET" "/tasks?projectId=000000000000000000000001" "List tasks by project"
test_endpoint "GET" "/tasks/000000000000000000000001" "Get single task (expect 404)"
test_endpoint "POST" "/tasks" "Create task (expect validation error)"
echo ""

echo "🏃 Sprints Endpoints"
echo "--------------------"
test_endpoint "GET" "/sprints" "List all sprints"
test_endpoint "GET" "/sprints?projectId=000000000000000000000001" "List sprints by project"
test_endpoint "GET" "/sprints/000000000000000000000001" "Get single sprint (expect 404)"
test_endpoint "GET" "/sprints/000000000000000000000001/tasks" "Get sprint tasks (expect 404)"
test_endpoint "POST" "/sprints" "Create sprint (expect validation error)"
echo ""

echo "🏷️  Tags Endpoints"
echo "-----------------"
test_endpoint "GET" "/tags" "List all tags"
test_endpoint "GET" "/tags?projectId=000000000000000000000001" "List tags by project"
test_endpoint "GET" "/tags/000000000000000000000001" "Get single tag (expect 404)"
test_endpoint "POST" "/tags" "Create tag (expect validation error)"
echo ""

echo "👥 Users Endpoints"
echo "------------------"
test_endpoint "GET" "/users" "List all users"
test_endpoint "GET" "/users?isActive=true" "List active users"
test_endpoint "GET" "/users/000000000000000000000001" "Get single user (expect 404)"
test_endpoint "POST" "/users" "Create user (expect validation error)"
echo ""

echo "📊 Metrics Endpoints"
echo "--------------------"
test_endpoint "GET" "/metrics/burndown?sprintId=000000000000000000000001" "Burndown (expect 404)"
test_endpoint "GET" "/metrics/velocity?projectId=000000000000000000000001" "Velocity"
test_endpoint "GET" "/metrics/summary?sprintId=000000000000000000000001" "Sprint summary (expect 404)"
test_endpoint "GET" "/metrics/summary?projectId=000000000000000000000001" "Project summary (expect 404)"
echo ""

echo "============================================"
echo -e "${GREEN}✓${NC} API endpoint tests complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Run this script: bash scripts/test-pm-api.sh"
echo "3. Check MongoDB collections are created"
echo "4. Create test data via POST endpoints"
echo ""
