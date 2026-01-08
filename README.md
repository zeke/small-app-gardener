# Small App Garden

A curated collection of apps built on Cloudflare's developer platform.

**[View the website](https://zeke.github.io/small-app-gardener/)**

## About

This project scrapes [Cloudflare's Small App Garden](https://developers.cloudflare.com/garden/) and analyzes each GitHub repository to extract metadata about technology stacks, dependencies, testing practices, CI/CD setup, and Cloudflare product integrations.

## Data

- [apps.json](./apps.json) - Complete structured data for all apps
- [Website](https://zeke.github.io/small-app-gardener/) - Interactive view of the data

## Development

```bash
npm install

# Collect fresh data from the garden
npm run collect

# Run tests
npm test

# Build the website
cd website && npm install && npm run build
```

## License

MIT
