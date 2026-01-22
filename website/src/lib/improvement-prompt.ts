import type { App, ScoreBreakdownItem } from '../../../schema';

type BuildPromptArgs = {
  app: App;
  qualityScore: number;
  qualityMaxPoints: number;
  qualityBreakdown: ScoreBreakdownItem[];
};

function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

function detectLanguageHints(app: App) {
  const languages = asArray(app.stack.language).map((l) => String(l));
  const lower = languages.map((l) => l.toLowerCase());

  return {
    languages,
    isPython: lower.some((l) => l.includes('python')),
    isTypeScript: lower.some((l) => l.includes('typescript')),
    isJavaScript: lower.some((l) => l.includes('javascript')),
  };
}

function githubRepoFullName(repoUrl: string): string {
  const cleaned = repoUrl.replace(/\.git$/, '').replace(/\/+$/, '');
  return cleaned.replace('https://github.com/', '');
}

function indentBlock(text: string, spaces = 2): string {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line.length ? `${pad}${line}` : line))
    .join('\n');
}

function testsGuidance(app: App): string {
  const hints = detectLanguageHints(app);

  if (hints.isPython && !hints.isJavaScript && !hints.isTypeScript) {
    return [
      'Do this (minimum):',
      '- Add a pytest smoke test at `tests/test_smoke.py`.',
      '- Ensure there is a `pytest` command (e.g. `pytest -q`).',
      '',
      'Example file:',
      '```python',
      'def test_smoke():',
      '    assert True',
      '```',
    ].join('\n');
  }

  return [
    'Do this (minimum):',
    '- Add a tiny test file under one of these detected locations:',
    '  - `tests/`',
    '  - `test/`',
    '  - `__tests__/`',
    '  - or a filename containing `.test.` / `.spec.` / `_test.`',
    '- Wire it into your test runner (prefer existing; otherwise add one).',
    '',
    'If you already use Vitest, add:',
    '```ts',
    'import { describe, it, expect } from "vitest";',
    '',
    'describe("smoke", () => {',
    '  it("runs", () => {',
    '    expect(true).toBe(true);',
    '  });',
    '});',
    '```',
  ].join('\n');
}

function ciGuidance(app: App): string {
  const hints = detectLanguageHints(app);

  if (hints.isPython && !hints.isJavaScript && !hints.isTypeScript) {
    return [
      'Do this (minimum): add `.github/workflows/ci.yml` that runs tests on PRs and pushes.',
      '',
      'Starter workflow (adjust install step for your project):',
      '```yml',
      'name: CI',
      '',
      'on:',
      '  push:',
      '  pull_request:',
      '',
      'jobs:',
      '  test:',
      '    runs-on: ubuntu-latest',
      '    steps:',
      '      - uses: actions/checkout@v4',
      '      - uses: actions/setup-python@v5',
      '        with:',
      '          python-version: "3.12"',
      '      - run: python -m pip install --upgrade pip',
      '      - run: pip install -r requirements.txt',
      '      - run: pytest -q',
      '```',
    ].join('\n');
  }

  return [
    'Do this (minimum): add `.github/workflows/ci.yml` that runs tests on PRs and pushes.',
    '',
    'Starter workflow (Node; adjust commands/package manager as needed):',
    '```yml',
    'name: CI',
    '',
    'on:',
    '  push:',
    '  pull_request:',
    '',
    'jobs:',
    '  test:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '      - uses: actions/setup-node@v4',
    '        with:',
    '          node-version: "20"',
    '          cache: "npm"',
    '      - run: npm ci',
    '      - run: npm test',
    '      - run: npm run build --if-present',
    '```',
  ].join('\n');
}

function agentsMdGuidance(): string {
  return [
    'Do this (minimum): add an `AGENTS.md` with the exact commands and repo structure.',
    '',
    'Template:',
    '```md',
    '# Agent Notes',
    '',
    '## Quickstart',
    '',
    '- Install: `<fill in>`',
    '- Dev: `<fill in>`',
    '- Test: `<fill in>`',
    '- Build: `<fill in>`',
    '',
    '## Repo Layout',
    '',
    '- `src/`: application code',
    '- `tests/`: automated tests',
    '',
    '## Environment',
    '',
    '- Required env vars: `<list names only>`',
    '- Where to set secrets: `<platform instructions>`',
    '```',
  ].join('\n');
}

