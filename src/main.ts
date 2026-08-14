import './styles.css';
import { version } from '../package.json';
import buildRecords from '../public/builds.json';

// Config
const R2_BASE_URL = "https://files.ksa-archive.net/builds";
const THEME_STORAGE_KEY = "ksa-theme";
type Theme = "dark" | "light";

// Build data
type Build = { increment: number } & BuildRecord;

type BuildRecord = {
    version: number;
    date: string;
    winFile: string | null;
    winHash: string | null;
    linuxFile: string | null;
    linuxHash: string | null;
    comment: string | null;
    hasChangelog: boolean | null;
};

function buildFromRecord(record: BuildRecord, index: number): Build
{
    return {increment: index + 1, ...record};
}

const builds: Build[] = (buildRecords as BuildRecord[]).map(buildFromRecord);
getElement("buildRange").textContent = `Builds ${builds[0].version} => ${builds[builds.length - 1].version}`;
getElement("siteVersion").textContent = `v${version}`;

// Utilities
function getElement<T extends HTMLElement>(id: string): T
{
    const el = document.getElementById(id);
    if (!el)
    {
        throw new Error(`Element #${id} not found`);
    }
    return el as T;
}

// Theme
function isTheme(value: string | null): value is Theme
{
    return value === "dark" || value === "light";
}

function getStoredTheme(): Theme | null
{
    try
    {
        const value = localStorage.getItem(THEME_STORAGE_KEY);
        return isTheme(value) ? value : null;
    }
    catch
    {
        return null;
    }
}

function storeTheme(theme: Theme): void
{
    try
    {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    catch
    {
        /* storage unavailable, silently ignore */
    }
}

function applyTheme(theme: Theme): void
{
    document.documentElement.setAttribute("data-theme", theme);

    const isDark = theme === "dark";
    getElement("toggleEmoji").textContent = isDark ? "🌙" : "☀️";
    getElement("toggleLabel").textContent = isDark ? "Dark mode" : "Light mode";

    storeTheme(theme);
}

function toggleTheme(): void
{
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
}

getElement("themeToggle").addEventListener("click", toggleTheme);

const savedTheme = getStoredTheme();
if (savedTheme)
{
    applyTheme(savedTheme);
}

// Build table
getElement("buildCount").textContent = `${builds.length} builds tracked`;

function buildDownloadCell(filename: string | null, increment: number, label: string, cssClass: string = ""): string
{
    if (!filename)
    {
        return `<span class="no-version">missing</span>`;
    }
    const href = `${R2_BASE_URL}/${increment}/${filename}`;
    const cls = cssClass ? ` ${cssClass}` : "";
    return `<a class="dl-link${cls}" href="${href}">↓ ${label}</a>`;
}

function buildHashCell(hash: string | null): string
{
    if (!hash)
    {
        return "-";
    }
    // Truncate for display; full value in title for copy/hover
    const display = hash.length > 16 ? `${hash.slice(0, 16)}…` : hash;
    return `<span class="hash-value" title="${hash}">${display}</span>`;
}

function escapeHtml(text: string): string
{
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

type Changelog = {
    version: number;
    sources: string[];
    changes: string[];
};

function isChangelog(value: unknown): value is Changelog
{
    if (!value || typeof value !== "object")
    {
        return false;
    }
    const record = value as Record<string, unknown>;
    return typeof record.version === "number"
        && Array.isArray(record.sources)
        && Array.isArray(record.changes)
        && record.sources.every(item => typeof item === "string")
        && record.changes.every(item => typeof item === "string");
}

function changelogBodyHtml(data: Changelog): string
{
    const changes = data.changes.length > 0
        ? `<ul class="changelog-list">${data.changes.map(change => `<li>${escapeHtml(change)}</li>`).join("")}</ul>`
        : `<p class="changelog-empty">No changelog items recorded for this build.</p>`;

    const sources = data.sources.length > 0
        ? `<div class="changelog-sources">${data.sources.map((source, index) =>
            `<a class="changelog-btn" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Source ${index + 1}</a>`
        ).join("")}</div>`
        : `<p class="changelog-empty">No sources available.</p>`;

    return `
        <section class="changelog-section">
            <h3>Changes</h3>
            ${changes}
        </section>
        <section class="changelog-section">
            <h3>Sources</h3>
            ${sources}
        </section>
    `;
}

async function openChangelogModal(version: number): Promise<void>
{
    const dialog = document.createElement("dialog");
    dialog.className = "changelog-dialog";
    dialog.innerHTML = `
        <div class="changelog-dialog-header">
            <h2>Build ${escapeHtml(String(version))} Changelog</h2>
            <button type="button" class="changelog-close" aria-label="Close changelog">Close</button>
        </div>
        <div class="changelog-dialog-body">
            <p class="changelog-loading">Loading changelog…</p>
        </div>
    `;

    const body = dialog.querySelector(".changelog-dialog-body") as HTMLElement;
    const closeBtn = dialog.querySelector(".changelog-close") as HTMLButtonElement;

    closeBtn.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => dialog.remove());
    dialog.addEventListener("click", (event) =>
    {
        if (event.target === dialog)
        {
            dialog.close();
        }
    });

    document.body.appendChild(dialog);
    dialog.showModal();

    try
    {
        const response = await fetch(`/changelog/${version}.json`);
        if (!response.ok)
        {
            throw new Error(`Failed to load changelog (${response.status})`);
        }

        const data: unknown = await response.json();
        if (!isChangelog(data))
        {
            throw new Error("Changelog response was invalid");
        }

        body.innerHTML = changelogBodyHtml(data);
    }
    catch (error)
    {
        const message = error instanceof Error ? error.message : "Failed to load changelog";
        body.innerHTML = `<p class="changelog-error">${escapeHtml(message)}</p>`;
    }
}

function renderBuildRow(build: Build): HTMLTableRowElement
{
    const {increment, version, date, winFile, winHash, linuxFile, linuxHash, comment, hasChangelog} = build;

    const tr = document.createElement("tr");

    if (!winFile && !linuxFile)
    {
        tr.classList.add("missing");
    }

    const changelogCell = hasChangelog
        ? `<button type="button" class="changelog-btn" data-version="${version}">Changelog</button>`
        : "";

    tr.innerHTML = `
       <td class="ver-num">${increment}</td>
       <td class="build-num">${version}</td>
        <td class="build-date">${date}</td>
        <td class="changelog-cell">${changelogCell}</td>
        <td>${comment ? `<span class="comment-tag">${comment}</span>` : ""}</td>
        <td>${buildDownloadCell(winFile, version, "Windows")}</td>
        <td class="hash-cell">${buildHashCell(winHash)}</td>
        <td>${buildDownloadCell(linuxFile, version, "Linux", "linux")}</td>
        <td class="hash-cell">${buildHashCell(linuxHash)}</td>
    `;

    return tr;
}

const tbody = getElement<HTMLTableSectionElement>("tbody");
const fragment = document.createDocumentFragment();

[...builds].reverse().forEach(build => fragment.appendChild(renderBuildRow(build)));

tbody.appendChild(fragment);

tbody.addEventListener("click", (event) =>
{
    const target = event.target;
    if (!(target instanceof HTMLElement))
    {
        return;
    }

    const button = target.closest("button.changelog-btn");
    if (!(button instanceof HTMLButtonElement) || button.disabled)
    {
        return;
    }

    const version = Number(button.dataset.version);
    if (!Number.isFinite(version))
    {
        return;
    }

    button.disabled = true;
    void openChangelogModal(version).finally(() =>
    {
        button.disabled = false;
    });
});