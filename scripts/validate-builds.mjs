import { readFile } from "node:fs/promises";

const path = new URL("../public/builds.json", import.meta.url);
let builds;

try {
  builds = JSON.parse(await readFile(path, "utf8"));
} catch (error) {
  console.error(`Unable to read/parse public/builds.json: ${error.message}`);
  process.exit(1);
}

const errors = [];
const seenVersions = new Set();

if (!Array.isArray(builds) || builds.length === 0) {
  console.error("public/builds.json must be a non-empty JSON array.");
  process.exit(1);
}

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;
const isValidHash = (value) => /^[a-f\d]{64}$/i.test(value);

builds.forEach((build, index) => {
  const where = `builds.json entry ${index + 1}`;

  if (!build || typeof build !== "object" || Array.isArray(build)) {
    errors.push(`${where} must be an object.`);
    return;
  }

  if (!Number.isSafeInteger(build.version) || build.version <= 0) {
    errors.push(`${where}: version must be a positive integer.`);
  } else if (seenVersions.has(build.version)) {
    errors.push(`${where}: duplicate version ${build.version}.`);
  } else {
    seenVersions.add(build.version);
  }

  if (!isNonEmptyString(build.date) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(build.date) ||
      Number.isNaN(Date.parse(`${build.date}T00:00:00Z`)) ||
      new Date(`${build.date}T00:00:00Z`).toISOString().slice(0, 10) !== build.date) {
    errors.push(`${where}: date must be a real YYYY-MM-DD date.`);
  }

  for (const field of ["winFile", "linuxFile"]) {
    const value = build[field];
    if (value !== undefined &&
        (!isNonEmptyString(value) || value === "." || value === ".." ||
         /[/\\\0]/.test(value))) {
      errors.push(`${where}: ${field} must be a filename, not a path.`);
    }
  }

  for (const field of ["winHash", "linuxHash"]) {
    const value = build[field];
    if (value !== undefined && !isValidHash(value)) {
      errors.push(`${where}: ${field} must be a 64-character SHA-256 hex digest.`);
    }
  }

  if (build.comment !== undefined && typeof build.comment !== "string") {
    errors.push(`${where}: comment must be a string when provided.`);
  }

  if (!build.winFile && !build.linuxFile) {
    // Metadata-only entries are allowed; this is the archive's existing convention.
  }
});

if (errors.length) {
  console.error(`Archive integrity validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Archive metadata OK: validated ${builds.length} entries; versions are unique.`);
