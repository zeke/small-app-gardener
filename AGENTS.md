# AGENTS.md

This repo collects metadata about apps in Cloudflare's Small App Garden and publishes a leaderboard site.

Website: https://gardener.ziki.boo

## Data + analysis

- `collect-data.ts`: scrape the garden + analyze each linked GitHub repo, write `apps.json`
- `npm run collect`: run `collect-data.ts`, then copy `apps.json` to `website/src/data.json`
- `schema.ts`: TypeScript types + runtime validation for `apps.json`
- `test.ts` (`npm test`): validate `apps.json` against `schema.ts`

## Website

- `website/`: Astro site
- `website/src/data.json`: data file used by the site (produced by `npm run collect`)
- `website/astro.config.mjs`: sets the production `site` for canonical URLs
- `website/src/pages/apps/[slug].astro`: per-app page includes an edit-focused "Improve your score" agent prompt
- `website/src/lib/improvement-prompt.ts`: prompt content; keep it aligned with scoring rules in `website/src/lib/scores.ts`

## Automation

- `.github/workflows/update-data.yml`: runs `npm run collect` on a schedule and commits any data changes
- `.github/workflows/deploy.yml`: builds `website/` and deploys to GitHub Pages (custom domain)

## CI environment

- `GITHUB_TOKEN`: used for GitHub API calls during collection
