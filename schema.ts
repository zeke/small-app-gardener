/**
 * Schema definitions for Small App Garden data
 */

export const CLOUDFLARE_PRODUCT_CATALOG = [
  { name: "1.1.1.1", slug: "1.1.1.1", description: "Fast DNS resolver for private browsing", ideas: "DNS lookup demo, privacy status page" },
  { name: "Agents", slug: "agents", description: "AI agents with persistence", ideas: "AI assistant with memory" },
  { name: "AI Crawl Control", slug: "ai-crawl-control", description: "Manage third-party AI crawlers", ideas: "crawler dashboard, allowlist manager" },
  { name: "AI Gateway", slug: "ai-gateway", description: "Monitor and control AI requests", ideas: "prompt analytics, usage guardrails" },
  { name: "AI Search", slug: "ai-search", description: "Managed RAG pipelines", ideas: "Documentation Q&A" },
  { name: "Analytics", slug: "analytics", description: "Traffic and security analytics", ideas: "analytics dashboard, trend report" },
  { name: "API", slug: "api", description: "Manage Cloudflare resources via API", ideas: "automation scripts, admin tools" },
  { name: "API Shield", slug: "api-shield", description: "Protect APIs with discovery and schema", ideas: "API posture report, schema audit" },
  { name: "Argo Smart Routing", slug: "argo-smart-routing", description: "Faster routing across the network", ideas: "latency optimizer, global failover" },
  { name: "Automatic Platform Optimization", slug: "automatic-platform-optimization", description: "Speed up WordPress sites", ideas: "performance comparison, caching demo" },
  { name: "Billing", slug: "billing", description: "Account billing and subscriptions", ideas: "billing dashboard, cost alerts" },
  { name: "Bots", slug: "bots", description: "Detect and manage bot traffic", ideas: "bot analytics, rule tuning" },
  { name: "Browser Rendering", slug: "browser-rendering", description: "Headless browser control", ideas: "screenshot service, PDF generator" },
  { name: "BYOIP", slug: "byoip", description: "Use your own IP addresses", ideas: "enterprise onboarding guide, IP migration plan" },
  { name: "Cache", slug: "cache", description: "Cache and serve content globally", ideas: "cache tuning dashboard, purge tool" },
  { name: "China Network", slug: "china-network", description: "Serve traffic in China", ideas: "latency checker, route planner" },
  { name: "Cloudflare Challenges", slug: "cloudflare-challenges", description: "Challenge suspicious visitors", ideas: "challenge config demo, abuse test" },
  { name: "Cloudflare for Platforms", slug: "cloudflare-for-platforms", description: "Multi-tenant platform tooling", ideas: "SaaS onboarding, tenant dashboard" },
  { name: "Cloudflare One", slug: "cloudflare-one", description: "Zero Trust network security", ideas: "policy explorer, device posture demo" },
  { name: "Containers", slug: "containers", description: "Serverless containers", ideas: "long-running jobs, legacy app migration" },
  { name: "D1", slug: "d1", description: "Serverless SQL databases", ideas: "todo app, analytics store" },
  { name: "Data Localization Suite", slug: "data-localization", description: "Control data residency", ideas: "region policy viewer, compliance dashboard" },
  { name: "DDoS Protection", slug: "ddos-protection", description: "Automatic DDoS mitigation", ideas: "attack report, traffic spikes view" },
  { name: "DMARC Management", slug: "dmarc-management", description: "Email authentication reporting", ideas: "DMARC report viewer, domain setup guide" },
  { name: "DNS", slug: "dns", description: "Authoritative DNS management", ideas: "zone editor, DNS health check" },
  { name: "Durable Objects", slug: "durable-objects", description: "Stateful storage for Workers", ideas: "collab app, session store" },
  { name: "Email Routing", slug: "email-routing", description: "Route emails to destinations", ideas: "contact form, inbound webhook" },
  { name: "Cloudflare Fundamentals", slug: "fundamentals", description: "Platform concepts and guides", ideas: "learning hub, reference links" },
  { name: "Google tag gateway for advertisers", slug: "google-tag-gateway", description: "Proxy GTM tags for privacy", ideas: "tag audit tool, consent demo" },
  { name: "Health Checks", slug: "health-checks", description: "Monitor origin health", ideas: "uptime dashboard, failover alerts" },
  { name: "Hyperdrive", slug: "hyperdrive", description: "Database connection pooling", ideas: "latency tester, DB caching demo" },
  { name: "Cloudflare Images", slug: "images", description: "Image storage and transforms", ideas: "image optimization, gallery" },
  { name: "Key Transparency Auditor", slug: "key-transparency", description: "Audit key transparency logs", ideas: "audit report, key monitor" },
  { name: "KV", slug: "kv", description: "Global key-value store", ideas: "feature flags, config store" },
  { name: "Learning Paths", slug: "learning-paths", description: "Guided tutorials and modules", ideas: "course tracker, learning checklist" },
  { name: "Load Balancing", slug: "load-balancing", description: "Distribute traffic across origins", ideas: "multi-region demo, failover monitor" },
  { name: "Log Explorer", slug: "log-explorer", description: "Query logs in the dashboard", ideas: "log search UI, alert builder" },
  { name: "Logs", slug: "logs", description: "Access request logs", ideas: "log archive, usage stats" },
  { name: "Magic Cloud Networking", slug: "magic-cloud-networking", description: "Discover cloud network resources", ideas: "inventory map, topology view" },
  { name: "Magic Firewall", slug: "magic-firewall", description: "Network-layer firewall controls", ideas: "rule builder, threat map" },
  { name: "Magic Network Monitoring", slug: "magic-network-monitoring", description: "Network flow visibility", ideas: "flow dashboard, anomaly report" },
  { name: "Magic Transit", slug: "magic-transit", description: "Protect on-prem network traffic", ideas: "traffic protection overview, onboarding guide" },
  { name: "Magic WAN", slug: "magic-wan", description: "Managed wide area networking", ideas: "site status board, routing policy" },
  { name: "MoQ", slug: "moq", description: "Media over QUIC protocol", ideas: "streaming demo, transport tester" },
  { name: "Network", slug: "network", description: "Network settings for zones", ideas: "config checklist, settings audit" },
  { name: "Network Error Logging", slug: "network-error-logging", description: "Collect network error reports", ideas: "error dashboard, client report" },
  { name: "Network Interconnect", slug: "network-interconnect", description: "Private network interconnect", ideas: "capacity planner, link status" },
  { name: "Notifications", slug: "notifications", description: "Alerting and notifications", ideas: "alert config UI, notification hub" },
  { name: "Page Shield", slug: "page-shield", description: "Client-side security monitoring", ideas: "script inventory, attack alerts" },
  { name: "Pages", slug: "pages", description: "Static and full-stack hosting", ideas: "portfolio site, preview builds" },
  { name: "Pipelines", slug: "pipelines", description: "Stream data into R2", ideas: "log ingestion, event pipeline" },
  { name: "Privacy Gateway", slug: "privacy-gateway", description: "Oblivious HTTP gateway", ideas: "privacy proxy demo, OHTTP test" },
  { name: "Pulumi", slug: "pulumi", description: "Infrastructure as code for Cloudflare", ideas: "IaC templates, resource sync" },
  { name: "Queues", slug: "queues", description: "Message queues without egress fees", ideas: "background job processor, webhook relay" },
  { name: "R2", slug: "r2", description: "Object storage without egress fees", ideas: "file uploader, media library" },
  { name: "Radar", slug: "radar", description: "Internet trends and insights", ideas: "trend dashboard, country report" },
  { name: "Randomness Beacon", slug: "randomness-beacon", description: "Public randomness service", ideas: "lottery demo, entropy tester" },
  { name: "Realtime", slug: "realtime", description: "RealtimeKit, SFU and TURN", ideas: "chat app, live collaboration" },
  { name: "Reference Architecture", slug: "reference-architecture", description: "Architecture diagrams and guides", ideas: "design library, blueprint gallery" },
  { name: "Registrar", slug: "registrar", description: "Domain registration", ideas: "domain search, renewal tracker" },
  { name: "Rules", slug: "rules", description: "Request and response rules", ideas: "rules builder, policy demo" },
  { name: "Ruleset Engine", slug: "ruleset-engine", description: "Manage rulesets via API", ideas: "ruleset editor, deployment audit" },
  { name: "Sandbox SDK", slug: "sandbox", description: "Isolated code execution", ideas: "code runner, safe eval" },
  { name: "Secrets Store", slug: "secrets-store", description: "Managed secrets storage", ideas: "secret rotation UI, env sync" },
  { name: "Security Center", slug: "security-center", description: "Security posture overview", ideas: "risk dashboard, alerts" },
  { name: "Smart Shield", slug: "smart-shield", description: "Guided security setup", ideas: "setup wizard, rule recommendations" },
  { name: "Spectrum", slug: "spectrum", description: "TCP/UDP proxy", ideas: "game server proxy, MQTT relay" },
  { name: "Speed", slug: "speed", description: "Performance insights", ideas: "performance report, optimization tips" },
  { name: "SSL/TLS", slug: "ssl", description: "TLS configuration and certificates", ideas: "cert status, cipher audit" },
  { name: "Stream", slug: "stream", description: "Video storage and delivery", ideas: "video hosting, live streaming" },
  { name: "Support", slug: "support", description: "Support resources and docs", ideas: "support portal, ticket helper" },
  { name: "Tenant", slug: "tenant", description: "Manage multiple accounts", ideas: "tenant dashboard, provisioning tool" },
  { name: "Terraform", slug: "terraform", description: "Cloudflare Terraform provider", ideas: "module catalog, infra sync" },
  { name: "Time Services", slug: "time-services", description: "NTP, NTS, and Roughtime", ideas: "time sync monitor, latency test" },
  { name: "Turnstile", slug: "turnstile", description: "CAPTCHA alternative", ideas: "bot protection demo" },
  { name: "Vectorize", slug: "vectorize", description: "Vector database for AI/ML", ideas: "semantic search, RAG chatbot" },
  { name: "Version Management", slug: "version-management", description: "Config versioning and staging", ideas: "rollback manager, staging preview" },
  { name: "WAF", slug: "waf", description: "Web application firewall", ideas: "rule dashboard, threat alerts" },
  { name: "Waiting Room", slug: "waiting-room", description: "Traffic queue management", ideas: "event ticket sales, product launch" },
  { name: "WARP Client", slug: "warp-client", description: "Secure client for Zero Trust", ideas: "client onboarding, status dashboard" },
  { name: "Cloudflare Web Analytics", slug: "web-analytics", description: "Privacy-first analytics", ideas: "analytics dashboard" },
  { name: "Web3", slug: "web3", description: "Web3 gateway and tooling", ideas: "IPFS gateway demo, blockchain explorer" },
  { name: "Workers", slug: "workers", description: "Serverless compute at the edge", ideas: "API backend, image proxy" },
  { name: "Workers AI", slug: "workers-ai", description: "Run AI models on Workers", ideas: "text generation demo, embeddings API" },
  { name: "Workers VPC", slug: "workers-vpc", description: "Private network for Workers", ideas: "private service access, hybrid app" },
  { name: "Workflows", slug: "workflows", description: "Durable multi-step workflows", ideas: "order processing, async jobs" },
  { name: "Zaraz", slug: "zaraz", description: "Third-party tool manager", ideas: "tag management demo" },
];

