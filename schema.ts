/**
 * Schema definitions for Small App Garden data
 */

export interface Author {
  name: string;
  github: string;
  avatar: string;
}

export interface Stack {
  framework: string;
  language: string | string[];
  buildTool: string | { python: string; typescript: string };
  packageManager: string | { python: string; typescript: string };
  uiLibrary?: string | null;
  orm?: string;
  auth?: string;
  monorepo?: boolean;
  workspaces?: string[];
}

export interface Dependencies {
  runtime: Record<string, string>;
  dev: Record<string, string>;
}

export interface Testing {
  hasTests: boolean;
  framework: string | null | { python: string; typescript: string };
  testFiles?: string[] | { python: string[]; typescript: string[] };
}

export interface CI {
  hasGitHubActions: boolean;
  workflows: string[];
}

export interface CloudflareIntegration {
  products: string[];
  bindings: Record<string, unknown>;
  hasWranglerConfig?: boolean;
  compatibilityDate?: string | null;
  firstCommitDate?: string | null;
  compatibilityDateGteFirstCommit?: boolean | null;
}

export interface ReplicateIntegration {
  usesReplicate: boolean;
  models: string[];
  apiIntegration: string | null;
}

export interface RepoHygiene {
  hasDescription: boolean;
  description: string | null;
  hasWebsite: boolean;
  websiteUrl: string | null;
  hasReadme: boolean;
  readmeHasImage: boolean;
  readmeHasVideo: boolean;
  license: string | null;
  stars: number;
  forks: number;
}

export interface App {
  name: string;
  slug: string;
  description: string;
  url: string;
  github: string;
  author: Author;
  shippedDate: string;
  youtubeVideo?: string;
  socialLink?: string;
  exampleProfile?: string;
  stack: Stack;
  dependencies: Dependencies | Record<string, Dependencies | Record<string, string>>;
  testing: Testing;
  ci: CI;
  cloudflare: CloudflareIntegration;
  replicate: ReplicateIntegration;
  hygiene: RepoHygiene;
  tags: string[];
}

export interface Summary {
  byFramework: Record<string, number>;
  byLanguage: Record<string, number>;
  byPackageManager: Record<string, number>;
  byBuildTool: Record<string, number>;
  cloudflareProducts: Record<string, number>;
  wrangler: {
    withWranglerConfig: number;
    withCompatibilityDate: number;
    compatibilityDateGteFirstCommit: number;
    missingCompatibilityDate: number;
  };
  testing: {
    withTests: number;
    withoutTests: number;
    testFrameworks: Record<string, number>;
  };
  ci: {
    withGitHubActions: number;
    withoutGitHubActions: number;
  };
  replicate: {
    appsUsingReplicate: number;
    totalModels: number;
    uniqueModels: string[];
  };
  hygiene: {
    withDescription: number;
    withWebsite: number;
    withReadme: number;
    withImage: number;
    withVideo: number;
  };
}

export interface AppsData {
  lastUpdated: string;
  source: string;
  totalApps: number;
  apps: App[];
  summary: Summary;
}

/**
 * Validate that an object conforms to the AppsData schema
 */
export function validateAppsData(data: unknown): data is AppsData {
  if (typeof data !== "object" || data === null) {
    throw new Error("Data must be an object");
  }

  const d = data as Record<string, unknown>;

  if (typeof d.lastUpdated !== "string") {
    throw new Error("lastUpdated must be a string");
  }

  if (typeof d.source !== "string") {
    throw new Error("source must be a string");
  }

  if (typeof d.totalApps !== "number") {
    throw new Error("totalApps must be a number");
  }

  if (!Array.isArray(d.apps)) {
    throw new Error("apps must be an array");
  }

  for (let i = 0; i < d.apps.length; i++) {
    validateApp(d.apps[i], i);
  }

  if (typeof d.summary !== "object" || d.summary === null) {
    throw new Error("summary must be an object");
  }

  validateSummary(d.summary as Record<string, unknown>);

  return true;
}

