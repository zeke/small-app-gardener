export type ScoreBreakdownItem = {
  id: string;
  label: string;
  points: number;
  earned: boolean;
};

type AppLike = {
  testing?: { hasTests?: boolean };
  ci?: { hasGitHubActions?: boolean };
  hygiene?: {
    hasReadme?: boolean;
    hasAgentsMd?: boolean;
    readmeHasImage?: boolean;
    readmeHasVideo?: boolean;
    hasDescription?: boolean;
    hasWebsite?: boolean;
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

export function buildQualityBreakdown(app: AppLike): ScoreBreakdownItem[] {
  return QUALITY_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    points: rule.points,
    earned: rule.isEarned(app),
  }));
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
