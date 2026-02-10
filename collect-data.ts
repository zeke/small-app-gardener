#!/usr/bin/env npx tsx

/**
 * Data collection script for Small App Garden
 *
 * This script scrapes the Cloudflare Small App Garden and analyzes each
 * GitHub repository by cloning it temporarily to extract metadata.
 *
 * Usage: npx tsx collect-data.ts
 *        npx tsx collect-data.ts --check-apps
 */

import { writeFileSync, existsSync, rmSync, readdirSync, statSync, readFileSync as fsReadFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { tmpdir } from "os";
import { CLOUDFLARE_PRODUCT_CATALOG, type App } from "./schema";
import {
  buildQualityBreakdown,
  calculatePopularityScore,
  calculateQualityScore,
  getPopularityMax,
  getQualityMaxPoints,
} from "./website/src/lib/scores";

const GARDEN_URL = "https://developers.cloudflare.com/garden/";

type CloudflarePackageRule = {
  match?: string;
  prefix?: string;
  products: string[];
};

const CLOUDFLARE_PACKAGE_PRODUCT_RULES: CloudflarePackageRule[] = [
  { match: "agents", products: ["Agents"] },
  { match: "hono-agents", products: ["Agents"] },
  { match: "@cloudflare/agents", products: ["Agents"] },
  { match: "@cloudflare/ai", products: ["Workers AI"] },
  { match: "@cloudflare/ai-gateway", products: ["AI Gateway"] },
  { match: "@cloudflare/ai-search", products: ["AI Search"] },
  { match: "@cloudflare/d1", products: ["D1"] },
  { match: "@cloudflare/kv-asset-handler", products: ["KV"] },
  { match: "@cloudflare/queues", products: ["Queues"] },
  { match: "@cloudflare/r2", products: ["R2"] },
  { match: "@cloudflare/stream", products: ["Stream"] },
  { match: "@cloudflare/turnstile", products: ["Turnstile"] },
  { match: "@cloudflare/workers-types", products: ["Workers"] },
  { match: "wrangler", products: ["Workers"] },
  { prefix: "@cloudflare/pages", products: ["Pages"] },
];

interface Author {
  name: string;
  github: string;
  avatar: string;
}

interface AppBasicInfo {
  name: string;
  slug: string;
  description: string;
  url: string;
  github: string;
  author: Author;
  shippedDate: string;
  youtubeVideo?: string;
  tags: string[];
}

interface RepoHygiene {
  hasDescription: boolean;
  description: string | null;
  hasWebsite: boolean;
  websiteUrl: string | null;
  hasReadme: boolean;
  readmePath: string | null;
  hasAgentsMd: boolean;
  agentsMdPath: string | null;
  readmeHasImage: boolean;
  readmeHasVideo: boolean;
  license: string | null;
  licensePath: string | null;
  stars: number;
  forks: number;
}

interface RepoAnalysis {
  framework: string;
  language: string | string[];
  buildTool: string;
  packageManager: string;
  uiLibrary: string | null;
  orm?: string;
  auth?: string;
  monorepo?: boolean;
  dependencies: {
    runtime: Record<string, string>;
    dev: Record<string, string>;
  };
  testing: {
    hasTests: boolean;
    framework: string | null;
    testFiles: string[];
  };
  ci: {
    hasGitHubActions: boolean;
    workflows: string[];
  };
  cloudflare: {
    products: string[];
    bindings: Record<string, unknown>;
  };
  replicate: {
    usesReplicate: boolean;
    models: string[];
    apiIntegration: string | null;
  };
  hygiene: RepoHygiene;
  scores?: {
    popularity: number;
    quality: number;
    qualityBreakdown: ReturnType<typeof buildQualityBreakdown>;
  };
}

// Helper to fetch text content
async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "small-app-gardener",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }

  return response.text();
}

// Fetch the garden page and extract app slugs
async function fetchGardenSlugs(): Promise<string[]> {
  console.log("Fetching garden page...");
  const html = await fetchText(GARDEN_URL);

  // Extract app cards from the HTML
  // Look for links to /garden/{slug} pages
  const appLinkRegex = /href="\/garden\/([^"\/]+)"/g;
  const slugs = new Set<string>();

  let match;
  while ((match = appLinkRegex.exec(html)) !== null) {
    const slug = match[1];
    if (slug && !slug.startsWith("?") && slug !== "images") {
      slugs.add(slug);
    }
  }

  console.log(`Found ${slugs.size} app slugs`);
  return [...slugs];
}

async function fetchGardenApps(): Promise<AppBasicInfo[]> {
  const slugs = await fetchGardenSlugs();
  const apps: AppBasicInfo[] = [];

  // Fetch each app's detail page
  for (const slug of slugs) {
    try {
      const appInfo = await fetchAppDetails(slug);
      if (appInfo) {
        apps.push(appInfo);
      }
    } catch (error) {
      console.error(`Error fetching ${slug}:`, error);
    }
  }

  return apps;
}

