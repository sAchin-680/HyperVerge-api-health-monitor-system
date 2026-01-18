#!/bin/bash

# Observability Test Script
# Tests all health checks and metrics endpoints

echo "========================================"
echo " Observability Test Suite"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "503" ]; then
        echo -e "${GREEN}OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}FAIL${NC} (HTTP $response)"
        return 1
    fi
}

echo " HEALTH CHECKS"
echo "----------------"
test_endpoint "API Health      " "http://localhost:4000/health"
test_endpoint "API Ready       " "http://localhost:4000/ready"
test_endpoint "API Live        " "http://localhost:4000/live"
echo ""
test_endpoint "Worker Health   " "http://localhost:4001/health"
test_endpoint "Worker Ready    " "http://localhost:4001/ready"
test_endpoint "Worker Live     " "http://localhost:4001/live"
echo ""
test_endpoint "Scheduler Health" "http://localhost:4002/health"
test_endpoint "Scheduler Ready " "http://localhost:4002/ready"
test_endpoint "Scheduler Live  " "http://localhost:4002/live"
echo ""
test_endpoint "Notifier Health " "http://localhost:4003/health"
test_endpoint "Notifier Ready  " "http://localhost:4003/ready"
test_endpoint "Notifier Live   " "http://localhost:4003/live"
echo ""

echo " METRICS ENDPOINTS"
echo "--------------------"
test_endpoint "API Metrics     " "http://localhost:4000/metrics"
test_endpoint "Worker Metrics  " "http://localhost:4001/metrics"
test_endpoint "Scheduler Metrics" "http://localhost:4002/metrics"
test_endpoint "Notifier Metrics" "http://localhost:4003/metrics"
echo ""

echo "========================================"
echo "  Detailed Health Check"
echo "========================================"
echo ""
echo "API Service:"
curl -s http://localhost:4000/health 2>/dev/null | jq '.' 2>/dev/null || echo "Service not running or jq not installed"
echo ""

echo "========================================"
echo "  Sample Metrics"
echo "========================================"
echo ""
echo "API Request Metrics:"
curl -s http://localhost:4000/metrics 2>/dev/null | grep "http_request" | head -5 || echo "Service not running"
echo ""

echo "========================================"
echo "  Test Complete"
echo "========================================"
echo ""

