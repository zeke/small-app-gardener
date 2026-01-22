export type ScoreBreakdownItem = {
  id: string;
  label: string;
  points: number;
  earned: boolean;
  href?: string;
};

type AppLike = {
  github?: string;
  testing?: {
    hasTests?: boolean;
    testFiles?: string[] | { python: string[]; typescript: string[] };
  };
  ci?: { hasGitHubActions?: boolean; workflows?: string[] };
  hygiene?: {
    hasReadme?: boolean;
    hasAgentsMd?: boolean;
    readmeHasImage?: boolean;
    readmeHasVideo?: boolean;
    hasDescription?: boolean;
    hasWebsite?: boolean;
    websiteUrl?: string | null;
    readmePath?: string | null;
    agentsMdPath?: string | null;
    licensePath?: string | null;
    license?: string | null;
    stars?: number;
    forks?: number;
  };
  scores?: {
    popularity?: number;
    quality?: number;
    qualityBreakdown?: ScoreBreakdownItem[];
  };
};

type QualityRule = {
  id: string;
  label: string;
  points: number;
  isEarned: (app: AppLike) => boolean;
};

const QUALITY_MAX_POINTS = 100;

const QUALITY_RULES: QualityRule[] = [
  { id: "tests", label: "Automated tests", points: 10, isEarned: (app) => !!app.testing?.hasTests },
  { id: "ci", label: "Continuous integration", points: 10, isEarned: (app) => !!app.ci?.hasGitHubActions },
  { id: "readme", label: "README documentation", points: 10, isEarned: (app) => !!app.hygiene?.hasReadme },
  { id: "agentsmd", label: "AGENTS.md instructions", points: 20, isEarned: (app) => !!app.hygiene?.hasAgentsMd },
  {
    id: "readme-media",
    label: "README images or videos",
    points: 10,
    isEarned: (app) => !!app.hygiene?.readmeHasImage || !!app.hygiene?.readmeHasVideo,
  },
  { id: "description", label: "Repository description", points: 15, isEarned: (app) => !!app.hygiene?.hasDescription },
  { id: "website", label: "Project website", points: 15, isEarned: (app) => !!app.hygiene?.hasWebsite },
  { id: "license", label: "License file", points: 10, isEarned: (app) => !!app.hygiene?.license },
];

const qualityTotal = QUALITY_RULES.reduce((total, rule) => total + rule.points, 0);
if (qualityTotal !== QUALITY_MAX_POINTS) {
  throw new Error(
    `Quality rule points must sum to ${QUALITY_MAX_POINTS} (currently ${qualityTotal}).`
  );
}

export function getQualityMaxPoints(): number {
  return QUALITY_MAX_POINTS;
}

function normalizeGithubRepoUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace(/\.git$/, "").replace(/\/+$/, "");
}

function githubBlobUrl(repoUrl: string | undefined, path: string): string | undefined {
  const base = normalizeGithubRepoUrl(repoUrl);
  if (!base) return undefined;
  const cleaned = path.replace(/^\/+/, "");
  return `${base}/blob/HEAD/${cleaned}`;
}

function githubTreeUrl(repoUrl: string | undefined, path: string): string | undefined {
  const base = normalizeGithubRepoUrl(repoUrl);
  if (!base) return undefined;
  const cleaned = path.replace(/^\/+/, "");
  return `${base}/tree/HEAD/${cleaned}`;
}

function githubSearchUrl(repoUrl: string | undefined, query: string): string | undefined {
  const base = normalizeGithubRepoUrl(repoUrl);
  if (!base) return undefined;
  return `${base}/search?q=${encodeURIComponent(query)}`;
}

function getReadmeHref(app: AppLike): string | undefined {
  if (!app.hygiene?.hasReadme) return undefined;
  if (app.hygiene.readmePath) {
    return githubBlobUrl(app.github, app.hygiene.readmePath) ?? undefined;
  }
  const base = normalizeGithubRepoUrl(app.github);
  return base ? `${base}#readme` : undefined;
}