export interface CloudflareProduct {
  name: string;
  slug: string;
  description?: string;
  ideas?: string;
}

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
  hasAgentsMd: boolean;
  readmeHasImage: boolean;
  readmeHasVideo: boolean;
  license: string | null;
  stars: number;
  forks: number;
}

export interface ScoreBreakdownItem {
  id: string;
  label: string;
  points: number;
  earned: boolean;
}

export interface Scores {
  popularity: number;
  quality: number;
  qualityBreakdown: ScoreBreakdownItem[];
}

export interface ScoreSummary {
  popularity: {
    forkWeight: number;
    starWeight: number;
  };
  quality: {
    maxPoints: number;
  };
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
  scores?: Scores;
  tags: string[];
}

export interface Summary {
  byFramework: Record<string, number>;
  byLanguage: Record<string, number>;
  byPackageManager: Record<string, number>;
  byBuildTool: Record<string, number>;
  cloudflareProducts: Record<string, number>;
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
    withAgentsMd: number;
    withImage: number;
    withVideo: number;
  };
  scores: ScoreSummary;
}

export interface AppsData {
  lastUpdated: string;
  source: string;
  totalApps: number;
  apps: App[];
  summary: Summary;
  cloudflareCatalog: CloudflareProduct[];
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

  if (!Array.isArray(d.cloudflareCatalog)) {
    throw new Error("cloudflareCatalog must be an array");
  }

