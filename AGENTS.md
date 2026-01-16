# AGENTS.md

This document describes the AI agents and automation used in this project.

> **Note:** This file should be updated whenever meaningful changes are made to the codebase, including new scripts, workflow changes, schema updates, or modifications to the data collection process.

## Project Overview

**small-app-gardener** is a data collection and analysis project that catalogs applications from Cloudflare's [Small App Garden](https://developers.cloudflare.com/garden/). It extracts detailed metadata about each app's technology stack, dependencies, testing practices, CI/CD setup, and integration with Cloudflare and Replicate services.

**Website:** https://zeke.github.io/small-app-gardener/

## Data Collection Process

The data was collected using AI agents that performed the following tasks:

### 1. Garden Scraping Agent

**Task:** Fetch and parse the main garden page at `developers.cloudflare.com/garden/`

**Output:** List of all apps with basic metadata:
- App name and slug
- Description
- URL and GitHub repository
- Author information
- Tags/categories
- Ship date

### 2. Repository Analysis Agents

**Task:** Deep analysis of each GitHub repository to extract:

- **Stack Analysis**
  - Framework detection (React, Next.js, Nuxt, Hono, etc.)
  - Language (TypeScript, Python, etc.)
  - Build tool (Vite, Turbopack, wrangler, etc.)
  - Package manager (npm, pnpm, uv)
  - UI library (Tailwind, Radix, shadcn/ui, etc.)

- **Dependency Analysis**
  - Runtime dependencies from package.json
  - Dev dependencies
  - Python dependencies from pyproject.toml (where applicable)

- **Testing Analysis**
  - Presence of test files (*.test.ts, *.spec.ts, etc.)
  - Test framework detection (vitest, jest, pytest, playwright)
  - Test configuration files

- **CI/CD Analysis**
  - GitHub Actions workflows in `.github/workflows/`
  - Workflow names and purposes

- **Cloudflare Integration**
  - wrangler.toml / wrangler.jsonc parsing
  - Products used (Workers, D1, R2, KV, Durable Objects, etc.)
  - Bindings configuration

- **Replicate Integration**
  - Detection of `replicate` npm package
  - Model identifiers used (e.g., `google/nano-banana-pro`)
  - API integration method (direct API, npm package, AI Gateway)

- **Repository Hygiene**
  - GitHub description and website
  - README presence and media (images, videos)
  - License, stars, forks

## Files

| File | Description |
|------|-------------|
| `apps.json` | Complete structured data for all apps |
| `README.md` | Project overview with link to website |
| `collect-data.ts` | TypeScript script that scrapes the garden and analyzes repos |
| `schema.ts` | TypeScript schema definitions and validation for apps.json |
| `test.ts` | Test suite for data validation |
| `package.json` | Node.js package configuration with npm scripts |
| `website/` | Astro static site (Tailwind CSS, astro-icon) |
| `.github/workflows/update-data.yml` | GitHub Actions workflow for data collection |
| `.github/workflows/deploy.yml` | GitHub Actions workflow for website deployment |
| `AGENTS.md` | This file - documents the AI agents and automation |

## Data Schema

The schema for `apps.json` is defined in [`schema.ts`](./schema.ts). This file exports:

- `App` - Interface for individual app metadata
- `AppsData` - Interface for the complete data file structure
- `validateAppsData()` - Runtime validation function

Key interfaces include `Author`, `Stack`, `Dependencies`, `Testing`, `CI`, `CloudflareIntegration`, `ReplicateIntegration`, `RepoHygiene`, and `Summary`.

See [`schema.ts`](./schema.ts) for the complete type definitions.

## Running the Scripts

### Collect Data

```bash
npm run collect
```

This scrapes the garden, analyzes each GitHub repository, and copies data to the website.

### Check for App Additions/Removals

```bash
npx tsx collect-data.ts --check-apps
```

### Run Tests

```bash
npm test
```

### Build Website Locally

```bash
cd website && npm install && npm run dev
```

## Automated Updates (GitHub Actions)

### Data Collection (`update-data.yml`)

1. **Runs hourly** via cron schedule (`0 * * * *`)
2. **Can be triggered manually** via workflow_dispatch
3. **Runs on push** to main when scripts or workflow change

What it does:
1. Checks out the repository
2. Sets up Node.js 20
3. Checks for new or removed apps
4. Runs `collect-data.ts` to fetch fresh data
5. Copies data to website
6. If changes are detected, commits and pushes them

### Website Deployment (`deploy.yml`)

1. **Runs on push** to main branch
2. **Can be triggered manually** via workflow_dispatch

What it does:
1. Builds the Astro website
2. Deploys to GitHub Pages

### Environment Variables

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions, used for API rate limiting

## Website

The website is built with:
- **Astro** - Static site generator
- **Tailwind CSS** - Styling
- **astro-icon** - Icon components (Lucide icons)

Features:
- Apps table with sortable columns
- Cloudflare product icons with hover tooltips
- Cloudflare Products and Opportunities sections side-by-side
- Replicate models with links
- Framework and build tool statistics
- Repository hygiene metrics
- Contributor grid with avatars

## Future Improvements

## Notes

- Keep the README focused on summary tables. Large catalog-style content (like full Cloudflare product lists and opportunities) should live on the website instead.

Potential enhancements for this project:

1. **Model Popularity** - Track which Replicate models are most commonly used
2. **Dependency Analysis** - Identify common dependency patterns and versions
3. **Change Detection** - Track when apps are added/removed from the garden
4. **Health Checks** - Verify app URLs are still live
5. **Code Quality Metrics** - Analyze test coverage percentages, lint configurations
6. **Performance Metrics** - If available, track Lighthouse scores or Core Web Vitals

## License

This project collects publicly available information from open source repositories.