function readmeGuidance(app: App): string {
  return [
    'Do this (minimum): ensure there is a root `README.md` with:',
    `- What ${app.name} does (1-2 sentences)`,
    '- How to run it locally',
    '- How to deploy (if applicable)',
    '- Required environment variables (names only)',
  ].join('\n');
}

function readmeMediaGuidance(): string {
  return [
    'Do this (minimum): add at least one screenshot and either a GIF or a video link.',
    '',
    '- Screenshot: add `docs/screenshot.png` (or `assets/screenshot.png`) and embed it in `README.md`',
    '- Video: add a YouTube link (or embed), OR add a short GIF and link it from the README',
    '',
    'Example README snippet:',
    '```md',
    '![Screenshot](docs/screenshot.png)',
    '',
    'Demo video: https://youtu.be/<id>',
    '```',
  ].join('\n');
}

function descriptionGuidance(): string {
  return [
    'Do this: update the GitHub repository "About" description (not a file change).',
    '- 1 sentence describing the user-facing outcome',
    '- Mention Cloudflare products used (e.g. Workers, D1, R2)',
    '',
    'Using GitHub CLI:',
    '- `gh repo edit <owner>/<repo> --description "<one-line description>"`',
  ].join('\n');
}

function websiteGuidance(): string {
  return [
    'Do this: set the GitHub repository "Website" / homepage URL (not a file change).',
    '- Use your deployed app URL (or a landing page)',
    '',
    'Using GitHub CLI:',
    '- `gh repo edit <owner>/<repo> --homepage "https://your-app.example"`',
  ].join('\n');
}

function licenseGuidance(): string {
  return [
    'Do this (minimum): add a standard license file that GitHub recognizes (e.g. MIT).',
    '- Create `LICENSE` with standard text (fill in the copyright line).',
    '',
    'MIT template:',
    '```text',
    'MIT License',
    '',
    'Copyright (c) {{YEAR}} {{OWNER}}',
    '',
    'Permission is hereby granted, free of charge, to any person obtaining a copy',
    'of this software and associated documentation files (the "Software"), to deal',
    'in the Software without restriction, including without limitation the rights',
    'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell',
    'copies of the Software, and to permit persons to whom the Software is',
    'furnished to do so, subject to the following conditions:',
    '',
    'The above copyright notice and this permission notice shall be included in all',
    'copies or substantial portions of the Software.',
    '',
    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
    'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,',
    'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE',
    'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER',
    'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,',
    'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE',
    'SOFTWARE.',
    '```',
  ].join('\n');
}

function guidanceForRule(app: App, ruleId: string): string {
  switch (ruleId) {
    case 'tests':
      return testsGuidance(app);
    case 'ci':
      return ciGuidance(app);
    case 'readme':
      return readmeGuidance(app);
    case 'agentsmd':
      return agentsMdGuidance();
    case 'readme-media':
      return readmeMediaGuidance();
    case 'description':
      return descriptionGuidance().replaceAll('<owner>/<repo>', githubRepoFullName(app.github));
    case 'website':
      return websiteGuidance().replaceAll('<owner>/<repo>', githubRepoFullName(app.github));
    case 'license':
      return licenseGuidance();
    default:
      return 'Do this: implement the missing requirement.';
  }
}