  for (let i = 0; i < d.cloudflareCatalog.length; i++) {
    validateCloudflareProduct(d.cloudflareCatalog[i], i);
  }

  return true;
}

function validateCloudflareProduct(product: unknown, index: number): void {
  if (typeof product !== "object" || product === null) {
    throw new Error(`cloudflareCatalog[${index}] must be an object`);
  }

  const p = product as Record<string, unknown>;
  if (typeof p.name !== "string") {
    throw new Error(`cloudflareCatalog[${index}].name must be a string`);
  }
  if (typeof p.slug !== "string") {
    throw new Error(`cloudflareCatalog[${index}].slug must be a string`);
  }
  if (p.description !== undefined && typeof p.description !== "string") {
    throw new Error(`cloudflareCatalog[${index}].description must be a string`);
  }
  if (p.ideas !== undefined && typeof p.ideas !== "string") {
    throw new Error(`cloudflareCatalog[${index}].ideas must be a string`);
  }
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
    if (typeof hygiene.hasAgentsMd !== "boolean") {
      throw new Error(`${prefix}.hygiene.hasAgentsMd must be a boolean`);
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

  // Scores
  if (a.scores !== undefined) {
    if (typeof a.scores !== "object" || a.scores === null) {
      throw new Error(`${prefix}.scores must be an object`);
    }
    const scores = a.scores as Record<string, unknown>;
    if (typeof scores.popularity !== "number") {
      throw new Error(`${prefix}.scores.popularity must be a number`);
    }
    if (typeof scores.quality !== "number") {
      throw new Error(`${prefix}.scores.quality must be a number`);
    }
    if (!Array.isArray(scores.qualityBreakdown)) {
      throw new Error(`${prefix}.scores.qualityBreakdown must be an array`);
    }
    for (const [scoreIndex, item] of scores.qualityBreakdown.entries()) {
      if (typeof item !== "object" || item === null) {
        throw new Error(`${prefix}.scores.qualityBreakdown[${scoreIndex}] must be an object`);
      }
      const breakdown = item as Record<string, unknown>;
      if (typeof breakdown.id !== "string") {
        throw new Error(`${prefix}.scores.qualityBreakdown[${scoreIndex}].id must be a string`);
      }
      if (typeof breakdown.label !== "string") {
        throw new Error(`${prefix}.scores.qualityBreakdown[${scoreIndex}].label must be a string`);
      }
      if (typeof breakdown.points !== "number") {
        throw new Error(`${prefix}.scores.qualityBreakdown[${scoreIndex}].points must be a number`);
      }
      if (typeof breakdown.earned !== "boolean") {
        throw new Error(`${prefix}.scores.qualityBreakdown[${scoreIndex}].earned must be a boolean`);
      }
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

  if (typeof summary.scores !== "object" || summary.scores === null) {
    throw new Error("summary.scores must be an object");
  }
  const scores = summary.scores as Record<string, unknown>;
  if (typeof scores.popularity !== "object" || scores.popularity === null) {
    throw new Error("summary.scores.popularity must be an object");
  }
  const popularity = scores.popularity as Record<string, unknown>;
  if (typeof popularity.forkWeight !== "number" || typeof popularity.starWeight !== "number") {
    throw new Error("summary.scores.popularity must have forkWeight and starWeight numbers");
  }
  if (typeof scores.quality !== "object" || scores.quality === null) {
    throw new Error("summary.scores.quality must be an object");
  }
  const quality = scores.quality as Record<string, unknown>;
  if (typeof quality.maxPoints !== "number") {
    throw new Error("summary.scores.quality.maxPoints must be a number");
  }
}