function validateApp(app: unknown, index: number): void {
  if (typeof app !== "object" || app === null) {
    throw new Error(`apps[${index}] must be an object`);
  }

  const a = app as Record<string, unknown>;
  const prefix = `apps[${index}]`;

  // Required string fields
  const requiredStrings = ["name", "slug", "description", "url", "github", "shippedDate"];
  for (const field of requiredStrings) {
    if (typeof a[field] !== "string") {
      throw new Error(`${prefix}.${field} must be a string`);
    }
  }

  // Author
  if (typeof a.author !== "object" || a.author === null) {
    throw new Error(`${prefix}.author must be an object`);
  }
  const author = a.author as Record<string, unknown>;
  if (typeof author.name !== "string" || typeof author.github !== "string" || typeof author.avatar !== "string") {
    throw new Error(`${prefix}.author must have name, github, and avatar strings`);
  }

  // Stack
  if (typeof a.stack !== "object" || a.stack === null) {
    throw new Error(`${prefix}.stack must be an object`);
  }
  const stack = a.stack as Record<string, unknown>;
  if (typeof stack.framework !== "string") {
    throw new Error(`${prefix}.stack.framework must be a string`);
  }
  if (typeof stack.language !== "string" && !Array.isArray(stack.language)) {
    throw new Error(`${prefix}.stack.language must be a string or array`);
  }

  // Dependencies
  if (typeof a.dependencies !== "object" || a.dependencies === null) {
    throw new Error(`${prefix}.dependencies must be an object`);
  }

  // Testing
  if (typeof a.testing !== "object" || a.testing === null) {
    throw new Error(`${prefix}.testing must be an object`);
  }
  const testing = a.testing as Record<string, unknown>;
  if (typeof testing.hasTests !== "boolean") {
    throw new Error(`${prefix}.testing.hasTests must be a boolean`);
  }

  // CI
  if (typeof a.ci !== "object" || a.ci === null) {
    throw new Error(`${prefix}.ci must be an object`);
  }
  const ci = a.ci as Record<string, unknown>;
  if (typeof ci.hasGitHubActions !== "boolean") {
    throw new Error(`${prefix}.ci.hasGitHubActions must be a boolean`);
  }
  if (!Array.isArray(ci.workflows)) {
    throw new Error(`${prefix}.ci.workflows must be an array`);
  }

  // Cloudflare
  if (typeof a.cloudflare !== "object" || a.cloudflare === null) {
    throw new Error(`${prefix}.cloudflare must be an object`);
  }
  const cloudflare = a.cloudflare as Record<string, unknown>;
  if (!Array.isArray(cloudflare.products)) {
    throw new Error(`${prefix}.cloudflare.products must be an array`);
  }
  if (cloudflare.hasWranglerConfig !== undefined && typeof cloudflare.hasWranglerConfig !== "boolean") {
    throw new Error(`${prefix}.cloudflare.hasWranglerConfig must be a boolean`);
  }
  if (cloudflare.compatibilityDate !== undefined && cloudflare.compatibilityDate !== null && typeof cloudflare.compatibilityDate !== "string") {
    throw new Error(`${prefix}.cloudflare.compatibilityDate must be a string or null`);
  }
  if (cloudflare.firstCommitDate !== undefined && cloudflare.firstCommitDate !== null && typeof cloudflare.firstCommitDate !== "string") {
    throw new Error(`${prefix}.cloudflare.firstCommitDate must be a string or null`);
  }
  if (
    cloudflare.compatibilityDateGteFirstCommit !== undefined &&
    cloudflare.compatibilityDateGteFirstCommit !== null &&
    typeof cloudflare.compatibilityDateGteFirstCommit !== "boolean"
  ) {
    throw new Error(`${prefix}.cloudflare.compatibilityDateGteFirstCommit must be a boolean or null`);
  }

  // Replicate
  if (typeof a.replicate !== "object" || a.replicate === null) {
    throw new Error(`${prefix}.replicate must be an object`);
  }
  const replicate = a.replicate as Record<string, unknown>;
  if (typeof replicate.usesReplicate !== "boolean") {
    throw new Error(`${prefix}.replicate.usesReplicate must be a boolean`);
  }
  if (!Array.isArray(replicate.models)) {
    throw new Error(`${prefix}.replicate.models must be an array`);
  }

  // Hygiene (optional for backwards compatibility, but validated if present)
  if (a.hygiene !== undefined) {
    if (typeof a.hygiene !== "object" || a.hygiene === null) {
      throw new Error(`${prefix}.hygiene must be an object`);
    }
    const hygiene = a.hygiene as Record<string, unknown>;
    if (typeof hygiene.hasDescription !== "boolean") {
      throw new Error(`${prefix}.hygiene.hasDescription must be a boolean`);
    }
    if (typeof hygiene.hasWebsite !== "boolean") {
      throw new Error(`${prefix}.hygiene.hasWebsite must be a boolean`);
    }
    if (typeof hygiene.hasReadme !== "boolean") {
      throw new Error(`${prefix}.hygiene.hasReadme must be a boolean`);
    }
    if (typeof hygiene.readmeHasImage !== "boolean") {
      throw new Error(`${prefix}.hygiene.readmeHasImage must be a boolean`);
    }
    if (typeof hygiene.readmeHasVideo !== "boolean") {
      throw new Error(`${prefix}.hygiene.readmeHasVideo must be a boolean`);
    }
    if (typeof hygiene.stars !== "number") {
      throw new Error(`${prefix}.hygiene.stars must be a number`);
    }
    if (typeof hygiene.forks !== "number") {
      throw new Error(`${prefix}.hygiene.forks must be a number`);
    }
  }

  // Tags
  if (!Array.isArray(a.tags)) {
    throw new Error(`${prefix}.tags must be an array`);
  }
}