function detectionNotes(ruleId: string): string {
  switch (ruleId) {
    case 'tests':
      return 'Detected when the repo contains a test file (`.test.`, `.spec.`, `_test.`; `__tests__/`, `test/`, `tests/`).';
    case 'ci':
      return 'Detected when the repo contains at least one workflow under `.github/workflows/*.yml` or `*.yaml`.';
    case 'readme':
      return 'Detected when the repo has a root `README.md` (case variants).';
    case 'agentsmd':
      return 'Detected when the repo has `AGENTS.md` (root or `.github/AGENTS.md`).';
    case 'readme-media':
      return 'Detected when README contains an image (`![]()` or `<img>`) OR a video/GIF (YouTube, `<video>`, `.gif`, `.mp4`).';
    case 'description':
      return 'Detected from GitHub repository "About" description (not a file).';
    case 'website':
      return 'Detected from GitHub repository "Website" / homepage URL (not a file).';
    case 'license':
      return 'Detected from GitHub license metadata (usually recognized when a standard license file exists).';
    default:
      return '';
  }
}

export function buildImprovementPrompt(args: BuildPromptArgs): string {
  const { app, qualityScore, qualityMaxPoints, qualityBreakdown } = args;
  const missing = qualityBreakdown.filter((item) => !item.earned);
  const earned = qualityBreakdown.filter((item) => item.earned);

  const hints = detectLanguageHints(app);
  const stackLines = [
    `Framework: ${app.stack.framework}`,
    `Language: ${hints.languages.join(', ')}`,
    `Build tool: ${typeof app.stack.buildTool === 'string' ? app.stack.buildTool : 'Multiple'}`,
    `Package manager: ${typeof app.stack.packageManager === 'string' ? app.stack.packageManager : 'Multiple'}`,
  ];

  const missingList = missing.length
    ? missing.map((item) => `- ${item.label} (+${item.points}) [${item.id}]`).join('\n')
    : '- None';

  const earnedList = earned.length
    ? earned.map((item) => `- ${item.label} (+${item.points}) [${item.id}]`).join('\n')
    : '- None';

  const perMissingGuidance = missing.length
    ? missing
        .map((item) => {
          const header = `## Fix: ${item.label} (+${item.points}) [${item.id}]`;
          const detection = detectionNotes(item.id);
          const guide = guidanceForRule(app, item.id);
          const body = [
            detection ? `Detection: ${detection}` : undefined,
            guide,
          ].filter(Boolean).join('\n\n');
          return `${header}\n\n${body}`;
        })
        .join('\n\n')
    : 'No missing items. Look for product/UX improvements beyond the rubric.';

  const prompt = [
    'You are an expert engineer working inside this repository. Make real edits (add files, adjust configs, update docs) to improve the repository quality score used by the Small App Garden leaderboard.',
    '',
    'Return your work as:',
    '- A short prioritized checklist (quick wins first)',
    '- A list of files changed/added',
    '- Any commands to run to verify (`test`, `lint`, `build` if present)',
    '',
    `App: ${app.name}`,
    `Repository: ${app.github}`,
    `Description: ${app.description}`,
    '',
    `Current quality score: ${qualityScore}/${qualityMaxPoints}`,
    '',
    'Stack hints:',
    indentBlock(stackLines.map((l) => `- ${l}`).join('\n')),
    '',
    'Already earning points:',
    earnedList,
    '',
    'Missing points (implement these):',
    missingList,
    '',
    'Scoring rubric (what the leaderboard checks):',
    '- Automated tests (+10) - repo contains a test file matching common patterns',
    '- Continuous integration (+10) - repo has GitHub Actions workflow(s) under `.github/workflows/`',
    '- README documentation (+10) - repo has `README.md`',
    '- AGENTS.md instructions (+20) - repo has `AGENTS.md` with agent-friendly commands',
    '- README images or videos (+10) - README includes at least one screenshot and a GIF/video link',
    '- Repository description (+15) - GitHub About description is set',
    '- Project website (+15) - GitHub About homepage URL is set',
    '- License file (+10) - GitHub recognizes a license',
    '',
    'Implementation notes:',
    '- Prefer minimal changes that still meet the detection rules.',
    '- Do not add secrets; use `.env.example` and document env var names instead.',
    '- If adding a license, pick one the owner is comfortable with (MIT is a common default).',
    '',
    perMissingGuidance,
  ].join('\n');

  return prompt;
}
