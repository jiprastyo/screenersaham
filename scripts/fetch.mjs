#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const localDataPath = path.join(rootDir, "data", "issi_data.json");
const localFetcherPath = path.join(rootDir, "scripts", "fetch-data.mjs");
const updaterPath = path.join(rootDir, "scripts", "update-data.mjs");
const configPath = path.join(rootDir, "fetch.config.json");

function usage() {
    console.log(`Usage:
  npm run fetch
  npm run fetch -- --url https://example.com/issi_data.json
  npm run fetch -- --file /absolute/or/relative/path/data.json
  npm run fetch -- --input /absolute/or/relative/path/data.json
  npm run fetch -- --touch

Behavior:
  - default (no args): run local fetcher scripts/fetch-data.mjs.
  - --url: download JSON, validate, then write to data/issi_data.json.
  - --file/--input: validate local JSON then write to data/issi_data.json.
  - --touch: only update fetchedAt metadata in data/issi_data.json.
`);
}

function parseArgs(argv) {
    const args = { help: false, touch: false, url: null, input: null };
    for (let i = 0; i < argv.length; i += 1) {
        const token = argv[i];
        if (token === "--help" || token === "-h") {
            args.help = true;
        } else if (token === "--touch") {
            args.touch = true;
        } else if (token === "--url") {
            args.url = argv[i + 1] || null;
            i += 1;
        } else if (token === "--file" || token === "--input") {
            args.input = argv[i + 1] || null;
            i += 1;
        } else {
            throw new Error(`Unknown argument: ${token}`);
        }
    }
    return args;
}

function runNodeScript(scriptPath, extraArgs = [], cwd = rootDir) {
    const result = spawnSync(process.execPath, [scriptPath].concat(extraArgs), {
        cwd,
        stdio: "inherit",
    });
    if (result.status !== 0) {
        throw new Error(`Script failed (${path.basename(scriptPath)}), exit code ${result.status}`);
    }
}

function validatePayload(payload) {
    const rows =
        payload?.timeframes && Array.isArray(payload.timeframes["1d"])
            ? payload.timeframes["1d"]
            : Array.isArray(payload?.data)
              ? payload.data
              : null;
    if (!rows || rows.length === 0) {
        throw new Error(
            "Invalid payload. Expected payload.timeframes['1d'] or payload.data with non-empty rows.",
        );
    }
}

function validateDataFile(filePath) {
    const raw = fs.readFileSync(filePath, "utf8");
    const payload = JSON.parse(raw);
    validatePayload(payload);
}

function resolveInputPath(inputArg) {
    return path.resolve(process.cwd(), inputArg);
}

async function downloadToTemp(url) {
    const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status} (${url})`);
    }
    const text = await response.text();
    const payload = JSON.parse(text);
    validatePayload(payload);

    const tmpPath = path.join(
        os.tmpdir(),
        `screener-card-fetch-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
    );
    fs.writeFileSync(tmpPath, text, "utf8");
    return tmpPath;
}

function readConfiguredUrl() {
    if (!fs.existsSync(configPath)) {
        return null;
    }
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed?.url === "string" && parsed.url.trim() ? parsed.url.trim() : null;
}

async function importFromFile(inputArg) {
    const sourcePath = resolveInputPath(inputArg);
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Input file not found: ${sourcePath}`);
    }
    validateDataFile(sourcePath);
    runNodeScript(updaterPath, ["--input", sourcePath], rootDir);
    console.log(`Updated ${localDataPath}`);
}

async function importFromUrl(url) {
    const tmpPath = await downloadToTemp(url);
    try {
        runNodeScript(updaterPath, ["--input", tmpPath], rootDir);
        console.log(`Updated ${localDataPath}`);
    } finally {
        try {
            fs.unlinkSync(tmpPath);
        } catch (_) {}
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        usage();
        return;
    }

    if (args.touch) {
        runNodeScript(updaterPath, ["--touch"], rootDir);
        return;
    }

    if (args.input) {
        await importFromFile(args.input);
        return;
    }

    if (args.url) {
        await importFromUrl(args.url);
        return;
    }

    if (fs.existsSync(localFetcherPath)) {
        console.log(`Running local fetcher: ${localFetcherPath}`);
        runNodeScript(localFetcherPath, [], rootDir);
        validateDataFile(localDataPath);
        console.log(`Updated ${localDataPath}`);
        return;
    }

    const configuredUrl = readConfiguredUrl();
    if (configuredUrl) {
        console.log(`No local fetcher found. Using fetch.config.json URL: ${configuredUrl}`);
        await importFromUrl(configuredUrl);
        return;
    }

    throw new Error(
        "No local fetcher found at scripts/fetch-data.mjs and no fetch.config.json URL configured.",
    );
}

main().catch((error) => {
    console.error(error?.message || String(error));
    process.exit(1);
});