function loadExistingAppSlugs(): string[] {
  if (!existsSync("apps.json")) {
    console.log("apps.json not found; skipping comparison.");
    return [];
  }

  const content = fsReadFileSync("apps.json", "utf-8");
  const data = JSON.parse(content) as { apps?: Array<{ slug?: string }> };
  return (data.apps || []).map((app) => app.slug).filter((slug): slug is string => !!slug);
}

async function checkForAppChanges(): Promise<void> {
  console.log("=== App Change Check ===\n");
  const currentSlugs = await fetchGardenSlugs();
  const existingSlugs = loadExistingAppSlugs();

  if (existingSlugs.length === 0) {
    console.log("No existing apps to compare against.");
    return;
  }

  const currentSet = new Set(currentSlugs);
  const existingSet = new Set(existingSlugs);

  const added = currentSlugs.filter((slug) => !existingSet.has(slug));
  const removed = existingSlugs.filter((slug) => !currentSet.has(slug));

  console.log(`Garden apps: ${currentSlugs.length}`);
  console.log(`Existing apps: ${existingSlugs.length}`);

  if (added.length === 0 && removed.length === 0) {
    console.log("No new or removed apps found.");
    return;
  }

  if (added.length > 0) {
    console.log(`New apps: ${added.join(", ")}`);
  }

  if (removed.length > 0) {
    console.log(`Removed apps: ${removed.join(", ")}`);
  }
}

