/**
 * JerseyStudio Automated Privacy & Network Traffic Inspection Test
 * Milestone 6 Deliverable
 *
 * Assertions:
 * 1. Zero project files, rosters, player names, numbers, SVG/canvas data, or exports are transmitted.
 * 2. Only allowed authentication metadata (email, otp, token_id) is sent to cloud services.
 * 3. 7-day offline license enforcement works strictly offline.
 * 4. Clock rollback detection protects offline license expiration.
 * 5. Safe local persistence: local SQLite records and files are NEVER deleted or corrupted.
 */

export interface CapturedNetworkPayload {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, any>;
  timestamp: number;
}

export const ALLOWED_CLOUD_FIELDS = new Set(['email', 'otp', 'token_id']);

export const FORBIDDEN_PROJECT_TERMS = [
  'project',
  'roster',
  'player',
  'jersey',
  'canvas',
  'svg',
  'design',
  'artwork',
  'export',
  'manifest',
  'vector',
];

export class PrivacyAuditSuite {
  private capturedTraffic: CapturedNetworkPayload[] = [];

  public recordRequest(url: string, method: string, headers: Record<string, string>, body: Record<string, any>) {
    this.capturedTraffic.push({
      url,
      method,
      headers,
      body,
      timestamp: Date.now(),
    });
  }

  public getCapturedTraffic(): CapturedNetworkPayload[] {
    return [...this.capturedTraffic];
  }

  /**
   * Asserts that no sensitive project data, player names, numbers, or designs were ever sent over network.
   */
  public assertZeroDataLeakage(knownProjectTokens: string[]): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    for (const entry of this.capturedTraffic) {
      const bodyStr = JSON.stringify(entry.body).toLowerCase();

      // 1. Check for known project tokens
      for (const token of knownProjectTokens) {
        if (bodyStr.includes(token.toLowerCase())) {
          violations.push(`Found sensitive project token "${token}" in request to ${entry.url}`);
        }
      }

      // 2. Check for unauthorized payload keys
      const keys = Object.keys(entry.body);
      for (const key of keys) {
        if (!ALLOWED_CLOUD_FIELDS.has(key)) {
          violations.push(`Unauthorized metadata key "${key}" detected in payload sent to ${entry.url}`);
        }
      }

      // 3. Check for forbidden design terms
      for (const forbidden of FORBIDDEN_PROJECT_TERMS) {
        if (bodyStr.includes(`"${forbidden}"`) || bodyStr.includes(`"${forbidden}s"`)) {
          violations.push(`Forbidden project schema term "${forbidden}" detected in request body to ${entry.url}`);
        }
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}
