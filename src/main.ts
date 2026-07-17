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
    version: number,
    date: string,
    winFile: string | null,
    winHash: string | null,
    linuxFile: string | null,
    linuxHash: string | null,
    comment: string | null,
];

function buildFromTuple([version, date, winFile, winHash, linuxFile, linuxHash, comment]: BuildTuple, index: number): Build
{
    return {increment: index + 1, version, date, winFile, winHash, linuxFile, linuxHash, comment};
}

const buildTuples: BuildTuple[] = [
    [1231, "2025-04-17", "KSA v2025.4.100.1231.zip", null, null, null, ""],
    [1276, "2025-05-01", "KSA_v2025.5.103.1276.zip", null, null, null, ""],
    [1396, "2025-05-25", "KSA_v2025.5.1281.1396.zip", null, null, null, ""],
    [1455, "2025-06-05", "setup_ksa_v2025.6.42.1455.exe", null, null, null, ""],
    [1459, "2025-06-05", "setup_ksa_v2025.6.56.1459.exe", null, null, null, ""],
    [1461, "2025-06-05", "setup_ksa_v2025.6.62.1461.exe", null, null, null, ""],
    [1465, "2025-06-05", "setup_ksa_v2025.6.78.1465.exe", null, null, null, ""],
    [1467, "2025-06-05", "setup_ksa_v2025.6.92.1467.exe", null, null, null, ""],
    [1486, "2025-06-08", "setup_ksa_v2025.6.126.1486.exe", null, null, null, ""],
    [1514, "2025-06-10", "setup_ksa_v2025.6.198.1514.exe", null, null, null, ""],
    [1522, "2025-06-10", "setup_ksa_v2025.6.245.1522.exe", null, null, null, ""],
    [1535, "2025-06-11", "setup_ksa_v2025.6.280.1535.exe", null, null, null, ""],
    [1556, "2025-06-11", "setup_ksa_v2025.6.397.1556.exe", null, null, null, ""],
    [1611, "2025-06-18", "setup_ksa_v2025.6.1011.1611.exe", null, null, null, ""],
    [1614, "2025-06-18", "setup_ksa_v2025.6.586.1614.exe", null, null, null, ""],
    [1616, "2025-06-18", "setup_ksa_v2025.6.606.1616.exe", null, null, null, ""],
    [1634, "2025-06-21", "setup_ksa_v2025.6.1241.1634.exe", null, null, null, ""],
    [1640, "2025-06-23", "setup_ksa_v2025.6.1248.1640.exe", null, null, null, ""],
    [1654, "2025-06-24", "setup_ksa_v2025.6.968.1654.exe", null, null, null, ""],
    [1702, "2025-06-25", "setup_ksa_v2025.6.1018.1702.exe", null, null, null, ""],
    [1705, "2025-06-26", "setup_ksa_v2025.6.1403.1705.exe", null, null, null, ""],
    [1757, "2025-07-01", "setup_ksa_v2025.7.54.1757.exe", null, null, null, ""],
    [1820, "2025-07-03", "setup_ksa_v2025.7.347.1820.exe", null, null, null, ""],
    [1910, "2025-07-18", "setup_ksa_v2025.7.417.1910.exe", null, null, null, ""],
    [1946, "2025-07-25", "setup_ksa_v2025.7.367.1946.exe", null, null, null, ""],
    [2008, "2025-08-05", "setup_ksa_v2025.8.19.2008.exe", null, null, null, ""],
    [2019, "2025-08-09", "setup_ksa_v2025.8.6.2019.exe", null, null, null, ""],
    [2064, "2025-08-14", "setup_ksa_v2025.8.13.2064.exe", null, null, null, ""],
    [2067, "2025-08-14", "setup_ksa_v2025.8.18.2067.exe", null, null, null, ""],
    [2072, "2025-08-14", "setup_ksa_v2025.8.32.2072.exe", null, null, null, ""],
    [2075, "2025-08-15", "setup_ksa_v2025.8.38.2075.exe", null, null, null, ""],
    [2076, "2025-08-15", "setup_ksa_v2025.8.43.2076.exe", null, null, null, "first build(?)"],
    [2088, "2025-08-18", "setup_ksa_v2025.8.17.2088.exe", null, null, null, null],
    [2091, "2025-08-18", "setup_ksa_v2025.8.33.2091.exe", null, null, null, null],
    [2101, "2025-08-19", "setup_ksa_v2025.8.59.2101.exe", null, null, null, null],
    [2108, "2025-08-19", "setup_ksa_v2025.8.86.2108.exe", null, null, null, null],
    [2112, "2025-08-19", "setup_ksa_v2025.8.100.2112.exe", null, null, null, null],
    [2121, "2025-08-20", "setup_ksa_v2025.8.282.2121.exe", null, null, null, null],
    [2125, "2025-08-20", "setup_ksa_v2025.8.14.2125.exe", null, null, null, null],
    [2133, "2025-08-21", "setup_ksa_v2025.8.19.2133.exe", null, null, null, null],
    [2136, "2025-08-21", "setup_ksa_v2025.8.20.2136.exe", null, null, null, null],
    [2163, "2025-08-22", "setup_ksa_v2025.8.285.2163.exe", null, null, null, null],
    [2167, "2025-08-23", "setup_ksa_v2025.8.21.2167.exe", null, null, null, null],
    [2169, "2025-08-24", "setup_ksa_v2025.8.22.2169.exe", null, null, null, null],
    [2171, "2025-08-25", "setup_ksa_v2025.8.287.2171.exe", null, null, null, null],
    [2181, "2025-08-25", "setup_ksa_v2025.8.288.2181.exe", null, null, null, null],
    [2197, "2025-08-26", "setup_ksa_v2025.8.23.2197.exe", null, null, null, null],
    [2212, "2025-08-27", "setup_ksa_v2025.8.289.2212.exe", null, null, null, null],
    [2234, "2025-08-28", "setup_ksa_v2025.8.292.2234.exe", null, null, null, null],
    [2250, "2025-08-29", "setup_ksa_v2025.8.293.2250.exe", null, null, null, null],
    [2252, "2025-08-29", "setup_ksa_v2025.8.294.2252.exe", null, null, null, null],
    [2263, "2025-08-30", "setup_ksa_v2025.8.24.2263.exe", null, null, null, null],
    [2270, "2025-09-01", "setup_ksa_v2025.9.2.2270.exe", null, null, null, null],
    [2279, "2025-09-02", "setup_ksa_v2025.9.3.2279.exe", null, null, null, null],
    [2290, "2025-09-03", "setup_ksa_v2025.9.4.2290.exe", null, null, null, null],
    [2298, "2025-09-04", "setup_ksa_v2025.9.5.2298.exe", null, null, null, null],
    [2300, "2025-09-04", "setup_ksa_v2025.9.2.2300.exe", null, null, null, null],
    [2317, "2025-09-05", "setup_ksa_v2025.9.6.2317.exe", null, null, null, null],
    [2336, "2025-09-09", "setup_ksa_v2025.9.8.2336.exe", null, null, null, null],
    [2364, "2025-09-12", "setup_ksa_v2025.9.9.2364.exe", null, null, null, null],
    [2376, "2025-09-15", "setup_ksa_v2025.9.10.2376.exe", null, null, null, null],
    [2383, "2025-09-17", "setup_ksa_v2025.9.2.2383.exe", null, null, null, null],
    [2399, "2025-09-18", "setup_ksa_v2025.9.12.2399.exe", null, null, null, null],
    [2404, "2025-09-19", "setup_ksa_v2025.9.3.2404.exe", null, null, null, null],
    [2415, "2025-09-23", "setup_ksa_v2025.9.13.2415.exe", null, null, null, null],
    [2429, "2025-09-26", "setup_ksa_v2025.9.4.2429.exe", null, null, null, null],
    [2441, "2025-09-29", "setup_ksa_v2025.9.5.2441.exe", null, null, null, null],
    [2476, "2025-10-09", "setup_ksa_v2025.10.5.2476.exe", null, null, null, null],
    [2497, "2025-10-10", "setup_ksa_v2025.10.6.2497.exe", null, null, null, null],
    [2502, "2025-10-14", "setup_ksa_v2025.10.8.2502.exe", null, null, null, null],
    [2530, "2025-10-21", "setup_ksa_v2025.10.10.2530.exe", null, null, null, null],
    [2540, "2025-10-23", "setup_ksa_v2025.10.11.2540.exe", null, null, null, null],
    [2547, "2025-10-24", "setup_ksa_v2025.10.12.2547.exe", null, null, null, null],
    [2554, "2025-10-28", "setup_ksa_v2025.10.13.2554.exe", null, null, null, null],
    [2573, "2025-10-29", "setup_ksa_v2025.10.5.2573.exe", null, null, null, null],
    [2584, "2025-10-30", "setup_ksa_v2025.10.6.2584.exe", null, null, null, null],
    [2613, "2025-10-31", "setup_ksa_v2025.10.10.2613.exe", null, null, null, null],
    [2620, "2025-11-02", "setup_ksa_v2025.11.2.2620.exe", null, null, null, null],
    [2634, "2025-11-03", "setup_ksa_v2025.11.3.2634.exe", null, null, null, null],
    [2742, "2025-11-12", "setup_ksa_v2025.11.4.2742.exe", null, null, null, null],
    [2781, "2025-11-13", "setup_ksa_v2025.11.2.2781.exe", null, null, null, null],
    [2789, "2025-11-14", "setup_ksa_v2025.11.3.2789.exe", null, null, null, "Thank you very much terra.incognita_!"],
    [2791, "2025-11-14", "setup_ksa_v2025.11.4.2791.exe", null, null, null, "first really public build"],
    [2819, "2025-11-17", "setup_ksa_v2025.11.5.2819.exe", null, null, null, null],
    [2829, "2025-11-19", "setup_ksa_v2025.11.6.2829.exe", null, null, null, null],
    [2844, "2025-11-20", "setup_ksa_v2025.11.7.2844.exe", null, null, null, null],
    [2847, "2025-11-24", "setup_ksa_v2025.11.8.2847.exe", null, null, null, null],
    [2894, "2025-11-24", "setup_ksa_v2025.11.9.2894.exe", null, null, null, null],
    [2897, "2025-11-24", "setup_ksa_v2025.11.5.2897.exe", null, null, null, null],
    [2915, "2025-11-25", "setup_ksa_v2025.11.10.2915.exe", null, null, null, null],
    [2924, "2025-11-26", "setup_ksa_v2025.11.11.2924.exe", null, null, null, null],
    [2939, "2025-11-27", "setup_ksa_v2025.11.6.2939.exe", null, null, null, null],
    [2945, "2025-11-28", "setup_ksa_v2025.11.8.2945.exe", null, null, null, null],
    [2971, "2025-12-02", "setup_ksa_v2025.12.3.2971.exe", null, null, null, null],
    [2976, "2025-12-02", "setup_ksa_v2025.12.5.2976.exe", null, null, null, null],
    [2991, "2025-12-03", "setup_ksa_v2025.12.2.2991.exe", null, null, null, null],
    [2994, "2025-12-03", "setup_ksa_v2025.12.13.2994.exe", null, null, null, null],
    [3000, "2025-12-04", "setup_ksa_v2025.12.14.3000.exe", null, null, null, null],
    [3011, "2025-12-05", "setup_ksa_v2025.12.6.3011.exe", null, null, null, null],
    [3014, "2025-12-05", "setup_ksa_v2025.12.24.3014.exe", null, null, null, null],
    [3030, "2025-12-09", "setup_ksa_v2025.12.8.3030.exe", null, null, null, null],
    [3041, "2025-12-10", "setup_ksa_v2025.12.9.3041.exe", null, null, null, null],
    [3047, "2025-12-11", "setup_ksa_v2025.12.25.3047.exe", null, null, null, null],
    [3057, "2025-12-12", "setup_ksa_v2025.12.10.3057.exe", null, null, null, null],
    [3072, "2025-12-15", "setup_ksa_v2025.12.27.3072.exe", null, null, null, null],
    [3082, "2025-12-16", "setup_ksa_v2025.12.11.3082.exe", null, null, null, null],
    [3097, "2025-12-17", "setup_ksa_v2025.12.29.3097.exe", null, null, null, null],
    [3103, "2025-12-17", "setup_ksa_v2025.12.31.3103.exe", null, null, null, null],
    [3123, "2025-12-23", "setup_ksa_v2025.12.33.3123.exe", null, null, null, null],
    [3181, "2026-01-08", "setup_ksa_v2026.1.2.3181.exe", null, null, null, null],
    [3194, "2026-01-09", "setup_ksa_v2026.1.3.3194.exe", null, null, null, null],
    [3232, "2026-01-16", "setup_ksa_v2026.1.2.3232.exe", null, null, null, "Thank you very much terra.incognita_!"],
    [3233, "2026-01-16", "setup_ksa_v2026.1.4.3233.exe", null, null, null, null],
    [3249, "2026-01-19", "setup_ksa_v2026.1.5.3249.exe", null, null, null, null],
    [3270, "2026-01-21", "setup_ksa_v2026.1.7.3270.exe", null, null, null, null],
    [3279, "2026-01-22", "setup_ksa_v2026.1.8.3279.exe", null, null, null, null],
    [3293, "2026-01-23", "setup_ksa_v2026.1.9.3293.exe", null, null, null, null],
    [3299, "2026-01-25", "setup_ksa_v2026.1.4.3299.exe", null, null, null, null],
    [3309, "2026-01-27", "setup_ksa_v2026.1.5.3309.exe", null, null, null, null],
    [3329, "2026-01-29", "setup_ksa_v2026.1.6.3329.exe", null, null, null, null],
    [3335, "2026-01-30", "setup_ksa_v2026.1.3.3335.exe", null, null, null, null],
    [3345, "2026-01-30", "setup_ksa_v2026.1.4.3345.exe", null, null, null, null],
    [3353, "2026-01-30", "setup_ksa_v2026.1.10.3353.exe", null, null, null, null],
    [3384, "2026-02-03", "setup_ksa_v2026.2.2.3384.exe", null, null, null, null],
    [3396, "2026-02-04", "setup_ksa_v2026.2.2.3396.exe", null, null, null, null],
    [3419, "2026-02-06", "setup_ksa_v2026.2.3.3419.exe", null, null, null, null],
    [3423, "2026-02-06", "setup_ksa_v2026.2.4.3423.exe", null, null, null, null],
    [3428, "2026-02-08", "setup_ksa_v2026.2.5.3428.exe", null, null, null, null],
    [3454, "2026-02-09", "setup_ksa_v2026.2.6.3454.exe", null, null, null, null],
    [3473, "2026-02-10", "setup_ksa_v2026.2.7.3473.exe", null, null, null, null],
    [3529, "2026-02-13", "setup_ksa_v2026.2.9.3529.exe", null, null, null, null],
    [3538, "2026-02-14", "setup_ksa_v2026.2.10.3538.exe", null, null, null, null],
    [3549, "2026-02-16", "setup_ksa_v2026.2.3.3549.exe", null, null, null, null],
    [3563, "2026-02-17", "setup_ksa_v2026.2.5.3563.exe", null, null, null, null],
    [3592, "2026-02-18", "setup_ksa_v2026.2.11.3592.exe", null, null, null, null],
    [3608, "2026-02-19", null, null, "ksa-linux-x64_v2026.2.8.3608.tar", null, "first linux build"],
    [3622, "2026-02-19", "setup_ksa_v2026.2.18.3622.exe", null, "setup_ksa_v2026.2.18.3622.tar", null, "first public(?) linux build"],
    [3638, "2026-02-20", "setup_ksa_v2026.2.30.3638.exe", null, "setup_ksa_v2026.2.30.3638.tar.gz", null, null],
    [3640, "2026-02-20", null, null, "setup_ksa_v2026.2.31.3640.tar.gz", null, "no windows build due to linux needing an immediate rebuild"],
    [3646, "2026-02-21", "setup_ksa_v2026.2.32.3646.exe", null, "setup_ksa_v2026.2.32.3646.tar.gz", null, null],
    [3656, "2026-02-23", "setup_ksa_v2026.2.34.3656.exe", null, "setup_ksa_v2026.2.34.3656.tar.gz", null, null],
    [3667, "2026-02-24", "setup_ksa_v2026.2.35.3667.exe", null, "setup_ksa_v2026.2.35.3667.tar.gz", null, null],
    [3695, "2026-02-26", "setup_ksa_v2026.2.36.3695.exe", null, "setup_ksa_v2026.2.36.3695.tar.gz", null, null],
    [3699, "2026-02-26", "setup_ksa_v2026.2.37.3699.exe", null, "setup_ksa_v2026.2.37.3699.tar.gz", null, null],
    [3713, "2026-02-27", "setup_ksa_v2026.2.38.3713.exe", null, "setup_ksa_v2026.2.38.3713.tar.gz", null, null],
    [3736, "2026-03-03", "setup_ksa_v2026.3.2.3736.exe", null, "setup_ksa_v2026.3.2.3736.tar.gz", null, null],
    [3759, "2026-03-05", "setup_ksa_v2026.3.3.3759.exe", null, "setup_ksa_v2026.3.3.3759.tar.gz", null, null],
    [3775, "2026-03-09", "setup_ksa_v2026.3.5.3775.exe", null, "setup_ksa_v2026.3.5.3775.tar.gz", null, null],
    [3818, "2026-03-14", "setup_ksa_v2026.3.6.3818.exe", null, "setup_ksa_v2026.3.6.3818.tar.gz", null, null],
    [3848, "2026-03-18", "setup_ksa_v2026.3.7.3848.exe", null, "setup_ksa_v2026.3.7.3848.tar.gz", null, null],
    [3883, "2026-03-24", "setup_ksa_v2026.3.8.3883.exe", null, "setup_ksa_v2026.3.8.3883.tar.gz", null, null],
    [3904, "2026-03-27", "setup_ksa_v2026.3.9.3904.exe", null, "setup_ksa_v2026.3.9.3904.tar.gz", null, null],
    [3916, "2026-03-28", "setup_ksa_v2026.3.11.3916.exe", null, "setup_ksa_v2026.3.11.3916.tar.gz", null, null],
    [3942, "2026-04-01", "setup_ksa_v2026.4.2.3942.exe", null, "setup_ksa_v2026.4.2.3942.tar.gz", null, null],
    [3957, "2026-04-03", "setup_ksa_v2026.4.3.3957.exe", null, "setup_ksa_v2026.4.3.3957.tar.gz", null, null],
    [3969, "2026-04-05", "setup_ksa_v2026.4.4.3969.exe", null, "setup_ksa_v2026.4.4.3969.tar.gz", null, null],
    [3999, "2026-04-07", "setup_ksa_v2026.4.5.3999.exe", null, "setup_ksa_v2026.4.5.3999.tar.gz", null, null],
    [4036, "2026-04-09", "setup_ksa_v2026.4.6.4036.exe", null, "setup_ksa_v2026.4.6.4036.tar.gz", null, null],
    [4057, "2026-04-10", "setup_ksa_v2026.4.10.4057.exe", null, "setup_ksa_v2026.4.10.4057.tar.gz", null, null],
    [4082, "2026-04-14", "setup_ksa_v2026.4.13.4082.exe", null, "setup_ksa_v2026.4.13.4082.tar.gz", null, null],
    [4100, "2026-04-15", "setup_ksa_v2026.4.14.4100.exe", null, "setup_ksa_v2026.4.14.4100.tar.gz", null, null],
    [4141, "2026-04-17", "setup_ksa_v2026.4.15.4141.exe", null, "setup_ksa_v2026.4.15.4141.tar.gz", null, null],
    [4170, "2026-04-21", "setup_ksa_v2026.4.16.4170.exe", null, "setup_ksa_v2026.4.16.4170.tar.gz", null, null],
    [4184, "2026-04-23", "setup_ksa_v2026.4.17.4184.exe", null, "setup_ksa_v2026.4.17.4184.tar.gz", null, null],
    [4206, "2026-04-28", "setup_ksa_v2026.4.18.4206.exe", null, "setup_ksa_v2026.4.18.4206.tar.gz", null, null],
    [4264, "2026-05-04", "setup_ksa_v2026.5.3.4264.exe", null, "setup_ksa_v2026.5.3.4264.tar.gz", null, null],
    [4304, "2026-05-05", "setup_ksa_v2026.5.5.4304.exe", null, "setup_ksa_v2026.5.5.4304.tar.gz", null, null],
    [4337, "2026-05-08", "setup_ksa_v2026.5.6.4337.exe", null, "setup_ksa_v2026.5.6.4337.tar.gz", null, null],
    [4397, "2026-05-15", "setup_ksa_v2026.5.7.4397.exe", null, "setup_ksa_v2026.5.7.4397.tar.gz", null, null],
    [4424, "2026-05-19", "setup_ksa_v2026.5.10.4424.exe", null, "setup_ksa_v2026.5.10.4424.tar.gz", null, null],
    [4462, "2026-05-21", "setup_ksa_v2026.5.11.4462.exe", null, "setup_ksa_v2026.5.11.4462.tar.gz", null, null],
    [4510, "2026-05-29", "setup_ksa_v2026.5.12.4510.exe", null, "setup_ksa_v2026.5.12.4510.tar.gz", null, null],
    [4531, "2026-06-03", "setup_ksa_v2026.6.2.4531.exe", null, "setup_ksa_v2026.6.2.4531.tar.gz", null, null],
    [4568, "2026-06-08", "setup_ksa_v2026.6.3.4568.exe", null, "setup_ksa_v2026.6.3.4568.tar.gz", null, null],
    [4601, "2026-06-11", "setup_ksa_v2026.6.6.4601.exe", null, "setup_ksa_v2026.6.6.4601.tar.gz", null, null],
    [4631, "2026-06-16", "setup_ksa_v2026.6.7.4631.exe", null, "setup_ksa_v2026.6.7.4631.tar.gz", null, null],
    [4680, "2026-06-19", "setup_ksa_v2026.6.8.4680.exe", null, "setup_ksa_v2026.6.8.4680.tar.gz", null, null],
    [4750, "2026-06-27", "setup_ksa_v2026.6.9.4750.exe", null, "setup_ksa_v2026.6.9.4750.tar.gz", null, null],
    [4824, "2026-07-03", "setup_ksa_v2026.7.2.4824.exe", null, "setup_ksa_v2026.7.2.4824.tar.gz", null, null],
    [4826, "2026-07-03", "setup_ksa_v2026.7.3.4826.exe", null, "setup_ksa_v2026.7.3.4826.tar.gz", null, null],
    [4860, "2026-07-08", "setup_ksa_v2026.7.4.4860.exe", null, "setup_ksa_v2026.7.4.4860.tar.gz", null, null],
    [4892, "2026-07-11", "setup_ksa_v2026.7.5.4892.exe", null, "setup_ksa_v2026.7.5.4892.tar.gz", null, null],
    [4939, "2026-07-16", "setup_ksa_v2026.7.6.4939.exe", null, "setup_ksa_v2026.7.6.4939.tar.gz", null, null],
];

const builds: Build[] = buildTuples.map(buildFromTuple);
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