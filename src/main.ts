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
    winFile?: string;
    winHash?: string;
    linuxFile?: string;
    linuxHash?: string;
    comment?: string;
};

function buildFromRecord(record: BuildRecord, index: number): Build
{
    return {increment: index + 1, ...record};
}

const builds: Build[] = buildRecords.map(buildFromRecord);
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

function buildDownloadCell(filename: string | undefined, increment: number, label: string, cssClass: string = ""): string
{
    if (!filename)
    {
        return `<span class="no-version">missing</span>`;
    }
    const href = `${R2_BASE_URL}/${increment}/${filename}`;
    const cls = cssClass ? ` ${cssClass}` : "";
    return `<a class="dl-link${cls}" href="${href}">↓ ${label}</a>`;
}

function buildHashCell(hash: string | undefined): string
{
    if (!hash)
    {
        return "-";
    }
    // Truncate for display; full value in title for copy/hover
    const display = hash.length > 16 ? `${hash.slice(0, 16)}…` : hash;
    return `<span class="hash-value" title="${hash}">${display}</span>`;
}

function renderBuildRow(build: Build): HTMLTableRowElement
{
    const {increment, version, date, winFile, winHash, linuxFile, linuxHash, comment} = build;

    const tr = document.createElement("tr");

    if (!winFile && !linuxFile)
    {
        tr.classList.add("missing");
    }

    tr.innerHTML = `
       <td class="ver-num">${increment}</td>
       <td class="build-num">${version}</td>
        <td class="build-date">${date}</td>
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