function getTestFileHref(app: AppLike): string | undefined {
  if (!app.testing?.hasTests) return undefined;

  const testFiles = app.testing.testFiles as
    | string[]
    | { python?: string[]; typescript?: string[] }
    | undefined;

  const firstTestFile =
    Array.isArray(testFiles) ? testFiles[0]
    : testFiles?.typescript?.[0] ?? testFiles?.python?.[0];

  if (firstTestFile) {
    return githubBlobUrl(app.github, firstTestFile);
  }

  return githubSearchUrl(app.github, "test");
}

function getCiHref(app: AppLike): string | undefined {
  if (!app.ci?.hasGitHubActions) return undefined;
  const workflows = app.ci.workflows ?? [];
  if (workflows.length === 1) {
    return githubBlobUrl(app.github, `.github/workflows/${workflows[0]}`);
  }
  if (workflows.length > 1) {
    return githubTreeUrl(app.github, ".github/workflows");
  }
  const base = normalizeGithubRepoUrl(app.github);
  return base ? `${base}/actions` : undefined;
}

function getAgentsHref(app: AppLike): string | undefined {
  if (!app.hygiene?.hasAgentsMd) return undefined;
  if (app.hygiene.agentsMdPath) {
    return githubBlobUrl(app.github, app.hygiene.agentsMdPath);
  }
  return githubSearchUrl(app.github, "AGENTS.md");
}

function getLicenseHref(app: AppLike): string | undefined {
  if (!app.hygiene?.license) return undefined;
  if (app.hygiene.licensePath) {
    return githubBlobUrl(app.github, app.hygiene.licensePath);
  }
  const base = normalizeGithubRepoUrl(app.github);
  return base ? `${base}?tab=license-ov-file` : undefined;
}

export function buildQualityBreakdown(app: AppLike): ScoreBreakdownItem[] {
  return QUALITY_RULES.map((rule) => {
    const earned = rule.isEarned(app);
    let href: string | undefined;

    switch (rule.id) {
      case "tests":
        href = getTestFileHref(app);
        break;
      case "ci":
        href = getCiHref(app);
        break;
      case "readme":
        href = getReadmeHref(app);
        break;
      case "agentsmd":
        href = getAgentsHref(app);
        break;
      case "readme-media":
        href = earned ? getReadmeHref(app) : undefined;
        break;
      case "description":
        href = app.hygiene?.hasDescription ? normalizeGithubRepoUrl(app.github) : undefined;
        break;
      case "website":
        href = app.hygiene?.hasWebsite ? app.hygiene.websiteUrl ?? undefined : undefined;
        break;
      case "license":
        href = getLicenseHref(app);
        break;
    }

    return {
      id: rule.id,
      label: rule.label,
      points: rule.points,
      earned,
      ...(href ? { href } : {}),
    };
  });
}

export function calculateQualityScore(breakdown: ScoreBreakdownItem[]): number {
  return breakdown.reduce((total, item) => total + (item.earned ? item.points : 0), 0);
}

export function getPopularityRaw(app: AppLike): number {
  const stars = app.hygiene?.stars ?? 0;
  const forks = app.hygiene?.forks ?? 0;
  const forkWeight = 0.8;
  const starWeight = 0.2;
  return forkWeight * Math.log(forks + 1) + starWeight * Math.log(stars + 1);
}

export function getPopularityMax(apps: AppLike[]): number {
  if (apps.length === 0) {
    return 0;
  }
  return Math.max(...apps.map((app) => getPopularityRaw(app)));
}

export function calculatePopularityScore(app: AppLike, maxScore: number): number {
  if (!maxScore) {
    return 0;
  }
  const raw = getPopularityRaw(app);
  return Math.round((raw / maxScore) * 100);
}

export function getAppScores(app: AppLike, maxPopularityScore: number) {
  // Always compute from the current scoring rules so tweaks take effect
  // without needing to regenerate `apps.json` / `website/src/data.json`.
  const qualityBreakdown = buildQualityBreakdown(app);
  const quality = calculateQualityScore(qualityBreakdown);
  const popularity = calculatePopularityScore(app, maxPopularityScore);

  return {
    popularity,
    quality,
    qualityBreakdown,
  };
}
