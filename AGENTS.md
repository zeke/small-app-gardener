# AGENTS.md

This document describes the AI agents and automation used in this project.

> **Note:** This file should be updated whenever meaningful changes are made to the codebase, including new scripts, workflow changes, schema updates, or modifications to the data collection process.

## Project Overview

**small-app-gardener** is a data collection and analysis project that catalogs applications from Cloudflare's [Small App Garden](https://developers.cloudflare.com/garden/). It extracts detailed metadata about each app's technology stack, dependencies, testing practices, CI/CD setup, and integration with Cloudflare and Replicate services.

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

## Files

| File | Description |
|------|-------------|
| `apps.json` | Complete structured data for all apps |
| `README.md` | Human-readable report generated from apps.json |
| `collect-data.ts` | TypeScript script that scrapes the garden and analyzes repos |
| `generate-report.ts` | TypeScript script that generates README.md |
| `schema.ts` | TypeScript schema definitions and validation for apps.json |
| `package.json` | Node.js package configuration with npm scripts |
| `.github/workflows/update-data.yml` | GitHub Actions workflow for automated updates |
| `AGENTS.md` | This file - documents the AI agents and automation |

## Data Schema

The schema for `apps.json` is defined in [`schema.ts`](./schema.ts). This file exports:

- `App` - Interface for individual app metadata
- `AppsData` - Interface for the complete data file structure
- `validateAppsData()` - Runtime validation function

The schema is used by `generate-report.ts` to validate data before generating the README. Key interfaces include `Author`, `Stack`, `Dependencies`, `Testing`, `CI`, `CloudflareIntegration`, `ReplicateIntegration`, and `Summary`.

See [`schema.ts`](./schema.ts) for the complete type definitions.

## Running the Scripts

### Collect Data

```bash
npm run collect
# or
npx tsx collect-data.ts
```

This scrapes the garden and analyzes each GitHub repository.

### Generate Report

```bash
npm run report
# or
npx tsx generate-report.ts
```

This reads `apps.json` and generates a formatted `README.md` with:
- Quick stats overview
- Individual app listings sorted by ship date
- Cloudflare products usage chart
- Framework distribution
- Replicate integration details
- Testing and CI/CD statistics
- Build tools and package managers
- Contributor list

### Full Update

```bash
npm run update
```

Runs both collect and report in sequence.

## Automated Updates (GitHub Actions)

The project includes a GitHub Actions workflow (`.github/workflows/update-data.yml`) that:

1. **Runs hourly** via cron schedule (`0 * * * *`)
2. **Can be triggered manually** via workflow_dispatch
3. **Runs on push** to main when scripts or workflow change

### What the workflow does:

1. Checks out the repository
2. Sets up Node.js 20
3. Runs `collect-data.ts` to fetch fresh data
4. Runs `generate-report.ts` to update the README
5. If changes are detected, commits and pushes them

### Environment Variables

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions, used for API rate limiting

## Future Improvements

Potential enhancements for this project:

1. **Model Popularity** - Track which Replicate models are most commonly used
2. **Dependency Analysis** - Identify common dependency patterns and versions
3. **Change Detection** - Track when apps are added/removed from the garden
4. **Health Checks** - Verify app URLs are still live
5. **Code Quality Metrics** - Analyze test coverage percentages, lint configurations
6. **Performance Metrics** - If available, track Lighthouse scores or Core Web Vitals

## Agent Configuration

The agents used for this project were configured with:

- **subagent_type:** `research` - Optimized for codebase exploration and data extraction
- **Parallel execution:** All 12 repository analyses ran concurrently
- **Data sources:** 
  - Cloudflare Garden website (WebFetch)
  - GitHub repositories (via gh CLI and web fetching)
  - package.json, wrangler.toml, pyproject.toml files

## License

This project collects publicly available information from open source repositories.