function validateSummary(summary: Record<string, unknown>): void {
  const requiredRecords = ["byFramework", "byLanguage", "byPackageManager", "byBuildTool", "cloudflareProducts"];
  for (const field of requiredRecords) {
    if (typeof summary[field] !== "object" || summary[field] === null) {
      throw new Error(`summary.${field} must be an object`);
    }
  }

  if (typeof summary.wrangler !== "object" || summary.wrangler === null) {
    throw new Error("summary.wrangler must be an object");
  }
  const wrangler = summary.wrangler as Record<string, unknown>;
  const requiredWranglerNumbers = [
    "withWranglerConfig",
    "withCompatibilityDate",
    "compatibilityDateGteFirstCommit",
    "missingCompatibilityDate",
  ];
  for (const field of requiredWranglerNumbers) {
    if (typeof wrangler[field] !== "number") {
      throw new Error(`summary.wrangler.${field} must be a number`);
    }
  }

  // Testing summary
  if (typeof summary.testing !== "object" || summary.testing === null) {
    throw new Error("summary.testing must be an object");
  }
  const testing = summary.testing as Record<string, unknown>;
  if (typeof testing.withTests !== "number" || typeof testing.withoutTests !== "number") {
    throw new Error("summary.testing must have withTests and withoutTests numbers");
  }

  // CI summary
  if (typeof summary.ci !== "object" || summary.ci === null) {
    throw new Error("summary.ci must be an object");
  }
  const ci = summary.ci as Record<string, unknown>;
  if (typeof ci.withGitHubActions !== "number" || typeof ci.withoutGitHubActions !== "number") {
    throw new Error("summary.ci must have withGitHubActions and withoutGitHubActions numbers");
  }

  // Replicate summary
  if (typeof summary.replicate !== "object" || summary.replicate === null) {
    throw new Error("summary.replicate must be an object");
  }
  const replicate = summary.replicate as Record<string, unknown>;
  if (typeof replicate.appsUsingReplicate !== "number" || typeof replicate.totalModels !== "number") {
    throw new Error("summary.replicate must have appsUsingReplicate and totalModels numbers");
  }
  if (!Array.isArray(replicate.uniqueModels)) {
    throw new Error("summary.replicate.uniqueModels must be an array");
  }
}
