import './styles.css';
import { version } from '../package.json';

// Config
const R2_BASE_URL = "https://files.ksa-archive.net/builds";
const THEME_STORAGE_KEY = "ksa-theme";
type Theme = "dark" | "light";

// Build data
interface Build
{
    increment: number;
    version: number;
    date: string;
    winFile: string | null;
    winHash: string | null;
    linuxFile: string | null;
    linuxHash: string | null;
    comment: string | null;
}

// Tuple type matching the raw data layout for compact authoring
type BuildTuple = [
    increment: number,
    version: number,
    date: string,
    winFile: string | null,
    winHash: string | null,
    linuxFile: string | null,
    linuxHash: string | null,
    comment: string | null,
];

function buildFromTuple([increment, version, date, winFile, winHash, linuxFile, linuxHash, comment]: BuildTuple): Build
{
    return {increment, version, date, winFile, winHash, linuxFile, linuxHash, comment};
}

const buildTuples: BuildTuple[] = [
    [1, 2076, "2025-08-15", "setup_ksa_v2025.8.43.2076.exe", null, null, null, "first build(?)"],
    [2, 2088, "2025-08-18", "setup_ksa_v2025.8.17.2088.exe", null, null, null, null],
    [3, 2091, "2025-08-18", "setup_ksa_v2025.8.33.2091.exe", null, null, null, null],
    [4, 2101, "2025-08-19", "setup_ksa_v2025.8.59.2101.exe", null, null, null, null],
    [5, 2108, "2025-08-19", "setup_ksa_v2025.8.86.2108.exe", null, null, null, null],
    [6, 2112, "2025-08-19", "setup_ksa_v2025.8.100.2112.exe", null, null, null, null],
    [7, 2121, "2025-08-20", "setup_ksa_v2025.8.282.2121.exe", null, null, null, null],
    [8, 2125, "2025-08-20", "setup_ksa_v2025.8.14.2125.exe", null, null, null, null],
    [9, 2133, "2025-08-21", "setup_ksa_v2025.8.19.2133.exe", null, null, null, null],
    [10, 2136, "2025-08-21", "setup_ksa_v2025.8.20.2136.exe", null, null, null, null],
    [11, 2163, "2025-08-22", "setup_ksa_v2025.8.285.2163.exe", null, null, null, null],
    [12, 2167, "2025-08-23", "setup_ksa_v2025.8.21.2167.exe", null, null, null, null],
    [13, 2169, "2025-08-24", "setup_ksa_v2025.8.22.2169.exe", null, null, null, null],
    [14, 2171, "2025-08-25", "setup_ksa_v2025.8.287.2171.exe", null, null, null, null],
    [15, 2181, "2025-08-25", "setup_ksa_v2025.8.288.2181.exe", null, null, null, null],
    [16, 2197, "2025-08-26", "setup_ksa_v2025.8.23.2197.exe", null, null, null, null],
    [18, 2212, "2025-08-27", "setup_ksa_v2025.8.289.2212.exe", null, null, null, null],
    [19, 2234, "2025-08-28", "setup_ksa_v2025.8.292.2234.exe", null, null, null, null],
    [20, 2250, "2025-08-29", "setup_ksa_v2025.8.293.2250.exe", null, null, null, null],
    [21, 2252, "2025-08-29", "setup_ksa_v2025.8.294.2252.exe", null, null, null, null],
    [22, 2263, "2025-08-30", "setup_ksa_v2025.8.24.2263.exe", null, null, null, null],
    [23, 2270, "2025-09-01", "setup_ksa_v2025.9.2.2270.exe", null, null, null, null],
    [24, 2279, "2025-09-02", "setup_ksa_v2025.9.3.2279.exe", null, null, null, null],
    [25, 2290, "2025-09-03", "setup_ksa_v2025.9.4.2290.exe", null, null, null, null],
    [26, 2298, "2025-09-04", "setup_ksa_v2025.9.5.2298.exe", null, null, null, null],
    [27, 2300, "2025-09-04", "setup_ksa_v2025.9.2.2300.exe", null, null, null, null],
    [28, 2317, "2025-09-05", "setup_ksa_v2025.9.6.2317.exe", null, null, null, null],
    [29, 2336, "2025-09-09", "setup_ksa_v2025.9.8.2336.exe", null, null, null, null],
    [30, 2364, "2025-09-12", "setup_ksa_v2025.9.9.2364.exe", null, null, null, null],
    [31, 2376, "2025-09-15", "setup_ksa_v2025.9.10.2376.exe", null, null, null, null],
    [32, 2383, "2025-09-17", "setup_ksa_v2025.9.2.2383.exe", null, null, null, null],
    [33, 2399, "2025-09-18", "setup_ksa_v2025.9.12.2399.exe", null, null, null, null],
    [34, 2404, "2025-09-19", "setup_ksa_v2025.9.3.2404.exe", null, null, null, null],
    [35, 2415, "2025-09-23", "setup_ksa_v2025.9.13.2415.exe", null, null, null, null],
    [36, 2429, "2025-09-26", "setup_ksa_v2025.9.4.2429.exe", null, null, null, null],
    [37, 2441, "2025-09-29", "setup_ksa_v2025.9.5.2441.exe", null, null, null, null],
    [38, 2476, "2025-10-09", "setup_ksa_v2025.10.5.2476.exe", null, null, null, null],
    [39, 2497, "2025-10-10", "setup_ksa_v2025.10.6.2497.exe", null, null, null, null],
    [40, 2502, "2025-10-14", "setup_ksa_v2025.10.8.2502.exe", null, null, null, null],
    [41, 2530, "2025-10-21", "setup_ksa_v2025.10.10.2530.exe", null, null, null, null],
    [42, 2540, "2025-10-23", "setup_ksa_v2025.10.11.2540.exe", null, null, null, null],
    [43, 2547, "2025-10-24", "setup_ksa_v2025.10.12.2547.exe", null, null, null, null],
    [44, 2554, "2025-10-28", "setup_ksa_v2025.10.13.2554.exe", null, null, null, null],
    [45, 2573, "2025-10-29", "setup_ksa_v2025.10.5.2573.exe", null, null, null, null],
    [46, 2584, "2025-10-30", "setup_ksa_v2025.10.6.2584.exe", null, null, null, null],
    [47, 2613, "2025-10-31", "setup_ksa_v2025.10.10.2613.exe", null, null, null, null],
    [48, 2620, "2025-11-02", "setup_ksa_v2025.11.2.2620.exe", null, null, null, null],
    [49, 2634, "2025-11-03", "setup_ksa_v2025.11.3.2634.exe", null, null, null, null],
    [50, 2742, "2025-11-12", "setup_ksa_v2025.11.4.2742.exe", null, null, null, null],
    [51, 2781, "2025-11-13", "setup_ksa_v2025.11.2.2781.exe", null, null, null, null],
    [52, 2789, "2025-11-14", null, null, null, null, null],
    [53, 2791, "2025-11-14", "setup_ksa_v2025.11.4.2791.exe", null, null, null, "first really public build"],
    [54, 2819, "2025-11-17", "setup_ksa_v2025.11.5.2819.exe", null, null, null, null],
    [55, 2829, "2025-11-19", "setup_ksa_v2025.11.6.2829.exe", null, null, null, null],
    [56, 2844, "2025-11-20", "setup_ksa_v2025.11.7.2844.exe", null, null, null, null],
    [57, 2847, "2025-11-24", "setup_ksa_v2025.11.8.2847.exe", null, null, null, null],
    [58, 2894, "2025-11-24", "setup_ksa_v2025.11.9.2894.exe", null, null, null, null],
    [59, 2897, "2025-11-24", "setup_ksa_v2025.11.5.2897.exe", null, null, null, null],
    [60, 2915, "2025-11-25", "setup_ksa_v2025.11.10.2915.exe", null, null, null, null],
    [61, 2924, "2025-11-26", "setup_ksa_v2025.11.11.2924.exe", null, null, null, null],
    [62, 2939, "2025-11-27", "setup_ksa_v2025.11.6.2939.exe", null, null, null, null],
    [63, 2945, "2025-11-28", "setup_ksa_v2025.11.8.2945.exe", null, null, null, null],
    [64, 2971, "2025-12-02", "setup_ksa_v2025.12.3.2971.exe", null, null, null, null],
    [65, 2976, "2025-12-02", "setup_ksa_v2025.12.5.2976.exe", null, null, null, null],
    [66, 2991, "2025-12-03", "setup_ksa_v2025.12.2.2991.exe", null, null, null, null],
    [67, 2994, "2025-12-03", "setup_ksa_v2025.12.13.2994.exe", null, null, null, null],
    [68, 3000, "2025-12-04", "setup_ksa_v2025.12.14.3000.exe", null, null, null, null],
    [69, 3011, "2025-12-05", "setup_ksa_v2025.12.6.3011.exe", null, null, null, null],
    [70, 3014, "2025-12-05", "setup_ksa_v2025.12.24.3014.exe", null, null, null, null],
    [71, 3030, "2025-12-09", "setup_ksa_v2025.12.8.3030.exe", null, null, null, null],
    [72, 3041, "2025-12-10", "setup_ksa_v2025.12.9.3041.exe", null, null, null, null],
    [73, 3047, "2025-12-11", "setup_ksa_v2025.12.25.3047.exe", null, null, null, null],
    [74, 3057, "2025-12-12", "setup_ksa_v2025.12.10.3057.exe", null, null, null, null],
    [75, 3072, "2025-12-15", "setup_ksa_v2025.12.27.3072.exe", null, null, null, null],
    [76, 3082, "2025-12-16", "setup_ksa_v2025.12.11.3082.exe", null, null, null, null],
    [77, 3097, "2025-12-17", "setup_ksa_v2025.12.29.3097.exe", null, null, null, null],
    [78, 3103, "2025-12-17", "setup_ksa_v2025.12.31.3103.exe", null, null, null, null],
    [79, 3123, "2025-12-23", "setup_ksa_v2025.12.33.3123.exe", null, null, null, null],
    [80, 3181, "2026-01-08", "setup_ksa_v2026.1.2.3181.exe", null, null, null, null],
    [81, 3194, "2026-01-09", "setup_ksa_v2026.1.3.3194.exe", null, null, null, null],
    [82, 3232, "2026-01-16", null, null, null, null, null],
    [83, 3233, "2026-01-16", "setup_ksa_v2026.1.4.3233.exe", null, null, null, null],
    [84, 3249, "2026-01-19", "setup_ksa_v2026.1.5.3249.exe", null, null, null, null],
    [85, 3270, "2026-01-21", "setup_ksa_v2026.1.7.3270.exe", null, null, null, null],
    [86, 3279, "2026-01-22", "setup_ksa_v2026.1.8.3279.exe", null, null, null, null],
    [87, 3293, "2026-01-23", "setup_ksa_v2026.1.9.3293.exe", null, null, null, null],
    [88, 3299, "2026-01-25", "setup_ksa_v2026.1.4.3299.exe", null, null, null, null],
    [89, 3309, "2026-01-27", "setup_ksa_v2026.1.5.3309.exe", null, null, null, null],
    [90, 3329, "2026-01-29", "setup_ksa_v2026.1.6.3329.exe", null, null, null, null],
    [91, 3335, "2026-01-30", "setup_ksa_v2026.1.3.3335.exe", null, null, null, null],
    [92, 3345, "2026-01-30", "setup_ksa_v2026.1.4.3345.exe", null, null, null, null],
    [93, 3353, "2026-01-30", "setup_ksa_v2026.1.10.3353.exe", null, null, null, null],
    [94, 3384, "2026-02-03", "setup_ksa_v2026.2.2.3384.exe", null, null, null, null],
    [95, 3396, "2026-02-04", "setup_ksa_v2026.2.2.3396.exe", null, null, null, null],
    [96, 3419, "2026-02-06", "setup_ksa_v2026.2.3.3419.exe", null, null, null, null],
    [97, 3423, "2026-02-06", "setup_ksa_v2026.2.4.3423.exe", null, null, null, null],
    [98, 3428, "2026-02-08", "setup_ksa_v2026.2.5.3428.exe", null, null, null, null],
    [99, 3454, "2026-02-09", "setup_ksa_v2026.2.6.3454.exe", null, null, null, null],
    [100, 3473, "2026-02-10", "setup_ksa_v2026.2.7.3473.exe", null, null, null, null],
    [101, 3529, "2026-02-13", "setup_ksa_v2026.2.9.3529.exe", null, null, null, null],
    [102, 3538, "2026-02-14", "setup_ksa_v2026.2.10.3538.exe", null, null, null, null],
    [103, 3549, "2026-02-16", "setup_ksa_v2026.2.3.3549.exe", null, null, null, null],
    [104, 3563, "2026-02-17", "setup_ksa_v2026.2.5.3563.exe", null, null, null, null],
    [105, 3592, "2026-02-18", "setup_ksa_v2026.2.11.3592.exe", null, null, null, null],
    [106, 3622, "2026-02-19", "setup_ksa_v2026.2.18.3622.exe", null, "setup_ksa_v2026.2.18.3622.tar", null, "first linux build"],
    [107, 3638, "2026-02-20", "setup_ksa_v2026.2.30.3638.exe", null, "setup_ksa_v2026.2.30.3638.tar.gz", null, null],
    [108, 3640, "2026-02-20", null, null, "setup_ksa_v2026.2.31.3640.tar.gz", null, "no windows build due to linux needing an immediate rebuild"],
    [109, 3646, "2026-02-21", "setup_ksa_v2026.2.32.3646.exe", null, "setup_ksa_v2026.2.32.3646.tar.gz", null, null],
    [110, 3656, "2026-02-23", "setup_ksa_v2026.2.34.3656.exe", null, "setup_ksa_v2026.2.34.3656.tar.gz", null, null],
    [111, 3667, "2026-02-24", "setup_ksa_v2026.2.35.3667.exe", null, "setup_ksa_v2026.2.35.3667.tar.gz", null, null],
    [112, 3695, "2026-02-26", "setup_ksa_v2026.2.36.3695.exe", null, "setup_ksa_v2026.2.36.3695.tar.gz", null, null],
    [113, 3699, "2026-02-26", "setup_ksa_v2026.2.37.3699.exe", null, "setup_ksa_v2026.2.37.3699.tar.gz", null, null],
    [114, 3713, "2026-02-27", "setup_ksa_v2026.2.38.3713.exe", null, "setup_ksa_v2026.2.38.3713.tar.gz", null, null],
    [115, 3736, "2026-03-03", "setup_ksa_v2026.3.2.3736.exe", null, "setup_ksa_v2026.3.2.3736.tar.gz", null, null],
    [116, 3759, "2026-03-05", "setup_ksa_v2026.3.3.3759.exe", null, "setup_ksa_v2026.3.3.3759.tar.gz", null, null],
    [117, 3775, "2026-03-09", "setup_ksa_v2026.3.5.3775.exe", null, "setup_ksa_v2026.3.5.3775.tar.gz", null, null],
    [118, 3818, "2026-03-14", "setup_ksa_v2026.3.6.3818.exe", null, "setup_ksa_v2026.3.6.3818.tar.gz", null, null],
    [119, 3848, "2026-03-18", "setup_ksa_v2026.3.7.3848.exe", null, "setup_ksa_v2026.3.7.3848.tar.gz", null, null],
    [120, 3883, "2026-03-24", "setup_ksa_v2026.3.8.3883.exe", null, "setup_ksa_v2026.3.8.3883.tar.gz", null, null],
    [121, 3904, "2026-03-27", "setup_ksa_v2026.3.9.3904.exe", null, "setup_ksa_v2026.3.9.3904.tar.gz", null, null],
    [122, 3916, "2026-03-28", "setup_ksa_v2026.3.11.3916.exe", null, "setup_ksa_v2026.3.11.3916.tar.gz", null, null],
    [123, 3942, "2026-04-01", "setup_ksa_v2026.4.2.3942.exe", null, "setup_ksa_v2026.4.2.3942.tar.gz", null, null],
    [124, 3957, "2026-04-03", "setup_ksa_v2026.4.3.3957.exe", null, "setup_ksa_v2026.4.3.3957.tar.gz", null, null],
    [125, 3969, "2026-04-05", "setup_ksa_v2026.4.4.3969.exe", null, "setup_ksa_v2026.4.4.3969.tar.gz", null, null],
    [126, 3999, "2026-04-07", "setup_ksa_v2026.4.5.3999.exe", null, "setup_ksa_v2026.4.5.3999.tar.gz", null, null],
    [127, 4036, "2026-04-09", "setup_ksa_v2026.4.6.4036.exe", null, "setup_ksa_v2026.4.6.4036.tar.gz", null, null],
    [128, 4057, "2026-04-10", "setup_ksa_v2026.4.10.4057.exe", null, "setup_ksa_v2026.4.10.4057.tar.gz", null, null],
    [129, 4082, "2026-04-14", "setup_ksa_v2026.4.13.4082.exe", null, "setup_ksa_v2026.4.13.4082.tar.gz", null, null],
    [130, 4100, "2026-04-15", "setup_ksa_v2026.4.14.4100.exe", null, "setup_ksa_v2026.4.14.4100.tar.gz", null, null],
    [131, 4141, "2026-04-17", "setup_ksa_v2026.4.15.4141.exe", null, "setup_ksa_v2026.4.15.4141.tar.gz", null, null],
    [132, 4170, "2026-04-21", "setup_ksa_v2026.4.16.4170.exe", null, "setup_ksa_v2026.4.16.4170.tar.gz", null, null],
    [133, 4184, "2026-04-23", "setup_ksa_v2026.4.17.4184.exe", null, "setup_ksa_v2026.4.17.4184.tar.gz", null, null],
    [134, 4206, "2026-04-28", "setup_ksa_v2026.4.18.4206.exe", null, "setup_ksa_v2026.4.18.4206.tar.gz", null, null],
    [135, 4264, "2026-05-04", "setup_ksa_v2026.5.3.4264.exe", null, "setup_ksa_v2026.5.3.4264.tar.gz", null, null],
    [136, 4304, "2026-05-05", "setup_ksa_v2026.5.5.4304.exe", null, "setup_ksa_v2026.5.5.4304.tar.gz", null, null],
    [137, 4337, "2026-05-08", "setup_ksa_v2026.5.6.4337.exe", null, "setup_ksa_v2026.5.6.4337.tar.gz", null, null],
    [138, 4397, "2026-05-15", "setup_ksa_v2026.5.7.4397.exe", null, "setup_ksa_v2026.5.7.4397.tar.gz", null, null],
    [139, 4424, "2026-05-19", "setup_ksa_v2026.5.10.4424.exe", null, "setup_ksa_v2026.5.10.4424.tar.gz", null, null],
];

const builds: Build[] = buildTuples.map(buildFromTuple);

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

function renderBuildRow(build: Build): HTMLTableRowElement
{
    const {increment, version, date, winFile, winHash, linuxFile, linuxHash, comment} = build;

    const tr = document.createElement("tr");

    if (!winFile && !linuxFile)
    {
        tr.classList.add("missing");
    }

    tr.innerHTML = `
        <td class="ver-num">${version}</td>
        <td class="build-num">${increment}</td>
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