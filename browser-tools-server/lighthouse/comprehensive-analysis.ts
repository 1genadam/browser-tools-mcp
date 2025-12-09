import { Result as LighthouseResult } from "lighthouse";
import {
  runPerformanceAudit,
  PerformanceReportContent,
} from "./performance.js";
import {
  runAccessibilityAudit,
  AccessibilityReportContent,
} from "./accessibility.js";
import { runSEOAudit, SEOReportContent } from "./seo.js";
import {
  runBestPracticesAudit,
  BestPracticesReportContent,
} from "./best-practices.js";
import { runPWAAudit, PWAReportContent } from "./pwa.js";

/**
 * Comprehensive site analysis aggregating all Lighthouse categories
 */
export interface ComprehensiveSiteAnalysis {
  url: string;
  analyzed_at: string;
  overall_score: number; // Weighted average of all categories (0-100)
  category_scores: {
    performance: number;
    accessibility: number;
    seo: number;
    best_practices: number;
    pwa: number;
  };
  performance: PerformanceReportContent;
  accessibility: AccessibilityReportContent;
  seo: SEOReportContent;
  best_practices: BestPracticesReportContent;
  pwa: PWAReportContent;
  cross_category_insights: CrossCategoryInsight[];
  prioritized_action_items: PrioritizedActionItem[];
  quick_wins: QuickWin[];
  summary: {
    total_issues: number;
    critical_issues: number;
    total_audits: number;
    passed_audits: number;
    failed_audits: number;
  };
}

/**
 * Insights that span multiple Lighthouse categories
 */
export interface CrossCategoryInsight {
  id: string;
  title: string;
  description: string;
  affected_categories: string[]; // e.g., ["performance", "seo", "accessibility"]
  impact: "critical" | "serious" | "moderate" | "minor";
  recommendation: string;
}

/**
 * Prioritized action item combining insights from multiple categories
 */
export interface PrioritizedActionItem {
  rank: number; // 1 = highest priority
  title: string;
  description: string;
  categories: string[]; // Categories this item improves
  impact: "critical" | "serious" | "moderate" | "minor";
  effort: "low" | "medium" | "high"; // Estimated implementation effort
  roi_score: number; // Impact vs effort ratio (0-100)
  action_steps: string[];
}

/**
 * Quick wins - low effort, high impact improvements
 */
export interface QuickWin {
  title: string;
  category: string;
  impact: string;
  estimated_time: string; // e.g., "5 minutes", "1 hour"
  action: string;
}

/**
 * Run comprehensive site analysis with all 5 Lighthouse categories
 * @param url The URL to analyze
 * @returns Promise resolving to comprehensive site analysis
 */
