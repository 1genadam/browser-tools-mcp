import { Result as LighthouseResult } from "lighthouse";
import { AuditCategory, LighthouseReport } from "./types.js";
import { runLighthouseAudit } from "./index.js";

/**
 * PWA installability status
 */
export interface PWAInstallability {
  is_installable: boolean;
  has_manifest: boolean;
  has_service_worker: boolean;
  has_icons: boolean;
  issues: string[];
}

/**
 * PWA audit issue
 */
export interface PWAIssue {
  id: string;
  title: string;
  description: string;
  score: number | null;
  severity: "critical" | "serious" | "moderate" | "minor";
}

/**
 * PWA report content with AI-optimized data structure
 */
export interface PWAReportContent {
  score: number; // Overall PWA score (0-100)
  audit_counts: {
    failed: number;
    passed: number;
    manual: number;
    informative: number;
    not_applicable: number;
  };
  installability: PWAInstallability;
  offline_support: boolean;
  fast_reliable: boolean;
  optimized: boolean;
  issues: PWAIssue[];
  prioritized_recommendations?: string[];
}

/**
 * Complete PWA audit report
 */
export type PWAReport = LighthouseReport<PWAReportContent>;

/**
 * AI-optimized PWA report (alternative structure for backward compatibility)
 */
export interface AIOptimizedPWAReport {
  report: {
    category: "pwa";
    content: PWAReportContent;
  };
}

/**
 * Runs a PWA (Progressive Web App) audit on the specified URL
 * @param url The URL to audit
 * @returns Promise resolving to an AI-optimized PWA report
 * @throws Error if the audit fails or PWA category is missing
 */
export async function runPWAAudit(
  url: string
): Promise<AIOptimizedPWAReport> {
  console.log(`Starting PWA audit for: ${url}`);

  try {
    // Run Lighthouse audit with PWA category
    const result: LighthouseResult = await runLighthouseAudit(url, [
      AuditCategory.PWA,
    ]);

    // Extract PWA category from Lighthouse result
    const pwaCategory = result.categories?.pwa;

    if (!pwaCategory) {
      throw new Error("PWA category not found in Lighthouse result");
    }

    // Calculate overall PWA score (0-100)
    const score = Math.round((pwaCategory.score ?? 0) * 100);

    // Analyze PWA installability
    const manifestAudit = result.audits?.["installable-manifest"];
    const serviceWorkerAudit = result.audits?.["service-worker"];
    const iconsAudit = result.audits?.["apple-touch-icon"];
    const splashScreenAudit = result.audits?.["splash-screen"];
    const themedOmniboxAudit = result.audits?.["themed-omnibox"];

    const installability: PWAInstallability = {
      is_installable:
        manifestAudit?.score === 1 && serviceWorkerAudit?.score === 1,
      has_manifest: manifestAudit?.score === 1,
      has_service_worker: serviceWorkerAudit?.score === 1,
      has_icons: iconsAudit?.score === 1,
      issues: [],
    };

    // Collect installability issues
    if (!installability.has_manifest) {
      installability.issues.push(
        "Missing or invalid web app manifest (manifest.json)"
      );
    }
    if (!installability.has_service_worker) {
      installability.issues.push(
        "No service worker registered (required for offline support)"
      );
    }
    if (!installability.has_icons) {
      installability.issues.push("Missing app icons (required for installation)");
    }
    if (splashScreenAudit && splashScreenAudit.score !== 1) {
      installability.issues.push("Splash screen configuration incomplete");
    }
    if (themedOmniboxAudit && themedOmniboxAudit.score !== 1) {
      installability.issues.push("Themed omnibox (theme-color) not configured");
    }

    // Extract and categorize PWA issues
    const issues: PWAIssue[] = [];
    const auditRefs = pwaCategory.auditRefs || [];

    // Count audits by status
    let failedCount = 0;
    let passedCount = 0;
    let manualCount = 0;
    let informativeCount = 0;
    let notApplicableCount = 0;

    for (const ref of auditRefs) {
      const audit = result.audits?.[ref.id];
      if (!audit) continue;

      // Count audit types
      if (audit.scoreDisplayMode === "manual") {
        manualCount++;
        continue;
      }
      if (audit.scoreDisplayMode === "informative") {
        informativeCount++;
        continue;
      }
      if (audit.scoreDisplayMode === "notApplicable") {
        notApplicableCount++;
        continue;
      }

      // Skip passing audits
      if (audit.score === 1) {
        passedCount++;
        continue;
      }

      failedCount++;

      // Determine severity based on score
      let severity: "critical" | "serious" | "moderate" | "minor" = "moderate";
      if (audit.score === 0) {
        severity = "critical";
      } else if (audit.score !== null && audit.score <= 0.5) {
        severity = "serious";
      } else if (audit.score !== null && audit.score > 0.7) {
        severity = "minor";
      }

      issues.push({
        id: ref.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        severity,
      });
    }

    // Create prioritized recommendations
    const prioritized_recommendations = issues
      .sort((a, b) => {
        const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .map((issue) => `${issue.severity.toUpperCase()}: ${issue.title}`)
      .slice(0, 5);

    // Determine PWA capabilities
    const offline_support = serviceWorkerAudit?.score === 1;
    const fast_reliable = score >= 70; // PWA typically requires 70+ score
    const optimized = score >= 90; // Optimized PWA has 90+ score

    return {
      report: {
        category: "pwa",
        content: {
          score,
          audit_counts: {
            failed: failedCount,
            passed: passedCount,
            manual: manualCount,
            informative: informativeCount,
            not_applicable: notApplicableCount,
          },
          installability,
          offline_support,
          fast_reliable,
          optimized,
          issues,
          prioritized_recommendations,
        },
      },
    };
  } catch (error) {
    throw new Error(
      `PWA audit failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
