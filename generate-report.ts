import { readFileSync, writeFileSync } from "fs";
import { AppsData, validateAppsData } from "./schema.js";

function generateReport(data: AppsData): string {
  const { apps, summary } = data;

  // Sort apps by shipped date (newest first)
  const sortedApps = [...apps].sort(
    (a, b) => new Date(b.shippedDate).getTime() - new Date(a.shippedDate).getTime()
  );

  // Generate the report
  let report = `# Small App Garden

> A curated collection of ${data.totalApps} small applications built on Cloudflare's developer platform.

**Source:** [${data.source}](${data.source})  
**Last Updated:** ${data.lastUpdated}

## Overview

The Small App Garden showcases what's possible with Cloudflare's developer platform. These apps demonstrate real-world usage of Workers, Durable Objects, D1, R2, and other Cloudflare products.

### Quick Stats

| Metric | Value |
|--------|-------|
| Total Apps | ${data.totalApps} |
| Apps with Tests | ${summary.testing.withTests} (${Math.round((summary.testing.withTests / data.totalApps) * 100)}%) |
| Apps with CI/CD | ${summary.ci.withGitHubActions} (${Math.round((summary.ci.withGitHubActions / data.totalApps) * 100)}%) |
| Apps using Replicate | ${summary.replicate.appsUsingReplicate} (${Math.round((summary.replicate.appsUsingReplicate / data.totalApps) * 100)}%) |

## Apps

`;

  // Add each app
  for (const app of sortedApps) {
    const framework = typeof app.stack.framework === "string" ? app.stack.framework : "Multiple";
    const language = Array.isArray(app.stack.language)
      ? app.stack.language.join(", ")
      : app.stack.language;

    report += `### ${app.name}

${app.description}

| | |
|---|---|
| **URL** | [${app.url}](${app.url}) |
| **GitHub** | [${app.github}](${app.github}) |
| **Author** | [${app.author.name}](https://github.com/${app.author.github}) |
| **Shipped** | ${app.shippedDate} |
| **Framework** | ${framework} |
| **Language** | ${language} |

**Cloudflare Products:** ${app.cloudflare.products.join(", ")}

`;

    if (app.replicate.usesReplicate && app.replicate.models.length > 0) {
      report += `**Replicate Models:** ${app.replicate.models.map((m) => `\`${m}\``).join(", ")}

`;
    }

    if (app.testing.hasTests) {
      const testFramework =
        typeof app.testing.framework === "string"
          ? app.testing.framework
          : app.testing.framework
            ? Object.values(app.testing.framework).join(", ")
            : "unknown";
      report += `**Tests:** Yes (${testFramework})

`;
    }

    if (app.ci.hasGitHubActions) {
      report += `**CI/CD:** GitHub Actions (${app.ci.workflows.join(", ")})

`;
    }

    report += `---

`;
  }

  // Cloudflare Products section
  report += `## Cloudflare Products Usage

| Product | Apps Using |
|---------|------------|
`;

  const sortedProducts = Object.entries(summary.cloudflareProducts).sort((a, b) => b[1] - a[1]);

  for (const [product, count] of sortedProducts) {
    const percentage = Math.round((count / data.totalApps) * 100);
    const bar = "█".repeat(Math.round(percentage / 5)) + "░".repeat(20 - Math.round(percentage / 5));
    report += `| ${product} | ${count} (${percentage}%) ${bar} |\n`;
  }

  // Frameworks section
  report += `
## Frameworks

| Framework | Count |
|-----------|-------|
`;

  const sortedFrameworks = Object.entries(summary.byFramework).sort((a, b) => b[1] - a[1]);

  for (const [framework, count] of sortedFrameworks) {
    report += `| ${framework} | ${count} |\n`;
  }

  // Replicate section
  report += `
## Replicate Integration

${summary.replicate.appsUsingReplicate} apps (${Math.round((summary.replicate.appsUsingReplicate / data.totalApps) * 100)}%) integrate with [Replicate](https://replicate.com/) for AI/ML capabilities.

### Apps Using Replicate

`;

  const replicateApps = apps.filter((app) => app.replicate.usesReplicate);
  for (const app of replicateApps) {
    report += `- **${app.name}** - ${app.replicate.models.map((m) => `\`${m}\``).join(", ")}
`;
  }

  report += `
### Unique Models Used (${summary.replicate.uniqueModels.length})

| Model | Provider |
|-------|----------|
`;

  for (const model of summary.replicate.uniqueModels) {
    const [provider] = model.split("/");
    report += `| \`${model}\` | ${provider} |\n`;
  }

  // Testing section
  report += `
## Testing & CI/CD

### Test Coverage

| Status | Count |
|--------|-------|
| With Tests | ${summary.testing.withTests} |
| Without Tests | ${summary.testing.withoutTests} |

### Test Frameworks

| Framework | Count |
|-----------|-------|
`;

  for (const [framework, count] of Object.entries(summary.testing.testFrameworks)) {
    report += `| ${framework} | ${count} |\n`;
  }

  report += `
### CI/CD

| Status | Count |
|--------|-------|
| With GitHub Actions | ${summary.ci.withGitHubActions} |
| Without GitHub Actions | ${summary.ci.withoutGitHubActions} |

## Build Tools & Package Managers

### Build Tools

| Tool | Count |
|------|-------|
`;

  const sortedBuildTools = Object.entries(summary.byBuildTool).sort((a, b) => b[1] - a[1]);
  for (const [tool, count] of sortedBuildTools) {
    report += `| ${tool} | ${count} |\n`;
  }

  report += `
### Package Managers

| Manager | Count |
|---------|-------|
`;

  const sortedPackageManagers = Object.entries(summary.byPackageManager).sort((a, b) => b[1] - a[1]);
  for (const [manager, count] of sortedPackageManagers) {
    report += `| ${manager} | ${count} |\n`;
  }

  // Authors section
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
|--------|------|
`;

  for (const author of sortedAuthors) {
    report += `| [${author.name}](https://github.com/${author.github}) | ${author.count} |\n`;
  }

  report += `
---

*Generated from [apps.json](./apps.json)*
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
