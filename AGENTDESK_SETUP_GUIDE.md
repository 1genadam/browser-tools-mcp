# AgentDesk Browser Tools MCP Setup Guide

## Architecture Overview

AgentDesk Browser Tools MCP has **three components** that work together:

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌─────────────┐
│  HTTP       │ ──► │  MCP Server  │ ──► │  Node Server  │ ──► │   Chrome    │
│  Wrapper    │ ◄── │  (Protocol   │ ◄── │ (Middleware)  │ ◄── │  Extension  │
│  (5031)     │     │   Handler)   │     │ (browser-tools│     │  (v1.2.0)   │
└─────────────┘     └──────────────┘     │    -server)   │     └─────────────┘
                                         └───────────────┘
```

### Component Details

#### 1. Chrome Extension v1.2.0
- **Purpose**: Captures screenshots, console logs, network activity, DOM elements
- **Install**: Download from [v1.2.0 BrowserToolsMCP Chrome Extension](https://github.com/AgentDeskAI/browser-tools-mcp/releases/download/v1.2.0/BrowserTools-1.2.0-extension.zip)
- **Location**: Already present at `/Users/robertsher/Projects/automation-hub/mcp-servers/agentdesk-browser-mcp/chrome-extension`

#### 2. browser-tools-server (Node Server Middleware)
- **Purpose**: Acts as middleware between Chrome extension and MCP server
- **Command**: `npx @agentdeskai/browser-tools-server@latest`
- **Status**: ❌ NOT CURRENTLY RUNNING
- **Note**: This is the CRITICAL MISSING COMPONENT

#### 3. browser-tools-mcp (MCP Server)
- **Purpose**: Implements Model Context Protocol, provides tools for AI clients
- **Command**: `npx @agentdeskai/browser-tools-mcp@latest`
- **Status**: ❌ NOT CURRENTLY RUNNING
- **Note**: Should be configured in IDE (Cursor, Claude Desktop, etc.)

#### 4. http-server.js (HTTP Wrapper) ✅ ALREADY RUNNING
- **Purpose**: HTTP REST API wrapper around AgentDesk components (port 5031)
- **Status**: ✅ Running on port 5031
- **Location**: `/Users/robertsher/Projects/automation-hub/mcp-servers/agentdesk-browser-mcp/http-server.js`

---

## Current Status

### What's Working ✅
- **HTTP Wrapper** running on port 5031
- Provides REST API endpoints:
  - `POST /browser/lighthouse` - Lighthouse audit
  - `POST /browser/accessibility` - WCAG accessibility check
  - `POST /browser/performance` - Performance analysis
  - `POST /browser/seo` - SEO audit

### What's Missing ❌
1. **browser-tools-server** (middleware) - NOT RUNNING
2. **browser-tools-mcp** (MCP server) - NOT RUNNING
3. **Chrome Extension** - NOT CONFIRMED INSTALLED

### What This Means
- HTTP wrapper returns **placeholder responses**
- No actual Lighthouse auditing happening
- No Chrome extension communication
- AgentDesk capabilities at **0% functional**

---

## Setup Instructions

### Step 1: Install Chrome Extension

```bash
# Extension already present locally
cd /Users/robertsher/Projects/automation-hub/mcp-servers/agentdesk-browser-mcp/chrome-extension

# Manual Installation in Chrome:
# 1. Open Chrome → chrome://extensions/
# 2. Enable "Developer mode" (top right)
# 3. Click "Load unpacked"
# 4. Select the chrome-extension directory
# 5. Verify "BrowserTools MCP v1.2.0" appears in extensions list
```

### Step 2: Start browser-tools-server (Middleware)

```bash
# Terminal 1: Start browser-tools-server
npx @agentdeskai/browser-tools-server@latest

# Expected output:
# BrowserTools Server started on http://localhost:3000
# WebSocket server started on ws://localhost:3001
```

### Step 3: Start browser-tools-mcp (MCP Server)

```bash
# Terminal 2: Start browser-tools-mcp
npx @agentdeskai/browser-tools-mcp@latest

# Expected output:
# MCP server started
# Connected to browser-tools-server
```

### Step 4: Open Chrome DevTools Panel

```bash
# 1. Open Chrome
# 2. Navigate to any page
# 3. Open Chrome DevTools (F12)
# 4. Click "BrowserTools MCP" tab
# 5. Verify green "Connected" indicator
```

### Step 5: Test AgentDesk Functionality

```bash
# Test with HTTP wrapper (should get real results now)
curl -X POST http://localhost:5031/browser/lighthouse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://dev-wc-ducomb.fly.dev/rework-dashboard/sales"}'

# Expected: Real Lighthouse scores (Performance, Accessibility, SEO, Best Practices)
```

---

## Capabilities After Full Setup

### Lighthouse Auditing
- **Performance**: Page speed, render-blocking resources, DOM size
- **Accessibility**: WCAG compliance, color contrast, alt text, ARIA attributes
- **SEO**: Metadata, headings, link structure, search visibility
- **Best Practices**: Web development standards

### Browser Monitoring
- **Console Logs**: Real-time JavaScript console output
- **Network Activity**: XHR requests/responses, API calls
- **Screenshots**: Browser screenshots on demand
- **DOM Elements**: Track and analyze selected elements

### Integration with comprehensive-data-extraction.sh
- Chrome DevTools MCP handles authenticated flows + console errors
- AgentDesk handles Lighthouse audits + accessibility checks
- Combined: **12 types of insights** from one test run

---

## Troubleshooting

### Issue: Chrome Extension Not Connecting
```bash
# 1. Close ALL Chrome windows
# 2. Restart browser-tools-server
pkill -f browser-tools-server
npx @agentdeskai/browser-tools-server@latest

# 3. Restart Chrome
# 4. Open DevTools → BrowserTools MCP tab
# 5. Verify green "Connected" status
```

### Issue: MCP Server Not Finding browser-tools-server
```bash
# Ensure browser-tools-server is running FIRST
ps aux | grep browser-tools-server

# If not running, start it
npx @agentdeskai/browser-tools-server@latest
```

### Issue: HTTP Wrapper Returning Placeholders
```bash
# This means browser-tools-server is not running
# Start browser-tools-server per Step 2 above
```

---

## Next Steps

1. ✅ **Install Chrome Extension** (manual step, already local)
2. ✅ **Start browser-tools-server** (Terminal 1)
3. ✅ **Start browser-tools-mcp** (Terminal 2)
4. ✅ **Verify Chrome DevTools connection**
5. ✅ **Run comprehensive-data-extraction.sh** (should get real Lighthouse data)

---

## References

- **AgentDesk Docs**: https://browsertools.agentdesk.ai/
- **GitHub**: https://github.com/AgentDeskAI/browser-tools-mcp
- **Chrome Extension v1.2.0**: [Download Link](https://github.com/AgentDeskAI/browser-tools-mcp/releases/download/v1.2.0/BrowserTools-1.2.0-extension.zip)

---

**Status**: Configuration guide complete. Manual setup required for Chrome extension and AgentDesk servers.
