#!/usr/bin/env npx tsx

/**
 * Tests for Small App Garden data collection and validation
 */

import { readFileSync, existsSync } from "fs";
import { validateAppsData } from "./schema.js";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  ${error}`);
    failed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test: apps.json exists
test("apps.json exists", () => {
  assert(existsSync("apps.json"), "apps.json file not found");
});

// Test: apps.json is valid JSON
test("apps.json is valid JSON", () => {
  const content = readFileSync("apps.json", "utf-8");
  JSON.parse(content);
});

// Test: apps.json passes schema validation
test("apps.json passes schema validation", () => {
  const content = readFileSync("apps.json", "utf-8");
  const data = JSON.parse(content);
  validateAppsData(data);
});

// Test: apps.json has apps
test("apps.json has apps", () => {
  const data = JSON.parse(readFileSync("apps.json", "utf-8"));
  assert(data.apps.length > 0, "No apps found in apps.json");
});

// Test: apps.json has Cloudflare catalog
test("apps.json has Cloudflare catalog", () => {
  const data = JSON.parse(readFileSync("apps.json", "utf-8"));
  assert(Array.isArray(data.cloudflareCatalog), "cloudflareCatalog is missing");
  assert(data.cloudflareCatalog.length > 0, "cloudflareCatalog is empty");
});

// Test: all apps have required fields
test("all apps have required fields", () => {
  const data = JSON.parse(readFileSync("apps.json", "utf-8"));
  for (const app of data.apps) {
    assert(app.name, `App missing name`);
    assert(app.slug, `App ${app.name} missing slug`);
    assert(app.github, `App ${app.name} missing github`);
    assert(app.author?.github, `App ${app.name} missing author.github`);
    assert(app.stack?.framework, `App ${app.name} missing stack.framework`);
    assert(app.cloudflare?.products?.length > 0, `App ${app.name} missing cloudflare.products`);
  }
});

// Test: all GitHub URLs are valid
test("all GitHub URLs are valid", () => {
  const data = JSON.parse(readFileSync("apps.json", "utf-8"));
  const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/;
  for (const app of data.apps) {
    assert(
      githubUrlPattern.test(app.github),
      `App ${app.name} has invalid GitHub URL: ${app.github}`
    );
  }
});

// Test: summary totals match
test("summary totals match app count", () => {
  const data = JSON.parse(readFileSync("apps.json", "utf-8"));
  assert(
    data.totalApps === data.apps.length,
    `totalApps (${data.totalApps}) doesn't match apps.length (${data.apps.length})`
  );
});

// Test: testing summary adds up
test("testing summary adds up", () => {
  const data = JSON.parse(readFileSync("apps.json", "utf-8"));
  const { withTests, withoutTests } = data.summary.testing;
  assert(
    withTests + withoutTests === data.apps.length,
    `Testing counts (${withTests} + ${withoutTests}) don't match app count (${data.apps.length})`
  );
});

// Test: CI summary adds up
test("CI summary adds up", () => {
  const data = JSON.parse(readFileSync("apps.json", "utf-8"));
  const { withGitHubActions, withoutGitHubActions } = data.summary.ci;
  assert(
    withGitHubActions + withoutGitHubActions === data.apps.length,
    `CI counts (${withGitHubActions} + ${withoutGitHubActions}) don't match app count (${data.apps.length})`
  );
});

// Test: README.md exists
test("README.md exists", () => {
  assert(existsSync("README.md"), "README.md file not found");
});

// Test: README.md has content and links to website
test("README.md has content", () => {
  const content = readFileSync("README.md", "utf-8");
  assert(content.length > 20, "README.md seems too short");
  assert(content.includes("# Gardener"), "README.md missing title");
  assert(content.includes("https://gardener.ziki.boo"), "README.md missing website link");
});

// Test: Replicate models are valid format
test("Replicate models have valid format", () => {
  const data = JSON.parse(readFileSync("apps.json", "utf-8"));
  const modelPattern = /^[\w-]+\/[\w.-]+$/;
  for (const app of data.apps) {
    if (app.replicate?.models) {
      for (const model of app.replicate.models) {
        assert(
          modelPattern.test(model),
          `App ${app.name} has invalid Replicate model format: ${model}`
        );
      }
    }
  }
});

// Test: All Workers apps have Workers in products
test("all apps include Workers in cloudflare.products", () => {
  const data = JSON.parse(readFileSync("apps.json", "utf-8"));
  for (const app of data.apps) {
    assert(
      app.cloudflare.products.includes("Workers"),
      `App ${app.name} missing Workers in cloudflare.products`
    );
  }
});

// Summary
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