export async function runComprehensiveSiteAnalysis(
  url: string
): Promise<ComprehensiveSiteAnalysis> {
  console.log(`Starting comprehensive site analysis for: ${url}`);

  try {
    // Run all 5 audits in parallel
    const [
      performanceResult,
      accessibilityResult,
      seoResult,
      bestPracticesResult,
      pwaResult,
    ] = await Promise.all([
      runPerformanceAudit(url).catch((err) => {
        console.error("Performance audit failed:", err.message);
        return null;
      }),
      runAccessibilityAudit(url).catch((err) => {
        console.error("Accessibility audit failed:", err.message);
        return null;
      }),
      runSEOAudit(url).catch((err) => {
        console.error("SEO audit failed:", err.message);
        return null;
      }),
      runBestPracticesAudit(url).catch((err) => {
        console.error("Best Practices audit failed:", err.message);
        return null;
      }),
      runPWAAudit(url).catch((err) => {
        console.error("PWA audit failed:", err.message);
        return null;
      }),
    ]);

    // Extract category scores (with fallback to 0)
    const category_scores = {
      performance: performanceResult?.report?.content?.score || 0,
      accessibility: accessibilityResult?.report?.content?.score || 0,
      seo: seoResult?.report?.score || 0,
      best_practices: bestPracticesResult?.report?.content?.score || 0,
      pwa: pwaResult?.report?.content?.score || 0,
    };

    // Calculate weighted overall score
    // Weights: Performance 30%, Accessibility 25%, SEO 25%, Best Practices 15%, PWA 5%
    const overall_score = Math.round(
      category_scores.performance * 0.3 +
        category_scores.accessibility * 0.25 +
        category_scores.seo * 0.25 +
        category_scores.best_practices * 0.15 +
        category_scores.pwa * 0.05
    );

    // Extract report content with safe defaults
    const performance =
      performanceResult?.report?.content || createEmptyPerformanceReport();
    const accessibility =
      accessibilityResult?.report?.content ||
      createEmptyAccessibilityReport();
    const seo = seoResult?.report || createEmptySEOReport();
    const best_practices =
      bestPracticesResult?.report?.content ||
      createEmptyBestPracticesReport();
    const pwa = pwaResult?.report?.content || createEmptyPWAReport();

    // Calculate summary statistics
    const summary = calculateSummary(
      performance,
      accessibility,
      seo,
      best_practices,
      pwa
    );

    // Generate cross-category insights
    const cross_category_insights = generateCrossCategoryInsights(
      performance,
      accessibility,
      seo,
      best_practices,
      pwa
    );

    // Generate prioritized action items
    const prioritized_action_items = generatePrioritizedActionItems(
      performance,
      accessibility,
      seo,
      best_practices,
      pwa,
      cross_category_insights
    );

    // Generate quick wins
    const quick_wins = generateQuickWins(
      performance,
      accessibility,
      seo,
      best_practices,
      pwa
    );

    return {
      url,
      analyzed_at: new Date().toISOString(),
      overall_score,
      category_scores,
      performance,
      accessibility,
      seo,
      best_practices,
      pwa,
      cross_category_insights,
      prioritized_action_items,
      quick_wins,
      summary,
    };
  } catch (error) {
    throw new Error(
      `Comprehensive site analysis failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Calculate summary statistics across all categories
 */
function calculateSummary(
  performance: PerformanceReportContent,
  accessibility: AccessibilityReportContent,
  seo: SEOReportContent,
  best_practices: BestPracticesReportContent,
  pwa: PWAReportContent
): {
  total_issues: number;
  critical_issues: number;
  total_audits: number;
  passed_audits: number;
  failed_audits: number;
} {
  // Sum up audit counts from all categories
  const total_audits =
    (performance.audit_counts?.failed || 0) +
    (performance.audit_counts?.passed || 0) +
    (accessibility.audit_counts?.failed || 0) +
    (accessibility.audit_counts?.passed || 0) +
    (seo.audit_counts?.failed || 0) +
    (seo.audit_counts?.passed || 0) +
    (best_practices.audit_counts?.failed || 0) +
    (best_practices.audit_counts?.passed || 0) +
    (pwa.audit_counts?.failed || 0) +
    (pwa.audit_counts?.passed || 0);

  const passed_audits =
    (performance.audit_counts?.passed || 0) +
    (accessibility.audit_counts?.passed || 0) +
    (seo.audit_counts?.passed || 0) +
    (best_practices.audit_counts?.passed || 0) +
    (pwa.audit_counts?.passed || 0);

  const failed_audits =
    (performance.audit_counts?.failed || 0) +
    (accessibility.audit_counts?.failed || 0) +
    (seo.audit_counts?.failed || 0) +
    (best_practices.audit_counts?.failed || 0) +
    (pwa.audit_counts?.failed || 0);

  // Count issues by severity
  const total_issues =
    (performance.opportunities?.length || 0) +
    (accessibility.violations?.length || 0) +
    (seo.issues?.length || 0) +
    (best_practices.issues?.length || 0) +
    (pwa.issues?.length || 0);

  const critical_issues =
    (performance.opportunities?.filter((o) => o.impact === "critical")
      ?.length || 0) +
    (accessibility.violations?.filter((v) => v.impact === "critical")?.length ||
      0) +
    (seo.issues?.filter((i) => i.impact === "critical")?.length || 0) +
    (best_practices.issues?.filter((i) => i.severity === "critical")?.length ||
      0) +
    (pwa.issues?.filter((i) => i.severity === "critical")?.length || 0);

  return {
    total_issues,
    critical_issues,
    total_audits,
    passed_audits,
    failed_audits,
  };
}

/**
 * Generate insights that span multiple categories
 */
function generateCrossCategoryInsights(
  performance: PerformanceReportContent,
  accessibility: AccessibilityReportContent,
  seo: SEOReportContent,
  best_practices: BestPracticesReportContent,
  pwa: PWAReportContent
): CrossCategoryInsight[] {
  const insights: CrossCategoryInsight[] = [];

  // Insight 1: Large images affecting performance, SEO, and accessibility
  if (
    performance.opportunities?.some((o) => o.id === "uses-optimized-images") &&
    accessibility.violations?.some((v) => v.id === "image-alt")
  ) {
    insights.push({
      id: "large-images-multi-impact",
      title: "Image optimization affects multiple areas",
      description:
        "Unoptimized images are impacting page load speed, accessibility (missing alt text), and potentially SEO rankings.",
      affected_categories: ["performance", "accessibility", "seo"],
      impact: "serious",
      recommendation:
        "Compress images, add descriptive alt text, and use next-gen formats (WebP, AVIF) to improve performance, accessibility, and SEO simultaneously.",
    });
  }

  // Insight 2: Mobile-friendliness affecting performance, SEO, and accessibility
  if (
    performance.core_web_vitals?.CLS &&
    performance.core_web_vitals.CLS > 0.1 &&
    seo.categories?.mobile?.issues_count > 0
  ) {
    insights.push({
      id: "mobile-optimization-needed",
      title: "Mobile experience needs improvement",
      description:
        "Layout shifts (CLS) and mobile usability issues are impacting Core Web Vitals, SEO rankings, and user experience on mobile devices.",
      affected_categories: ["performance", "seo", "accessibility"],
      impact: "serious",
      recommendation:
        "Fix layout shifts by reserving space for images/ads, optimize viewport settings, and ensure touch targets are appropriately sized.",
    });
  }

  // Insight 3: PWA capabilities for performance and engagement
  if (
    !pwa.installability?.is_installable &&
    performance.score < 70 &&
    !pwa.offline_support
  ) {
    insights.push({
      id: "pwa-capabilities-missing",
      title: "PWA features could improve performance and engagement",
      description:
        "Adding PWA capabilities (service worker, manifest) would enable offline support, faster repeat visits, and installability.",
      affected_categories: ["pwa", "performance"],
      impact: "moderate",
      recommendation:
        "Implement a service worker for caching, create a web app manifest, and add app icons to enable PWA installation.",
    });
  }

  // Insight 4: HTTPS and security affecting SEO and best practices
  if (
    best_practices.issues?.some((i) => i.id === "is-on-https") &&
    seo.issues?.some((i) => i.category === "crawlability")
  ) {
    insights.push({
      id: "https-security-seo",
      title: "HTTPS migration needed for security and SEO",
      description:
        "Non-HTTPS pages are flagged by browsers as insecure and may be penalized in search rankings.",
      affected_categories: ["best_practices", "seo"],
      impact: "critical",
      recommendation:
        "Migrate entire site to HTTPS, update internal links, and implement proper redirects from HTTP to HTTPS.",
    });
  }

  // Insight 5: Accessibility and SEO overlap (semantic HTML)
  if (
    accessibility.violations?.some((v) =>
      ["heading-order", "document-title"].includes(v.id)
    ) &&
    seo.issues?.some((i) => i.category === "content")
  ) {
    insights.push({
      id: "semantic-html-structure",
      title: "HTML structure impacts both accessibility and SEO",
      description:
        "Proper heading hierarchy and semantic HTML help screen readers and search engines understand page content.",
      affected_categories: ["accessibility", "seo"],
      impact: "moderate",
      recommendation:
        "Use proper heading hierarchy (h1→h2→h3), semantic HTML5 elements, and descriptive page titles.",
    });
  }

  return insights;
}

/**
 * Generate prioritized action items combining insights from multiple categories
 */
function generatePrioritizedActionItems(
  performance: PerformanceReportContent,
  accessibility: AccessibilityReportContent,
  seo: SEOReportContent,
  best_practices: BestPracticesReportContent,
  pwa: PWAReportContent,
  cross_category_insights: CrossCategoryInsight[]
): PrioritizedActionItem[] {
  const action_items: PrioritizedActionItem[] = [];

  // Action 1: Critical issues first (if any HTTPS issues)
  if (
    best_practices.issues?.some(
      (i) => i.id === "is-on-https" && i.severity === "critical"
    )
  ) {
    action_items.push({
      rank: 1,
      title: "Migrate to HTTPS",
      description:
        "Implement SSL/TLS encryption for all pages to secure user data and meet security best practices.",
      categories: ["best_practices", "seo"],
      impact: "critical",
      effort: "medium",
      roi_score: 95,
      action_steps: [
        "1. Obtain SSL certificate (Let's Encrypt is free)",
        "2. Configure server to use HTTPS",
        "3. Update all internal links to use HTTPS",
        "4. Implement 301 redirects from HTTP to HTTPS",
        "5. Update sitemap and robots.txt",
      ],
    });
  }

  // Action 2: Core Web Vitals optimization (high ROI)
  if (
    performance.core_web_vitals?.LCP &&
    performance.core_web_vitals.LCP > 2500
  ) {
    action_items.push({
      rank: action_items.length + 1,
      title: "Optimize Largest Contentful Paint (LCP)",
      description:
        "Improve page load speed by optimizing the largest visible element's load time (currently exceeds 2.5s threshold).",
      categories: ["performance", "seo"],
      impact: "serious",
      effort: "medium",
      roi_score: 90,
      action_steps: [
        "1. Optimize and compress the LCP element (image/text block)",
        "2. Use CDN for faster content delivery",
        "3. Preload critical resources",
        "4. Remove render-blocking JavaScript",
        "5. Consider lazy loading non-critical content",
      ],
    });
  }

  // Action 3: Accessibility violations (legal and UX impact)
  const criticalA11yIssues = accessibility.violations?.filter(
    (v) => v.impact === "critical"
  );
  if (criticalA11yIssues && criticalA11yIssues.length > 0) {
    action_items.push({
      rank: action_items.length + 1,
      title: `Fix ${criticalA11yIssues.length} critical accessibility issues`,
      description:
        "Address WCAG violations that prevent users with disabilities from accessing content.",
      categories: ["accessibility"],
      impact: "critical",
      effort: "low",
      roi_score: 85,
      action_steps: [
        "1. Add alt text to all images",
        "2. Ensure proper color contrast (4.5:1 minimum)",
        "3. Add labels to form inputs",
        "4. Ensure keyboard navigation works",
        "5. Use semantic HTML elements",
      ],
    });
  }

  // Action 4: SEO content optimization
  if (seo.issues?.some((i) => i.id === "meta-description")) {
    action_items.push({
      rank: action_items.length + 1,
      title: "Add meta descriptions",
      description:
        "Create compelling meta descriptions to improve click-through rates from search results.",
      categories: ["seo"],
      impact: "moderate",
      effort: "low",
      roi_score: 80,
      action_steps: [
        "1. Write unique, descriptive meta descriptions (150-160 chars)",
        "2. Include target keywords naturally",
        "3. Add compelling call-to-action",
        "4. Ensure each page has a unique meta description",
      ],
    });
  }

  // Action 5: PWA implementation (if installability is missing)
  if (!pwa.installability?.is_installable && pwa.score < 50) {
    action_items.push({
      rank: action_items.length + 1,
      title: "Implement Progressive Web App features",
      description:
        "Add PWA capabilities to enable offline support, faster load times, and home screen installation.",
      categories: ["pwa", "performance"],
      impact: "moderate",
      effort: "high",
      roi_score: 70,
      action_steps: [
        "1. Create web app manifest (manifest.json)",
        "2. Add app icons (multiple sizes)",
        "3. Implement service worker for caching",
        "4. Test offline functionality",
        "5. Configure theme color and splash screen",
      ],
    });
  }

  // Sort by ROI score (highest first)
  action_items.sort((a, b) => b.roi_score - a.roi_score);

  // Update ranks after sorting
  action_items.forEach((item, index) => {
    item.rank = index + 1;
  });

  return action_items.slice(0, 10); // Return top 10 action items
}

/**
 * Generate quick wins - low effort, high impact improvements
 */
function generateQuickWins(
  performance: PerformanceReportContent,
  accessibility: AccessibilityReportContent,
  seo: SEOReportContent,
  best_practices: BestPracticesReportContent,
  pwa: PWAReportContent
): QuickWin[] {
  const quick_wins: QuickWin[] = [];

  // Quick win 1: Add meta description
  if (seo.issues?.some((i) => i.id === "meta-description")) {
    quick_wins.push({
      title: "Add meta description",
      category: "seo",
      impact: "Improves click-through rate from search results",
      estimated_time: "5 minutes",
      action:
        'Add <meta name="description" content="Your page description here"> to <head>',
    });
  }

  // Quick win 2: Add alt text to images
  if (accessibility.violations?.some((v) => v.id === "image-alt")) {
    quick_wins.push({
      title: "Add alt text to images",
      category: "accessibility",
      impact: "Improves accessibility for screen readers and SEO",
      estimated_time: "10 minutes",
      action: 'Add alt="descriptive text" attribute to all <img> tags',
    });
  }

  // Quick win 3: Enable text compression
  if (
    performance.opportunities?.some((o) => o.id === "uses-text-compression")
  ) {
    quick_wins.push({
      title: "Enable Gzip/Brotli compression",
      category: "performance",
      impact: "Reduces file transfer size by 70-90%",
      estimated_time: "15 minutes",
      action:
        "Configure server to enable Gzip or Brotli compression for text files",
    });
  }

  // Quick win 4: Add viewport meta tag
  if (seo.issues?.some((i) => i.id === "viewport")) {
    quick_wins.push({
      title: "Add viewport meta tag",
      category: "seo",
      impact: "Improves mobile rendering and SEO",
      estimated_time: "2 minutes",
      action:
        'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head>',
    });
  }

  // Quick win 5: Add page title
  if (seo.issues?.some((i) => i.id === "document-title")) {
    quick_wins.push({
      title: "Add descriptive page title",
      category: "seo",
      impact: "Improves SEO and browser tab identification",
      estimated_time: "5 minutes",
      action:
        "Add <title>Your Page Title - Site Name</title> to <head> section",
    });
  }

  // Quick win 6: Fix color contrast
  if (accessibility.violations?.some((v) => v.id === "color-contrast")) {
    quick_wins.push({
      title: "Fix color contrast issues",
      category: "accessibility",
      impact: "Improves readability for users with vision impairments",
      estimated_time: "20 minutes",
      action: "Adjust text and background colors to meet 4.5:1 contrast ratio",
    });
  }

  return quick_wins.slice(0, 6); // Return top 6 quick wins
}

// Empty report creators for fallback
function createEmptyPerformanceReport(): PerformanceReportContent {
  return {
    score: 0,
    audit_counts: {
      failed: 0,
      passed: 0,
      manual: 0,
      informative: 0,
      not_applicable: 0,
    },
    core_web_vitals: {},
    metrics: [],
    opportunities: [],
    diagnostics: [],
  };
}

function createEmptyAccessibilityReport(): AccessibilityReportContent {
  return {
    score: 0,
    audit_counts: {
      failed: 0,
      passed: 0,
      manual: 0,
      informative: 0,
      not_applicable: 0,
    },
    violations: [],
    incomplete: [],
    manual_checks: [],
  };
}

function createEmptySEOReport(): SEOReportContent {
  return {
    score: 0,
    audit_counts: {
      failed: 0,
      passed: 0,
      manual: 0,
      informative: 0,
      not_applicable: 0,
    },
    issues: [],
    categories: {},
  };
}

function createEmptyBestPracticesReport(): BestPracticesReportContent {
  return {
    score: 0,
    audit_counts: {
      failed: 0,
      passed: 0,
      manual: 0,
      informative: 0,
      not_applicable: 0,
    },
    issues: [],
  };
}

function createEmptyPWAReport(): PWAReportContent {
  return {
    score: 0,
    audit_counts: {
      failed: 0,
      passed: 0,
      manual: 0,
      informative: 0,
      not_applicable: 0,
    },
    installability: {
      is_installable: false,
      has_manifest: false,
      has_service_worker: false,
      has_icons: false,
      issues: [],
    },
    offline_support: false,
    fast_reliable: false,
    optimized: false,
    issues: [],
  };
}