async function fetchAppDetails(slug: string): Promise<AppBasicInfo | null> {
  console.log(`  Fetching details for ${slug}...`);
  const url = `${GARDEN_URL}${slug}`;
  const html = await fetchText(url);

  // Extract app name from <h1> or <title>
  const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/<title>([^|<]+)/i);
  const name = nameMatch ? nameMatch[1].trim().replace(" | Small App Garden", "") : slug;

  // Extract GitHub URL - look for repo URLs (owner/repo pattern), not just profile URLs
  const githubMatches = html.matchAll(/href="(https:\/\/github\.com\/[^"]+)"/g);
  let github = "";
  for (const match of githubMatches) {
    const ghUrl = match[1];
    // Check if it's a repo URL (has owner/repo pattern, not just owner)
    const repoMatch = ghUrl.match(/github\.com\/([^\/]+)\/([^\/\?"#]+)/);
    if (repoMatch) {
      github = `https://github.com/${repoMatch[1]}/${repoMatch[2]}`;
      break;
    }
  }

  if (!github) {
    console.log(`    No GitHub repo URL found for ${slug}, skipping`);
    return null;
  }

  // Extract project URL (View Project link)
  const urlMatches = html.match(/href="(https?:\/\/[^"]+workers\.dev[^"]*)"/g) ||
    html.match(/href="(https?:\/\/[^"]+\.com[^"]*)"/g);

  let projectUrl = "";
  if (urlMatches) {
    for (const m of urlMatches) {
      const extracted = m.match(/href="([^"]+)"/)?.[1];
      if (extracted && !extracted.includes("github.com") && !extracted.includes("youtube.com") && !extracted.includes("cloudflare.com")) {
        projectUrl = extracted;
        break;
      }
    }
  }

  // Extract author from GitHub URL
  const authorMatch = github.match(/github\.com\/([^\/]+)/);
  const authorGithub = authorMatch ? authorMatch[1] : "";

  // Extract description - look for meta description or first paragraph
  const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i) ||
    html.match(/<p[^>]*>([^<]{20,200})<\/p>/);
  const description = descMatch ? descMatch[1].trim() : "";

  // Extract shipped date
  const dateMatch = html.match(/Shipped\s+([A-Za-z]+\s+\d+,?\s*\d*|\d+\s+days?\s+ago|\d+\s+hours?\s+ago)/i);
  let shippedDate = "";
  if (dateMatch) {
    const dateStr = dateMatch[1];
    if (dateStr.includes("ago")) {
      // Convert relative date to absolute
      const now = new Date();
      if (dateStr.includes("day")) {
        const days = parseInt(dateStr) || 1;
        now.setDate(now.getDate() - days);
      } else if (dateStr.includes("hour")) {
        // Today
      }
      shippedDate = now.toISOString().split("T")[0];
    } else {
      // Parse absolute date like "Nov 24, 2025"
      try {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          shippedDate = parsed.toISOString().split("T")[0];
        }
      } catch {
        shippedDate = dateStr;
      }
    }
  }

  // Extract YouTube video
  const youtubeMatch = html.match(/youtube\.com\/watch\?v=([^"&]+)/);
  const youtubeVideo = youtubeMatch ? `https://youtube.com/watch?v=${youtubeMatch[1]}` : undefined;

  // Extract tags from the page
  const tags: string[] = [];
  const tagMatches = html.matchAll(/\?platform=([^"&]+)/g);
  for (const tm of tagMatches) {
    const tag = decodeURIComponent(tm[1]);
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  const stackMatches = html.matchAll(/\?stack=([^"&]+)/g);
  for (const sm of stackMatches) {
    const tag = decodeURIComponent(sm[1]);
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  return {
    name,
    slug,
    description,
    url: projectUrl || url,
    github,
    author: {
      name: authorGithub,
      github: authorGithub,
      avatar: `https://avatars.githubusercontent.com/${authorGithub}`,
    },
    shippedDate,
    youtubeVideo,
    tags,
  };
}

// Fetch GitHub repo metadata via API
async function fetchRepoMetadata(owner: string, repo: string): Promise<RepoHygiene> {
  const hygiene: RepoHygiene = {
    hasDescription: false,
    description: null,
    hasWebsite: false,
    websiteUrl: null,
    hasReadme: false,
    readmePath: null,
    hasAgentsMd: false,
    agentsMdPath: null,
    readmeHasImage: false,
    readmeHasVideo: false,
    license: null,
    licensePath: null,
    stars: 0,
    forks: 0,
  };

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "small-app-gardener",
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
    });

    if (response.ok) {
      const data = await response.json() as {
        description: string | null;
        homepage: string | null;
        license: { spdx_id: string } | null;
        stargazers_count: number;
        forks_count: number;
      };

      hygiene.description = data.description;
      hygiene.hasDescription = !!data.description && data.description.length > 0;
      hygiene.websiteUrl = data.homepage;
      hygiene.hasWebsite = !!data.homepage && data.homepage.length > 0;
      hygiene.license = data.license?.spdx_id || null;
      hygiene.stars = data.stargazers_count || 0;
      hygiene.forks = data.forks_count || 0;
    }
  } catch {
    // API call failed, continue with defaults
  }

  return hygiene;
}

// Clone a repo and analyze it
async function analyzeRepo(githubUrl: string): Promise<RepoAnalysis> {
  const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  }

  const [, owner, repo] = match;
  const repoPath = `${owner}/${repo}`;
  const cloneDir = join(tmpdir(), `garden-${owner}-${repo}-${Date.now()}`);

  console.log(`    Analyzing ${repoPath}...`);

  // Fetch repo metadata from GitHub API
  const hygiene = await fetchRepoMetadata(owner, repo);

  const analysis: RepoAnalysis = {
    framework: "Unknown",
    language: "Unknown",
    buildTool: "Unknown",
    packageManager: "npm",
    uiLibrary: null,
    dependencies: { runtime: {}, dev: {} },
    testing: { hasTests: false, framework: null, testFiles: [] },
    ci: { hasGitHubActions: false, workflows: [] },
    cloudflare: { products: ["Workers"], bindings: {} },
    replicate: { usesReplicate: false, models: [], apiIntegration: null },
    hygiene,
  };

  try {
    // Clone the repo (shallow clone for speed)
    console.log(`      Cloning...`);
    execSync(`git clone --depth 1 ${githubUrl}.git "${cloneDir}" 2>/dev/null`, {
      timeout: 60000,
    });

    // Analyze package.json
    const packageJsonPath = join(cloneDir, "package.json");
    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fsReadFileSync(packageJsonPath, "utf-8"));
      analyzePackageJson(pkg, analysis);
    }

    // Check for monorepo package.json files in common subdirectories
    const monorepoParentDirs = ["apps", "packages", "worker", "workers"];
    for (const parentName of monorepoParentDirs) {
      const parentDir = join(cloneDir, parentName);
      if (existsSync(parentDir) && statSync(parentDir).isDirectory()) {
        analysis.monorepo = true;
        const subDirs = readdirSync(parentDir).filter(d => 
          statSync(join(parentDir, d)).isDirectory()
        );
        for (const subDir of subDirs) {
          const subPkgPath = join(parentDir, subDir, "package.json");
          if (existsSync(subPkgPath)) {
            const subPkg = JSON.parse(fsReadFileSync(subPkgPath, "utf-8"));
            analyzePackageJson(subPkg, analysis);
          }
          analyzeWranglerInDir(join(parentDir, subDir), analysis);
        }
      }
    }

    // Check common single-app subdirectories for package.json and wrangler config
    const singleAppDirs = ["app", "web", "site", "frontend", "server", "api"];
    for (const dirName of singleAppDirs) {
      const subDir = join(cloneDir, dirName);
      if (existsSync(subDir) && statSync(subDir).isDirectory()) {
        const subPkgPath = join(subDir, "package.json");
        if (existsSync(subPkgPath)) {
          const subPkg = JSON.parse(fsReadFileSync(subPkgPath, "utf-8"));
          analyzePackageJson(subPkg, analysis);
        }
        analyzeWranglerInDir(subDir, analysis);
      }
    }

    // Check for pnpm-lock.yaml
    if (existsSync(join(cloneDir, "pnpm-lock.yaml"))) {
      analysis.packageManager = "pnpm";
    }

    // Check for pyproject.toml (Python projects)
    const pyprojectPath = join(cloneDir, "pyproject.toml");
    if (existsSync(pyprojectPath)) {
      const pyproject = fsReadFileSync(pyprojectPath, "utf-8");
      analyzePyproject(pyproject, analysis);
    }

    // Check for wrangler config in root
    analyzeWranglerInDir(cloneDir, analysis);

    // Check for GitHub Actions
    const workflowsDir = join(cloneDir, ".github", "workflows");
    if (existsSync(workflowsDir)) {
      const workflows = readdirSync(workflowsDir)
        .filter(f => f.endsWith(".yml") || f.endsWith(".yaml"));
      if (workflows.length > 0) {
        analysis.ci.hasGitHubActions = true;
        analysis.ci.workflows = workflows;
      }
    }

    // Find test files by walking the directory
    const testFiles = findTestFiles(cloneDir);
    if (testFiles.length > 0) {
      analysis.testing.hasTests = true;
      analysis.testing.testFiles = testFiles.slice(0, 10);
    }

    // Search for Replicate models if replicate is used
    if (analysis.replicate.usesReplicate) {
      const models = findReplicateModels(cloneDir);
      analysis.replicate.models = models;
    }

    // Analyze README for images/videos
    const readmeFiles = ["README.md", "readme.md", "Readme.md", "README.MD"];
    for (const readmeFile of readmeFiles) {
      const readmePath = join(cloneDir, readmeFile);
      if (existsSync(readmePath)) {
        analysis.hygiene.hasReadme = true;
        analysis.hygiene.readmePath = readmeFile;
        const readmeContent = fsReadFileSync(readmePath, "utf-8");
        
        // Check for images (markdown or HTML)
        const hasImage = /!\[.*?\]\(.*?\)|<img\s+[^>]*src=/i.test(readmeContent);
        analysis.hygiene.readmeHasImage = hasImage;
        
        // Check for videos (YouTube embeds, video tags, gif links)
        const hasVideo = /youtube\.com|youtu\.be|<video|\.gif\)|\.mp4\)/i.test(readmeContent);
        analysis.hygiene.readmeHasVideo = hasVideo;
        
        break;
      }
    }

    // Check for agent instructions
    const agentsFiles = [
      "AGENTS.md",
      "agents.md",
      join(".github", "AGENTS.md"),
      join(".github", "agents.md"),
    ];
    for (const agentsFile of agentsFiles) {
      if (existsSync(join(cloneDir, agentsFile))) {
        analysis.hygiene.hasAgentsMd = true;
        analysis.hygiene.agentsMdPath = agentsFile;
        break;
      }
    }

    // Detect license file path
    const licenseFiles = [
      "LICENSE",
      "LICENSE.md",
      "LICENSE.txt",
      "LICENCE",
      "LICENCE.md",
      "COPYING",
      "COPYING.md",
      "UNLICENSE",
      "UNLICENSE.txt",
      "license",
      "license.md",
      "license.txt",
    ];
    for (const licenseFile of licenseFiles) {
      if (existsSync(join(cloneDir, licenseFile))) {
        analysis.hygiene.licensePath = licenseFile;
        break;
      }
    }

  } catch (error) {
    console.error(`      Error: ${error}`);
  } finally {
    // Clean up
    if (existsSync(cloneDir)) {
      rmSync(cloneDir, { recursive: true, force: true });
    }
  }

  return analysis;
}

function analyzeWranglerInDir(dir: string, analysis: RepoAnalysis): void {
  const wranglerFiles = ["wrangler.toml", "wrangler.jsonc", "wrangler.json"];
  for (const file of wranglerFiles) {
    const filePath = join(dir, file);
    if (existsSync(filePath)) {
      const content = fsReadFileSync(filePath, "utf-8");
      analyzeWranglerConfig(content, analysis);
      break;
    }
  }
}

function findTestFiles(dir: string, basePath = ""): string[] {
  const testFiles: string[] = [];
  const ignoreDirs = ["node_modules", ".git", "dist", "build", ".next", ".nuxt"];

  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (ignoreDirs.includes(entry)) continue;

      const fullPath = join(dir, entry);
      const relativePath = basePath ? `${basePath}/${entry}` : entry;

      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          testFiles.push(...findTestFiles(fullPath, relativePath));
        } else if (stat.isFile()) {
          if (
            entry.includes(".test.") ||
            entry.includes(".spec.") ||
            entry.includes("_test.") ||
            relativePath.includes("__tests__/") ||
            relativePath.startsWith("test/") ||
            relativePath.startsWith("tests/")
          ) {
            testFiles.push(relativePath);
          }
        }
      } catch {
        // Skip files we can't stat
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return testFiles;
}

function findReplicateModels(dir: string, basePath = ""): string[] {
  const models: string[] = [];
  const ignoreDirs = ["node_modules", ".git", "dist", "build", ".next", ".nuxt"];
  const sourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".vue"];

  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (ignoreDirs.includes(entry)) continue;

      const fullPath = join(dir, entry);

      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          models.push(...findReplicateModels(fullPath, `${basePath}/${entry}`));
        } else if (stat.isFile() && sourceExtensions.some(ext => entry.endsWith(ext))) {
          const content = fsReadFileSync(fullPath, "utf-8");
          
          // Look for Replicate model patterns (owner/model or owner/model-version or owner/model:version)
          const modelPatterns = content.matchAll(/["'`]([a-z0-9_-]+\/[a-z0-9_.-]+(?::[a-z0-9]+)?)["'`]/gi);
          for (const match of modelPatterns) {
            const model = match[1];
            // Filter out common false positives
            const mimeTypes = ["video/", "audio/", "image/", "text/", "application/", "font/", "multipart/"];
            const isMimeType = mimeTypes.some(m => model.toLowerCase().startsWith(m));
            
            if (
              model.includes("/") &&
              !isMimeType &&
              !model.startsWith("@") &&
              !model.includes("node_modules") &&
              !model.includes(".com") &&
              !model.includes(".dev") &&
              !model.includes(".io") &&
              !model.endsWith(".ts") &&
              !model.endsWith(".js") &&
              !model.endsWith(".json") &&
              !model.endsWith(".css") &&
              !model.endsWith(".svg") &&
              !model.endsWith(".png") &&
              !model.startsWith("http") &&
              !model.startsWith("api/") &&
              !model.startsWith("src/") &&
              !model.startsWith("public/") &&
              !model.startsWith("assets/") &&
              !models.includes(model)
            ) {
              // Check if it looks like a Replicate model (owner/model format)
              const parts = model.split("/");
              if (parts.length === 2 && parts[0].length > 1 && parts[1].length > 1) {
                // Additional validation - common model providers
                const knownProviders = ["replicate", "stability-ai", "meta", "openai", "google", 
                  "black-forest-labs", "bytedance", "qwen", "reve", "lucataco", "cjwbw"];
                const looksLikeModel = knownProviders.some(p => parts[0].toLowerCase().includes(p)) ||
                  parts[1].includes("-") || // Most model names have hyphens
                  /\d/.test(parts[1]); // Or version numbers
                
                if (looksLikeModel) {
                  models.push(model);
                }
              }
            }
          }
        }
      } catch {
        // Skip files we can't read
      }
    }
  } catch {
    // Skip directories we can't read
  }

  return [...new Set(models)]; // Dedupe
}

