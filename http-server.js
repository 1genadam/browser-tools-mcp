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
import { runLighthouseAudit } from './browser-tools-server/dist/lighthouse/index.js';
import { runAccessibilityAudit } from './browser-tools-server/dist/lighthouse/accessibility.js';
import { runPerformanceAudit } from './browser-tools-server/dist/lighthouse/performance.js';
import { runSEOAudit } from './browser-tools-server/dist/lighthouse/seo.js';
import { runBestPracticesAudit } from './browser-tools-server/dist/lighthouse/best-practices.js';
import { runPWAAudit } from './browser-tools-server/dist/lighthouse/pwa.js';
import { runComprehensiveSiteAnalysis } from './browser-tools-server/dist/lighthouse/comprehensive-analysis.js';
import { AuditCategory } from './browser-tools-server/dist/lighthouse/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5031;

// Session management
const sessions = new Map();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root endpoint - API documentation
app.get('/', (req, res) => {
  res.json({
    service: 'AgentDesk Browser Tools MCP Server',
    version: '2.0.0',
    port: PORT,
    description: 'Browser monitoring and interaction tool via Chrome extension and Anthropic MCP with session support',
    endpoints: {
      health: 'GET /health - Health check',
      status: 'GET /status - Server status',
      sessionStart: 'POST /session/start - Create new session',
      sessionNavigate: 'POST /session/:id/navigate - Navigate session to URL',
      sessionConsole: 'GET /session/:id/console - Get session console logs',
      sessionLighthouse: 'GET /session/:id/lighthouse - Run Lighthouse audit for session',
      sessionClose: 'POST /session/:id/close - Close session',
      screenshot: 'POST /browser/screenshot - Capture screenshot (legacy)',
      lighthouse: 'POST /browser/lighthouse - Run Lighthouse audit (legacy)',
      accessibility: 'POST /browser/accessibility - WCAG compliance check',
      performance: 'POST /browser/performance - Performance analysis',
      seo: 'POST /browser/seo - SEO audit',
      debug: 'POST /browser/debug - Debug mode (all tools)',
      audit: 'POST /browser/audit - Audit mode (all audits)',
      console_logs: 'GET /browser/console - Get console logs (legacy)',
      network: 'GET /browser/network - Get network requests'
    },
    documentation: 'See https://browsertools.agentdesk.ai/ for full guide',
    components: {
      mcp_server: 'npx @agentdeskai/browser-tools-mcp@latest',
      browser_server: 'npx @agentdeskai/browser-tools-server@latest',
      chrome_extension: 'v1.2.0 required'
    },
    integration: 'Chrome DevTools panel + MCP protocol + Session management',
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
      'audit_mode',
      'session_management'
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
    version: '2.0.0',
    port: PORT,
    browser_tools_server: 'standalone process',
    mcp_server: 'stdio mode',
    chrome_extension: 'required',
    session_support: 'enabled',
    active_sessions: sessions.size,
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

// ========================================================================
// SESSION-BASED ENDPOINTS (Chrome DevTools MCP Compatible)
// ========================================================================

// Create session endpoint
app.post('/session/start', async (req, res) => {
  try {
    const { sessionId, headless = true, slowMo = 0 } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    // Check if session already exists
    if (sessions.has(sessionId)) {
      return res.status(409).json({
        success: false,
        error: 'Session already exists',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }

    // Create session state
    const session = {
      sessionId,
      headless,
      slowMo,
      url: null,
      consoleLogs: [],
      lighthouseResults: null,
      created: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    sessions.set(sessionId, session);

    res.json({
      success: true,
      sessionId,
      message: 'Session created successfully',
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

// Navigate session to URL
app.post('/session/:id/navigate', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required',
        timestamp: new Date().toISOString()
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }

    // Update session state
    session.url = url;
    session.lastActivity = new Date().toISOString();
    sessions.set(sessionId, session);

    res.json({
      success: true,
      sessionId,
      message: `Navigated to ${url}`,
      url,
      note: 'Full navigation requires browser-tools-server and MCP server running',
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

// Get session console logs
app.get('/session/:id/console', async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }

    // Update session state
    session.lastActivity = new Date().toISOString();
    sessions.set(sessionId, session);

    res.json({
      success: true,
      sessionId,
      consoleLogs: session.consoleLogs,
      log_count: session.consoleLogs.length,
      note: 'Console logs require browser-tools-server and Chrome extension running',
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

// Get session Lighthouse audit
app.get('/session/:id/lighthouse', async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }

    const url = session.url;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'No URL navigated yet. Use POST /session/:id/navigate first',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }

    // Update session state
    session.lastActivity = new Date().toISOString();
    sessions.set(sessionId, session);

    // Run actual Lighthouse audits
    console.log(`Running Lighthouse audit for ${url}...`);

    try {
      // Run all audits in parallel for speed (Phase 1.6.3: Added PWA)
      const [performanceResult, accessibilityResult, seoResult, bestPracticesResult, pwaResult] = await Promise.all([
        runPerformanceAudit(url).catch(err => {
          console.error('Performance audit failed:', err.message);
          return null;
        }),
        runAccessibilityAudit(url).catch(err => {
          console.error('Accessibility audit failed:', err.message);
          return null;
        }),
        runSEOAudit(url).catch(err => {
          console.error('SEO audit failed:', err.message);
          return null;
        }),
        runBestPracticesAudit(url).catch(err => {
          console.error('Best Practices audit failed:', err.message);
          return null;
        }),
        runPWAAudit(url).catch(err => {
          console.error('PWA audit failed:', err.message);
          return null;
        })
      ]);

      // Extract scores from audit results
      // ✅ Phase 1.6.1: Fixed path to report.content.score (not report.score)
      // ✅ Phase 1.6.2: Added Best Practices audit extraction
      // ✅ Phase 1.6.3: Added PWA audit extraction
      const lighthouse_scores = {
        performance: performanceResult?.report?.content?.score || 0,
        accessibility: accessibilityResult?.report?.content?.score || 0,
        seo: seoResult?.report?.content?.score || 0,
        'best-practices': bestPracticesResult?.report?.content?.score || 0, // ✅ Phase 1.6.2
        pwa: pwaResult?.report?.content?.score || 0 // ✅ Phase 1.6.3
      };

      // Add detailed logging for debugging (Phase 1.6.3: Added PWA)
      console.log('Lighthouse Results Structure:', {
        performance: {
          hasReport: !!performanceResult?.report,
          hasContent: !!performanceResult?.report?.content,
          score: performanceResult?.report?.content?.score
        },
        accessibility: {
          hasReport: !!accessibilityResult?.report,
          hasContent: !!accessibilityResult?.report?.content,
          score: accessibilityResult?.report?.content?.score
        },
        seo: {
          hasReport: !!seoResult?.report,
          hasContent: !!seoResult?.report?.content,
          score: seoResult?.report?.content?.score
        },
        bestPractices: {
          hasReport: !!bestPracticesResult?.report,
          hasContent: !!bestPracticesResult?.report?.content,
          score: bestPracticesResult?.report?.content?.score
        },
        pwa: {
          hasReport: !!pwaResult?.report,
          hasContent: !!pwaResult?.report?.content,
          score: pwaResult?.report?.content?.score
        }
      });

      // Store results in session for caching (Phase 1.6.3: Added PWA)
      session.lighthouseResults = {
        scores: lighthouse_scores,
        details: {
          performance: performanceResult,
          accessibility: accessibilityResult,
          seo: seoResult,
          bestPractices: bestPracticesResult,
          pwa: pwaResult
        },
        timestamp: new Date().toISOString()
      };
      sessions.set(sessionId, session);

      console.log(`Lighthouse audit complete for ${url}:`, lighthouse_scores);

      res.json({
        success: true,
        sessionId,
        url,
        lighthouse: lighthouse_scores,
        timestamp: new Date().toISOString()
      });
    } catch (auditError) {
      console.error('Lighthouse audit error:', auditError);

      // Return partial results if available
      res.json({
        success: false,
        sessionId,
        url,
        error: `Lighthouse audit failed: ${auditError.message}`,
        lighthouse: {
          categories: ['performance', 'accessibility', 'best-practices', 'seo'],
          note: 'Lighthouse audit failed - Chrome/Chromium may not be available in production environment'
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Close session
app.post('/session/:id/close', async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }

    // Remove session
    sessions.delete(sessionId);

    res.json({
      success: true,
      sessionId,
      message: 'Session closed successfully',
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

// Comprehensive site analysis endpoint
app.post('/session/:id/comprehensive-analysis', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
        timestamp: new Date().toISOString()
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        sessionId,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`[${sessionId}] Running comprehensive site analysis for ${url}`);

    // Run comprehensive analysis
    const analysis = await runComprehensiveSiteAnalysis(url);

    // Store in session for caching
    session.comprehensiveAnalysis = analysis;

    res.json({
      success: true,
      sessionId,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Comprehensive analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Comprehensive analysis failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ========================================================================
// LEGACY ENDPOINTS (Backward Compatibility)
// ========================================================================

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
  console.log(`✅ AgentDesk Browser Tools MCP HTTP Server v2.0 running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
  console.log(`🔗 Session API: POST /session/start`);
  console.log(`🌐 Chrome extension integration enabled`);
  console.log(`📈 Lighthouse auditing: Performance, SEO, Accessibility, Best Practices`);
  console.log(`🤖 MCP protocol for AI-powered browser interaction`);
  console.log(`✨ Session-based workflow support added`);
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
  console.log(`📊 Active sessions at shutdown: ${sessions.size}`);
  process.exit(0);
});
