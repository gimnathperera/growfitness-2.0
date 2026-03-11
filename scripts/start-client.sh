#!/bin/bash

# Script to start both client-web and api applications concurrently

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $CLIENT_WEB_PID $API_PID 2>/dev/null
    wait $CLIENT_WEB_PID $API_PID 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to project root
cd "$PROJECT_ROOT" || exit 1

echo -e "${BLUE}Starting Grow Fitness applications...${NC}"
echo -e "${GREEN}Starting client-web...${NC}"

# Start client-web in background
pnpm --filter @grow-fitness/client-web dev > /tmp/client-web.log 2>&1 &
CLIENT_WEB_PID=$!

echo -e "${GREEN}Starting api...${NC}"

# Start api in background
pnpm --filter @grow-fitness/api dev > /tmp/api.log 2>&1 &
API_PID=$!

echo -e "${GREEN}Both applications are starting...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to tail logs
tail_logs() {
    tail -f /tmp/client-web.log /tmp/api.log 2>/dev/null &
    TAIL_PID=$!
    wait $TAIL_PID
}

# Tail logs from both processes
tail_logs

# Wait for background processes
wait $CLIENT_WEB_PID $API_PID