function detectCloudflareProductsFromDependencies(
  deps: Record<string, string>,
  analysis: RepoAnalysis
): void {
  if (!deps || Object.keys(deps).length === 0) {
    return;
  }

  const products = new Set(analysis.cloudflare.products);

  for (const depName of Object.keys(deps)) {
    for (const rule of CLOUDFLARE_PACKAGE_PRODUCT_RULES) {
      if (rule.match && depName === rule.match) {
        rule.products.forEach((product) => products.add(product));
      }
      if (rule.prefix && depName.startsWith(rule.prefix)) {
        rule.products.forEach((product) => products.add(product));
      }
    }
  }

  analysis.cloudflare.products = Array.from(products);
}

function analyzePackageJson(pkg: Record<string, unknown>, analysis: RepoAnalysis): void {
  const deps = (pkg.dependencies || {}) as Record<string, string>;
  const devDeps = (pkg.devDependencies || {}) as Record<string, string>;

  // Merge dependencies
  analysis.dependencies.runtime = { ...analysis.dependencies.runtime, ...deps };
  analysis.dependencies.dev = { ...analysis.dependencies.dev, ...devDeps };
  
  if ("typescript" in devDeps || "typescript" in deps) {
    analysis.language = "TypeScript";
  }

  // Detect framework
  if ("next" in deps) {
    analysis.framework = `Next.js ${deps.next?.replace("^", "").split(".")[0]}`;
    analysis.buildTool = "Turbopack";
  } else if ("@remix-run/react" in deps) {
    analysis.framework = "Remix";
    analysis.buildTool = "Vite";
  } else if ("astro" in deps) {
    analysis.framework = "Astro";
    analysis.buildTool = "Vite";
  } else if ("@sveltejs/kit" in deps) {
    analysis.framework = "SvelteKit";
    analysis.buildTool = "Vite";
  } else if ("svelte" in deps) {
    analysis.framework = "Svelte";
    analysis.buildTool = "Vite";
  } else if ("solid-js" in deps) {
    analysis.framework = "SolidJS";
    analysis.buildTool = "Vite";
  } else if ("preact" in deps) {
    analysis.framework = "Preact";
    analysis.buildTool = "Vite";
  } else if ("nuxt" in deps) {
    analysis.framework = `Nuxt ${deps.nuxt?.replace("^", "").split(".")[0]}`;
    analysis.buildTool = "Vite (via Nuxt)";
  } else if ("@tanstack/react-start" in deps || "@tanstack/start" in deps) {
    analysis.framework = "TanStack Start";
    analysis.buildTool = "Vite";
  } else if ("hono" in deps && "react" in deps) {
    analysis.framework = "React + Hono";
    analysis.buildTool = "Vite";
  } else if ("hono" in deps && analysis.framework === "Unknown") {
    analysis.framework = "Hono";
    analysis.buildTool = "wrangler";
  } else if ("react" in deps && analysis.framework === "Unknown") {
    const reactVersion = deps.react?.replace("^", "").split(".")[0];
    analysis.framework = `React${reactVersion ? ` ${reactVersion}` : ""}`;
    analysis.buildTool = "Vite";
  } else if ("vue" in deps && analysis.framework === "Unknown") {
    analysis.framework = "Vue";
    analysis.buildTool = "Vite";
  } else if ("express" in deps && analysis.framework === "Unknown") {
    analysis.framework = "Express";
  } else if ("fastify" in deps && analysis.framework === "Unknown") {
    analysis.framework = "Fastify";
  } else if ("koa" in deps && analysis.framework === "Unknown") {
    analysis.framework = "Koa";
  }

  // Detect build tool more specifically
  if ("vite" in devDeps || "vite" in deps) {
    analysis.buildTool = "Vite";
  } else if ("esbuild" in devDeps) {
    analysis.buildTool = "esbuild";
  } else if ("wrangler" in devDeps || "wrangler" in deps) {
    analysis.buildTool = "wrangler";
    if (analysis.framework === "Unknown") {
      analysis.framework = "Workers";
    }
  }

  // Detect UI library
  if ("tailwindcss" in deps || "tailwindcss" in devDeps || "@tailwindcss/vite" in deps || "@tailwindcss/vite" in devDeps) {
    analysis.uiLibrary = "Tailwind CSS";
  }
  if ("@radix-ui/react-slot" in deps || Object.keys(deps).some(k => k.startsWith("@radix-ui/"))) {
    analysis.uiLibrary = analysis.uiLibrary ? `${analysis.uiLibrary} + Radix UI` : "Radix UI";
  }
  if ("@nuxt/ui" in deps) {
    analysis.uiLibrary = "@nuxt/ui";
  }

  // Detect ORM
  if ("drizzle-orm" in deps) {
    analysis.orm = "Drizzle ORM";
  } else if ("prisma" in deps || "@prisma/client" in deps) {
    analysis.orm = "Prisma";
  }

  // Detect auth
  if ("better-auth" in deps) {
    analysis.auth = "better-auth";
  }

  // Detect test framework from devDependencies
  if ("vitest" in devDeps) {
    analysis.testing.framework = "vitest";
  } else if ("jest" in devDeps) {
    analysis.testing.framework = "jest";
  }
  if ("@playwright/test" in devDeps) {
    analysis.testing.framework = analysis.testing.framework
      ? `${analysis.testing.framework} + playwright`
      : "playwright";
  }

  // Detect Replicate
  if ("replicate" in deps) {
    analysis.replicate.usesReplicate = true;
    analysis.replicate.apiIntegration = "replicate npm package";
  }

  detectCloudflareProductsFromDependencies(deps, analysis);
  detectCloudflareProductsFromDependencies(devDeps, analysis);

  // Detect monorepo
  if (pkg.workspaces) {
    analysis.monorepo = true;
  }
}

