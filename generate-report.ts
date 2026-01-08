import { readFileSync, writeFileSync } from "fs";
import { AppsData, App, validateAppsData } from "./schema.js";

// Cloudflare product icons/emojis
const productIcons: Record<string, string> = {
  "Workers": "👷",
  "D1": "🗄️",
  "R2": "📦",
  "KV": "🔑",
  "Durable Objects": "🔒",
  "Hyperdrive": "⚡",
  "Pages": "📄",
  "Workflows": "🔄",
  "Images": "🖼️",
  "Browser Rendering": "🌐",
  "Rate Limiting": "🚦",
  "Workers AI": "🤖",
  "AutoRAG (AI Search)": "🔍",
  "Static Assets": "📁",
  "Cron Triggers": "⏰",
  "Turnstile": "🔐",
  "RealtimeKit": "📡",
  "AI Gateway": "🌉",
};

function getProductIcons(products: string[]): string {
  return products
    .map(p => productIcons[p] || "")
    .filter(Boolean)
    .join(" ");
}

function generateReport(data: AppsData): string {
  const { apps, summary } = data;

  // Sort apps by shipped date (newest first)
  const sortedApps = [...apps].sort(
    (a, b) => new Date(b.shippedDate).getTime() - new Date(a.shippedDate).getTime()
  );

  // Get all unique Cloudflare products for table headers (sorted by frequency)
  const topProducts = Object.entries(summary.cloudflareProducts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8) // Top 8 products for readability
    .map(([name]) => name);

  // Generate the report
  let report = `# Small App Garden

A curated collection of **${data.totalApps} apps** built on Cloudflare's developer platform.

| Apps | Tests | CI | Replicate |
|------|-------|-------|-----------|
| ${data.totalApps} | ${summary.testing.withTests} (${Math.round((summary.testing.withTests / data.totalApps) * 100)}%) | ${summary.ci.withGitHubActions} (${Math.round((summary.ci.withGitHubActions / data.totalApps) * 100)}%) | ${summary.replicate.appsUsingReplicate} (${Math.round((summary.replicate.appsUsingReplicate / data.totalApps) * 100)}%) |

## Apps

| App | Framework | Tests | CI | Cloudflare Products |
|-----|-----------|:-----:|:--:|---------------------|
`;

  for (const app of sortedApps) {
    const framework = typeof app.stack.framework === "string" 
      ? app.stack.framework.replace(/\s+\d+$/, "") // Remove version numbers
      : "Multiple";
    const tests = app.testing.hasTests ? "✅" : "";
    const ci = app.ci.hasGitHubActions ? "✅" : "";
    const products = getProductIcons(app.cloudflare.products);
    const appLink = `[${app.name}](${app.github})`;
    
    report += `| ${appLink} | ${framework} | ${tests} | ${ci} | ${products} |\n`;
  }

  // Legend for icons
  report += `
### Icon Legend

| Icon | Product |
|:----:|---------|
`;

  for (const product of topProducts) {
    const icon = productIcons[product] || "•";
    report += `| ${icon} | ${product} |\n`;
  }

  // Cloudflare Products breakdown
  report += `
## Cloudflare Products

| Product | Count |
|---------|:-----:|
`;

  const sortedProducts = Object.entries(summary.cloudflareProducts).sort((a, b) => b[1] - a[1]);
  for (const [product, count] of sortedProducts) {
    const icon = productIcons[product] || "";
    report += `| ${icon} ${product} | ${count} |\n`;
  }

  // Replicate section
  if (summary.replicate.appsUsingReplicate > 0) {
    report += `
## Replicate Models

| App | Models |
|-----|--------|
`;

    const replicateApps = apps.filter((app) => app.replicate.usesReplicate);
    for (const app of replicateApps) {
      const models = app.replicate.models.length > 0 
        ? app.replicate.models.map((m) => `\`${m}\``).join(", ")
        : "-";
      report += `| [${app.name}](${app.github}) | ${models} |\n`;
    }
  }

  // Frameworks
  report += `
## Frameworks

| Framework | Count |
|-----------|:-----:|
`;

  const sortedFrameworks = Object.entries(summary.byFramework).sort((a, b) => b[1] - a[1]);
  for (const [framework, count] of sortedFrameworks) {
    report += `| ${framework} | ${count} |\n`;
  }

  // Build tools & Package managers (combined)
  report += `
## Build Tools & Package Managers

| Build Tool | Count | | Package Manager | Count |
|------------|:-----:|-|-----------------|:-----:|
`;

  const sortedBuildTools = Object.entries(summary.byBuildTool).sort((a, b) => b[1] - a[1]);
  const sortedPackageManagers = Object.entries(summary.byPackageManager).sort((a, b) => b[1] - a[1]);
  const maxRows = Math.max(sortedBuildTools.length, sortedPackageManagers.length);
  
  for (let i = 0; i < maxRows; i++) {
    const bt = sortedBuildTools[i] || ["", ""];
    const pm = sortedPackageManagers[i] || ["", ""];
    report += `| ${bt[0]} | ${bt[1] || ""} | | ${pm[0]} | ${pm[1] || ""} |\n`;
  }

  // Contributors
  report += `
## Contributors

`;

  const authorCounts = new Map<string, { name: string; github: string; count: number }>();
  for (const app of apps) {
    const existing = authorCounts.get(app.author.github);
    if (existing) {
      existing.count++;
    } else {
      authorCounts.set(app.author.github, {
        name: app.author.name,
        github: app.author.github,
        count: 1,
      });
    }
  }

  const sortedAuthors = [...authorCounts.values()].sort((a, b) => b.count - a.count);

  report += `| Author | Apps |
|--------|:----:|
`;

  for (const author of sortedAuthors) {
    report += `| [${author.github}](https://github.com/${author.github}) | ${author.count} |\n`;
  }

  // Repository Hygiene section
  if (summary.hygiene) {
    const total = data.totalApps;
    const { withDescription, withWebsite, withReadme, withImage, withVideo } = summary.hygiene;

    report += `
## Repository Hygiene

| Metric | Count | % |
|--------|:-----:|:-:|
| Has description | ${withDescription} | ${Math.round((withDescription / total) * 100)}% |
| Has website | ${withWebsite} | ${Math.round((withWebsite / total) * 100)}% |
| Has README | ${withReadme} | ${Math.round((withReadme / total) * 100)}% |
| README has image | ${withImage} | ${Math.round((withImage / total) * 100)}% |
| README has video/gif | ${withVideo} | ${Math.round((withVideo / total) * 100)}% |

### Per-App Hygiene

| App | Desc | Web | README | Image | Video | Stars |
|-----|:----:|:---:|:------:|:-----:|:-----:|------:|
`;

    for (const app of sortedApps) {
      if (app.hygiene) {
        const desc = app.hygiene.hasDescription ? "✅" : "";
        const web = app.hygiene.hasWebsite ? "✅" : "";
        const readme = app.hygiene.hasReadme ? "✅" : "";
        const image = app.hygiene.readmeHasImage ? "✅" : "";
        const video = app.hygiene.readmeHasVideo ? "✅" : "";
        const stars = app.hygiene.stars || 0;
        const appLink = `[${app.name}](${app.github})`;
        
        report += `| ${appLink} | ${desc} | ${web} | ${readme} | ${image} | ${video} | ${stars} |\n`;
      }
    }
  }

  // Products missing from Garden - opportunities section
  const productsInGarden = new Set(Object.keys(summary.cloudflareProducts));
  
  const allCloudflareProducts: Array<{ name: string; description: string; ideas: string }> = [
    { name: "Queues", description: "Message queues without egress fees", ideas: "Background job processor, webhook relay" },
    { name: "Vectorize", description: "Vector database for AI/ML", ideas: "Semantic search, RAG chatbot" },
    { name: "Stream", description: "Video storage/encoding/delivery", ideas: "Video hosting, live streaming" },
    { name: "Pipelines", description: "Real-time data ingestion to R2", ideas: "Analytics collector, log aggregator" },
    { name: "Email Routing", description: "Create/manage email addresses", ideas: "Contact form handler" },
    { name: "Turnstile", description: "CAPTCHA alternative", ideas: "Bot protection demo" },
    { name: "Browser Rendering", description: "Headless browser control", ideas: "Screenshot service, PDF generator" },
    { name: "Containers", description: "Serverless containers", ideas: "Long-running jobs, legacy app migration" },
    { name: "Agents", description: "AI agents with persistence", ideas: "AI assistant with memory" },
    { name: "AI Search", description: "Managed RAG pipelines", ideas: "Documentation Q&A" },
    { name: "Waiting Room", description: "Traffic queue management", ideas: "Event ticket sales, product launch" },
    { name: "Web Analytics", description: "Privacy-first analytics", ideas: "Analytics dashboard" },
    { name: "Zaraz", description: "Third-party tool manager", ideas: "Tag management demo" },
    { name: "Load Balancing", description: "Traffic distribution", ideas: "Multi-region app demo" },
    { name: "Pub/Sub", description: "Real-time messaging", ideas: "Chat app, notifications" },
  ];

  const missingProducts = allCloudflareProducts.filter(p => !productsInGarden.has(p.name));

  if (missingProducts.length > 0) {
    report += `
## Opportunities

Cloudflare products not yet represented in the Garden:

| Product | Description | App Ideas |
|---------|-------------|-----------|
`;

    for (const product of missingProducts) {
      report += `| [${product.name}](https://developers.cloudflare.com/${product.name.toLowerCase().replace(/\s+/g, "-")}) | ${product.description} | ${product.ideas} |\n`;
    }
  }

  report += `
---

**Source:** [developers.cloudflare.com/garden](${data.source}) | **Updated:** ${data.lastUpdated} | **Data:** [apps.json](./apps.json)
`;

  return report;
}

// Main execution
const rawData = JSON.parse(readFileSync("apps.json", "utf-8"));

// Validate the data against the schema
validateAppsData(rawData);
const data = rawData as AppsData;

const report = generateReport(data);
writeFileSync("README.md", report);
console.log("README.md generated successfully!");
