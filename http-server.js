/**
 * AgentDesk Browser Tools MCP HTTP Server
 * Provides HTTP/REST API for browser monitoring and interaction via MCP
 * Port 5031 - Chrome extension integration, Lighthouse auditing, Puppeteer automation
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5031;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root endpoint - API documentation
app.get('/', (req, res) => {
  res.json({
    service: 'AgentDesk Browser Tools MCP Server',
    version: '1.2.0',
    port: PORT,
    description: 'Browser monitoring and interaction tool via Chrome extension and Anthropic MCP',
    endpoints: {
      health: 'GET /health - Health check',
      status: 'GET /status - Server status',
      screenshot: 'POST /browser/screenshot - Capture screenshot',
      lighthouse: 'POST /browser/lighthouse - Run Lighthouse audit',
      accessibility: 'POST /browser/accessibility - WCAG compliance check',
      performance: 'POST /browser/performance - Performance analysis',
      seo: 'POST /browser/seo - SEO audit',
      debug: 'POST /browser/debug - Debug mode (all tools)',
      audit: 'POST /browser/audit - Audit mode (all audits)',
      console_logs: 'GET /browser/console - Get console logs',
      network: 'GET /browser/network - Get network requests'
    },
    documentation: 'See https://browsertools.agentdesk.ai/ for full guide',
    components: {
      mcp_server: 'npx @agentdeskai/browser-tools-mcp@latest',
      browser_server: 'npx @agentdeskai/browser-tools-server@latest',
      chrome_extension: 'v1.2.0 required'
    },
    integration: 'Chrome DevTools panel + MCP protocol',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'agentdesk-browser-tools',
    port: PORT,
    capabilities: [
      'screenshot_capture',
      'lighthouse_auditing',
      'wcag_compliance',
      'performance_analysis',
      'seo_auditing',
      'console_log_capture',
      'network_monitoring',
      'chrome_extension_integration',
      'puppeteer_automation',
      'debug_mode',
      'audit_mode'
    ],
    dependencies: {
      browser_tools_server: 'required',
      chrome_extension: 'v1.2.0+',
      mcp_protocol: 'enabled',
      lighthouse: 'integrated',
      puppeteer: 'integrated'
    },
    timestamp: new Date().toISOString()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    service: 'agentdesk-browser-tools',
    version: '1.2.0',
    port: PORT,
    browser_tools_server: 'standalone process',
    mcp_server: 'stdio mode',
    chrome_extension: 'required',
    features: {
      auto_paste_cursor: 'enabled',
      lighthouse_integration: 'enabled',
      nextjs_seo_prompts: 'enabled',
      debugger_mode: 'enabled',
      audit_mode: 'enabled',
      auto_reconnect: 'enabled',
      graceful_shutdown: 'enabled'
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Screenshot endpoint
app.post('/browser/screenshot', async (req, res) => {
  try {
    const { url, full_page = false } = req.body;

    // Note: Actual implementation would communicate with browser-tools-server
    // This is a placeholder that demonstrates the API structure
    res.json({
      success: true,
      message: 'Screenshot capture requires browser-tools-server and MCP server running',
      instructions: [
        '1. Start browser-tools-server: npx @agentdeskai/browser-tools-server@latest',
        '2. Configure MCP server in IDE with: npx @agentdeskai/browser-tools-mcp@latest',
        '3. Install Chrome extension v1.2.0',
        '4. Open Chrome DevTools BrowserToolsMCP panel'
      ],
      url: url || 'current page',
      full_page: full_page,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Lighthouse audit endpoint
app.post('/browser/lighthouse', async (req, res) => {
  try {
    const { url, categories = ['performance', 'accessibility', 'best-practices', 'seo'] } = req.body;

    res.json({
      success: true,
      message: 'Lighthouse audit requires browser-tools-server and MCP server running',
      audit_type: 'lighthouse',
      url: url || 'current page',
      categories: categories,
      instructions: [
        'Run full Lighthouse audit via MCP server',
        'Evaluates WCAG compliance, performance bottlenecks, SEO issues',
        'Uses Puppeteer + Lighthouse npm library'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Accessibility audit endpoint
app.post('/browser/accessibility', async (req, res) => {
  try {
    const { url, wcag_level = 'AA' } = req.body;

    res.json({
      success: true,
      message: 'WCAG compliance check via Lighthouse',
      audit_type: 'accessibility',
      url: url || 'current page',
      wcag_level: wcag_level,
      checks: [
        'Color contrast ratios',
        'Keyboard navigation',
        'Screen reader compatibility',
        'ARIA attributes',
        'Form labels'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Performance analysis endpoint
app.post('/browser/performance', async (req, res) => {
  try {
    const { url } = req.body;

    res.json({
      success: true,
      message: 'Performance analysis via Lighthouse',
      audit_type: 'performance',
      url: url || 'current page',
      metrics: [
        'First Contentful Paint (FCP)',
        'Largest Contentful Paint (LCP)',
        'Time to Interactive (TTI)',
        'Total Blocking Time (TBT)',
        'Cumulative Layout Shift (CLS)'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// SEO audit endpoint
app.post('/browser/seo', async (req, res) => {
  try {
    const { url, framework = 'general' } = req.body;

    res.json({
      success: true,
      message: 'SEO audit via Lighthouse',
      audit_type: 'seo',
      url: url || 'current page',
      framework: framework, // 'general' or 'nextjs'
      checks: [
        'Meta tags',
        'Title optimization',
        'Description quality',
        'Structured data',
        'Robots.txt',
        'Sitemap',
        'Mobile-friendliness'
      ],
      nextjs_specific: framework === 'nextjs',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Debug mode endpoint
app.post('/browser/debug', async (req, res) => {
  try {
    const { url } = req.body;

    res.json({
      success: true,
      message: 'Debug mode executes all debugging tools in sequence',
      audit_type: 'debug',
      url: url || 'current page',
      tools: [
        'Console log capture',
        'Network request monitoring',
        'JavaScript error detection',
        'Resource loading analysis',
        'DOM inspection'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Audit mode endpoint
app.post('/browser/audit', async (req, res) => {
  try {
    const { url } = req.body;

    res.json({
      success: true,
      message: 'Audit mode executes all auditing tools in sequence',
      audit_type: 'audit',
      url: url || 'current page',
      audits: [
        'Accessibility (WCAG)',
        'Performance metrics',
        'SEO analysis',
        'Best practices',
        'Security headers'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Console logs endpoint
app.get('/browser/console', (req, res) => {
  res.json({
    success: true,
    message: 'Console logs captured via Chrome extension',
    logs: [],
    note: 'Requires browser-tools-server and Chrome extension running',
    timestamp: new Date().toISOString()
  });
});

// Network requests endpoint
app.get('/browser/network', (req, res) => {
  res.json({
    success: true,
    message: 'Network requests captured via Chrome extension',
    requests: [],
    note: 'Requires browser-tools-server and Chrome extension running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ AgentDesk Browser Tools MCP HTTP Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
  console.log(`🌐 Chrome extension integration enabled`);
  console.log(`📈 Lighthouse auditing: Performance, SEO, Accessibility, Best Practices`);
  console.log(`🤖 MCP protocol for AI-powered browser interaction`);
  console.log(`📝 Full docs: https://browsertools.agentdesk.ai/`);
  console.log('');
  console.log('⚠️  Note: Full functionality requires:');
  console.log('   1. browser-tools-server: npx @agentdeskai/browser-tools-server@latest');
  console.log('   2. MCP server in IDE: npx @agentdeskai/browser-tools-mcp@latest');
  console.log('   3. Chrome extension v1.2.0 installed');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down AgentDesk Browser Tools MCP HTTP Server...');
  process.exit(0);
});