function analyzePyproject(content: string, analysis: RepoAnalysis): void {
  // Check if this is primarily a Python project
  if (content.includes("[project]") || content.includes("[tool.hatch]")) {
    if (Array.isArray(analysis.language)) {
      if (!analysis.language.includes("Python")) {
        analysis.language.push("Python");
      }
    } else if (analysis.language !== "Python") {
      analysis.language = [analysis.language, "Python"].filter(l => l !== "Unknown");
    }
  }

  // Check for pytest
  if (content.includes("pytest")) {
    if (analysis.testing.framework) {
      analysis.testing.framework = `${analysis.testing.framework} + pytest`;
    } else {
      analysis.testing.framework = "pytest";
    }
  }

  // Check for uv
  if (content.includes("[tool.uv]") || existsSync("uv.lock")) {
    analysis.packageManager = "pnpm"; // Keep the JS package manager, but note Python uses uv
  }
}

function analyzeWranglerConfig(content: string, analysis: RepoAnalysis): void {
  // Detect Cloudflare products from wrangler config
  const products = new Set(analysis.cloudflare.products);

  if (content.includes("d1_database") || content.includes('"d1"') || content.includes("'d1'") || content.includes("D1Database")) {
    products.add("D1");
  }
  if (content.includes("r2_bucket") || content.includes('"r2"') || content.includes("'r2'") || content.includes("R2Bucket")) {
    products.add("R2");
  }
  if (content.includes("kv_namespace") || content.includes('"kv"') || content.includes("'kv'") || content.includes("KVNamespace")) {
    products.add("KV");
  }
  if (content.includes("durable_object") || content.includes("durableObjects") || content.includes("DurableObject")) {
    products.add("Durable Objects");
  }
  if (content.includes("hyperdrive")) {
    products.add("Hyperdrive");
  }
  if (content.includes("browser") || content.includes("Browser") || content.includes("puppeteer")) {
    products.add("Browser Rendering");
  }
  if (content.includes("workflow") || content.includes("Workflow")) {
    products.add("Workflows");
  }
  if (content.includes("images") || content.includes("Images") || content.includes("IMAGE")) {
    products.add("Cloudflare Images");
  }
  if (content.includes("rate_limit") || content.includes("rateLimiting") || content.includes("RateLimit")) {
    products.add("Rate Limiting");
  }
  if ((content.includes("ai") || content.includes("AI")) && content.includes("binding")) {
    products.add("Workers AI");
  }
  if (content.includes("autorag") || content.includes("ai_search") || content.includes("AutoRAG")) {
    products.add("AI Search");
  }
  if (content.includes("assets") || content.includes("Assets")) {
    products.add("Static Assets");
  }
  if (content.includes("crons") || content.includes("cron") || content.includes("triggers")) {
    products.add("Cron Triggers");
  }
  if (content.includes("turnstile") || content.includes("Turnstile")) {
    products.add("Turnstile");
  }
  if (content.includes("realtime") || content.includes("Realtime") || content.includes("calls")) {
    products.add("Realtime");
  }
  if (content.includes("vectorize")) {
    products.add("Vectorize");
  }
  if (content.includes("queues")) {
    products.add("Queues");
  }

  analysis.cloudflare.products = Array.from(products);
}

// Generate summary statistics
function generateSummary(apps: Array<{ analysis: RepoAnalysis }>) {
  const byFramework: Record<string, number> = {};
  const byLanguage: Record<string, number> = {};
  const byPackageManager: Record<string, number> = {};
  const byBuildTool: Record<string, number> = {};
  const cloudflareProducts: Record<string, number> = {};
  const testFrameworks: Record<string, number> = {};
  const uniqueModels = new Set<string>();

  let withTests = 0;
  let withGitHubActions = 0;
  let appsUsingReplicate = 0;

  for (const app of apps) {
    const { analysis } = app;

    // Framework
    const framework = typeof analysis.framework === "string" ? analysis.framework : "Multiple";
    byFramework[framework] = (byFramework[framework] || 0) + 1;

    // Language
    const languages = Array.isArray(analysis.language) ? analysis.language : [analysis.language];
    for (const lang of languages) {
      byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    }

    // Package manager
    const pm = typeof analysis.packageManager === "string"
      ? analysis.packageManager
      : "npm";
    byPackageManager[pm] = (byPackageManager[pm] || 0) + 1;

    // Build tool
    const bt = typeof analysis.buildTool === "string"
      ? analysis.buildTool
      : "Unknown";
    byBuildTool[bt] = (byBuildTool[bt] || 0) + 1;

    // Cloudflare products
    for (const product of analysis.cloudflare.products) {
      cloudflareProducts[product] = (cloudflareProducts[product] || 0) + 1;
    }

    // Testing
    if (analysis.testing.hasTests) {
      withTests++;
      const tf = analysis.testing.framework;
      if (tf && typeof tf === "string") {
        for (const framework of tf.split(/[,+]\s*/)) {
          testFrameworks[framework.trim()] = (testFrameworks[framework.trim()] || 0) + 1;
        }
      }
    }

    // CI
    if (analysis.ci.hasGitHubActions) {
      withGitHubActions++;
    }

    // Replicate
    if (analysis.replicate.usesReplicate) {
      appsUsingReplicate++;
      for (const model of analysis.replicate.models) {
        uniqueModels.add(model);
      }
    }
  }

  // Hygiene stats
  let withDescription = 0;
  let withWebsite = 0;
  let withReadme = 0;
  let withAgentsMd = 0;
  let withImage = 0;
  let withVideo = 0;

  for (const app of apps) {
    const { analysis } = app;
    if (analysis.hygiene.hasDescription) withDescription++;
    if (analysis.hygiene.hasWebsite) withWebsite++;
    if (analysis.hygiene.hasReadme) withReadme++;
    if (analysis.hygiene.hasAgentsMd) withAgentsMd++;
    if (analysis.hygiene.readmeHasImage) withImage++;
    if (analysis.hygiene.readmeHasVideo) withVideo++;
  }

  return {
    byFramework,
    byLanguage,
    byPackageManager,
    byBuildTool,
    cloudflareProducts,
    testing: {
      withTests,
      withoutTests: apps.length - withTests,
      testFrameworks,
    },
    ci: {
      withGitHubActions,
      withoutGitHubActions: apps.length - withGitHubActions,
    },
    replicate: {
      appsUsingReplicate,
      totalModels: uniqueModels.size,
      uniqueModels: Array.from(uniqueModels).sort(),
    },
    hygiene: {
      withDescription,
      withWebsite,
      withReadme,
      withAgentsMd,
      withImage,
      withVideo,
    },
    scores: {
      popularity: {
        forkWeight: 0.8,
        starWeight: 0.2,
      },
      quality: {
        maxPoints: getQualityMaxPoints(),
      },
    },
  };
}

// Main function
async function main() {
  console.log("=== Small App Garden Data Collector ===\n");

  const args = process.argv.slice(2);
  if (args.includes("--check-apps")) {
    await checkForAppChanges();
    return;
  }

  // Fetch basic app info from the garden
  const basicApps = await fetchGardenApps();
  console.log(`\nFound ${basicApps.length} apps\n`);

  // Analyze each repo
  const apps: App[] = [];
  for (const app of basicApps) {
    console.log(`\nProcessing ${app.name}...`);
    try {
      const analysis = await analyzeRepo(app.github);

      // Merge tags from garden page with detected Cloudflare products
      const allProducts = new Set([...analysis.cloudflare.products]);
      const catalogNames = new Set(CLOUDFLARE_PRODUCT_CATALOG.map((product) => product.name));
      const tagAliases: Record<string, string> = {
        Images: "Cloudflare Images",
      };

      for (const tag of app.tags) {
        if (tag === "Replicate") {
          analysis.replicate.usesReplicate = true;
          continue;
        }

        const normalizedTag = tagAliases[tag] ?? tag;
        if (catalogNames.has(normalizedTag)) {
          allProducts.add(normalizedTag);
        }
      }
      analysis.cloudflare.products = Array.from(allProducts);

      apps.push({
        name: app.name,
        slug: app.slug,
        description: app.description,
        url: app.url,
        github: app.github,
        author: app.author,
        shippedDate: app.shippedDate,
        youtubeVideo: app.youtubeVideo,
        stack: {
          framework: analysis.framework,
          language: analysis.language,
          buildTool: analysis.buildTool,
          packageManager: analysis.packageManager,
          uiLibrary: analysis.uiLibrary,
          ...(analysis.orm && { orm: analysis.orm }),
          ...(analysis.auth && { auth: analysis.auth }),
          ...(analysis.monorepo && { monorepo: analysis.monorepo }),
        },
        dependencies: analysis.dependencies,
        testing: analysis.testing,
        ci: analysis.ci,
        cloudflare: analysis.cloudflare,
        replicate: analysis.replicate,
        hygiene: analysis.hygiene,
        tags: app.tags,
      });

    } catch (error) {
      console.error(`  Error processing ${app.name}:`, error);
    }
  }

  // Score apps
  const popularityMax = getPopularityMax(apps);
  for (const app of apps) {
    const qualityBreakdown = buildQualityBreakdown(app);
    const quality = calculateQualityScore(qualityBreakdown);
    const popularity = calculatePopularityScore(app, popularityMax);
    app.scores = {
      popularity,
      quality,
      qualityBreakdown,
    };
  }

  // Generate summary
  const summary = generateSummary(apps.map((a) => ({
    analysis: {
      framework: a.stack.framework,
      language: a.stack.language,
      buildTool: a.stack.buildTool,
      packageManager: a.stack.packageManager,
      uiLibrary: a.stack.uiLibrary,
      dependencies: a.dependencies,
      testing: a.testing,
      ci: a.ci,
      cloudflare: a.cloudflare,
      replicate: a.replicate,
      hygiene: a.hygiene,
    } as RepoAnalysis,
  })));

  // Create the output data
  const data = {
    lastUpdated: new Date().toISOString().split("T")[0],
    source: GARDEN_URL,
    totalApps: apps.length,
    apps,
    summary,
    cloudflareCatalog: CLOUDFLARE_PRODUCT_CATALOG,
  };

  // Write to file
  writeFileSync("apps.json", JSON.stringify(data, null, 2));
  console.log("\n=== Done! ===");
  console.log(`Wrote ${apps.length} apps to apps.json`);
}

main().catch(console.error);
