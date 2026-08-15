#!/usr/bin/env bash
# Validate public/builds.json against its schema, then HEAD any newly added
# (or retargeted) build files on R2.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

BUILDS_JSON="${BUILDS_JSON:-public/builds.json}"
SCHEMA_JSON="${SCHEMA_JSON:-public/builds.schema.json}"
R2_BASE_URL="${R2_BASE_URL:-https://files.ksa-archive.net/builds}"
CURL_MAX_TIME="${CURL_MAX_TIME:-20}"
ZERO_SHA="0000000000000000000000000000000000000000"

errors=0

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "error: required command not found: $1" >&2
    exit 1
  fi
}

# GitHub workflow-command escape: % \r \n
escape_gha() {
  local s="$1"
  s="${s//'%'/'%25'}"
  s="${s//$'\r'/'%0D'}"
  s="${s//$'\n'/'%0A'}"
  printf '%s' "$s"
}

emit_error() {
  local file="$1"
  local msg="$2"
  echo "error: ${msg}" >&2
  if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
    echo "::error file=$(escape_gha "${file}")::$(escape_gha "${msg}")"
  fi
  errors=$((errors + 1))
}

emit_notice() {
  local msg="$1"
  echo "${msg}"
  if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
    echo "::notice::$(escape_gha "${msg}")"
  fi
}

validate_json() {
  local file="$1"
  local err
  if [[ ! -f "${file}" ]]; then
    emit_error "${file}" "${file} does not exist"
    return 1
  fi
  if ! err="$(jq empty "${file}" 2>&1)"; then
    emit_error "${file}" "${file} is not valid JSON: ${err}"
    return 1
  fi
}

require_cmd jq
require_cmd curl
require_cmd git

echo "==> Checking ${BUILDS_JSON} is valid JSON"
validate_json "${BUILDS_JSON}" || true

echo "==> Checking ${SCHEMA_JSON} is valid JSON"
validate_json "${SCHEMA_JSON}" || true

if [[ "${errors}" -ne 0 ]]; then
  echo "error: JSON parse failed; skipping schema and R2 checks" >&2
  exit 1
fi

echo "==> Validating ${BUILDS_JSON} against ${SCHEMA_JSON}"
schema_errors="$(
  jq -n -r \
    --arg file "${BUILDS_JSON}" \
    --slurpfile schema "${SCHEMA_JSON}" \
    --slurpfile data "${BUILDS_JSON}" \
    '
    def err($msg): $msg;

    def resolve_ref($root; $ref):
      reduce ($ref | ltrimstr("#/") | split("/"))[] as $p ($root; .[$p]);

    def check_constraints($schema; $path):
      . as $v
      | ($v | type) as $t
      | (
          if ($schema.type != null) and ($t != $schema.type) then
            err("\($path): expected type \($schema.type), got \($t) (\( $v | tojson ))")
          else empty end
        ),
        (
          if ($schema.minimum != null) and ($t == "number") and ($v < $schema.minimum) then
            err("\($path): must be >= \($schema.minimum), got \($v)")
          else empty end
        ),
        (
          if ($schema.pattern != null) and ($t == "string")
             and ($v | test($schema.pattern) | not) then
            err("\($path): expected to match /\($schema.pattern)/, got \( $v | tojson )")
          else empty end
        );

    def check_object($schema; $path):
      . as $obj
      | if ($obj | type) != "object" then
          err("\($path): expected object, got \($obj | type)")
        else
          (
            ($schema.required // [])[] as $req
            | if ($obj | has($req) | not) then
                err("\($path): missing required field \"\($req)\"")
              else empty end
          ),
          (
            ($schema.properties // {})
            | to_entries[]
            | .key as $k
            | .value as $ps
            | if $obj | has($k) then
                $obj[$k] | check_constraints($ps; "\($path).\($k)")
              else empty end
          )
        end;

    $schema[0] as $s
    | $data[0] as $d
    | (
        if ($s.type != null) and (($d | type) != $s.type) then
          err("\($file): expected a JSON \($s.type), got \($d | type)")
        else empty end
      ),
      (
        if ($d | type) == "array" and ($d | length) == 0 then
          err("\($file): must contain at least one build entry")
        else empty end
      ),
      (
        if ($d | type) == "array" then
          ($s.contains."$ref" // $s.items."$ref" // empty) as $ref
          | if $ref != null and $ref != "" then
              resolve_ref($s; $ref) as $def
              | $d
              | to_entries[]
              | .key as $i
              | .value
              | check_object($def; "\($file)[\($i)]")
            else empty end
        else empty end
      )
    '
)"

if [[ -n "${schema_errors}" ]]; then
  while IFS= read -r line; do
    [[ -z "${line}" ]] && continue
    emit_error "${BUILDS_JSON}" "${line}"
  done <<< "${schema_errors}"
fi

echo "==> Checking for duplicate versions"
dup_errors="$(
  jq -r --arg file "${BUILDS_JSON}" '
    to_entries
    | map(
        select(.value | type == "object" and has("version"))
        | {index: .key, version: .value.version}
      )
    | group_by(.version)
    | map(select(length > 1))
    | .[]
    | "\($file): duplicate version \(.[0].version) at indices \(map(.index | tostring) | join(", "))"
  ' "${BUILDS_JSON}"
)"

if [[ -n "${dup_errors}" ]]; then
  while IFS= read -r line; do
    [[ -z "${line}" ]] && continue
    emit_error "${BUILDS_JSON}" "${line}"
  done <<< "${dup_errors}"
fi

if [[ "${errors}" -ne 0 ]]; then
  echo "error: ${BUILDS_JSON} failed schema validation (${errors} error(s))" >&2
  exit 1
fi

count="$(jq 'length' "${BUILDS_JSON}")"
emit_notice "${BUILDS_JSON}: ${count} entries, schema OK"

if [[ "${SKIP_R2:-}" == "1" ]]; then
  emit_notice "Skipping R2 checks (SKIP_R2=1)"
  exit 0
fi

require_cmd git

# Historical locations, in order. The list used to live at src/builds.json.
base_path_candidates() {
  local path
  local seen="|"
  for path in "${BUILDS_JSON}" "public/builds.json" "src/builds.json"; do
    if [[ "${seen}" == *"|${path}|"* ]]; then
      continue
    fi
    seen+="${path}|"
    printf '%s\n' "${path}"
  done
}

ensure_commit() {
  local sha="$1"
  if git cat-file -e "${sha}^{commit}" 2>/dev/null; then
    return 0
  fi
  git fetch --no-tags --depth=1 origin "${sha}"
}

load_base_builds() {
  local sha="${1:-}"
  local path
  if [[ -z "${sha}" || "${sha}" == "${ZERO_SHA}" ]]; then
    return 1
  fi
  if ! ensure_commit "${sha}"; then
    return 1
  fi
  while IFS= read -r path; do
    if git cat-file -e "${sha}:${path}" 2>/dev/null; then
      if [[ "${path}" != "${BUILDS_JSON}" ]]; then
        echo "    note: ${sha} has ${path} (not ${BUILDS_JSON})" >&2
      fi
      git show "${sha}:${path}"
      return 0
    fi
  done < <(base_path_candidates)
  return 1
}

resolve_base_sha() {
  if [[ -n "${BASE_SHA:-}" && "${BASE_SHA}" != "${ZERO_SHA}" ]]; then
    printf '%s' "${BASE_SHA}"
    return 0
  fi
  if [[ -n "${GITHUB_BASE_REF:-}" ]]; then
    printf '%s' "origin/${GITHUB_BASE_REF}"
    return 0
  fi
  if git rev-parse --verify --quiet origin/main >/dev/null; then
    git rev-parse origin/main
    return 0
  fi
  return 1
}

echo "==> Finding added / retargeted builds"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "${tmp_dir}"' EXIT
base_file="${tmp_dir}/builds.base.json"

if [[ -n "${BASE_BUILDS_FILE:-}" ]]; then
  if [[ ! -f "${BASE_BUILDS_FILE}" ]]; then
    emit_error "${BASE_BUILDS_FILE}" "BASE_BUILDS_FILE does not exist: ${BASE_BUILDS_FILE}"
    exit 1
  fi
  cp "${BASE_BUILDS_FILE}" "${base_file}"
  echo "    comparing against ${BASE_BUILDS_FILE}"
else
  base_sha=""
  base_sha="$(resolve_base_sha || true)"
  if [[ -z "${base_sha}" ]]; then
    emit_error "${BUILDS_JSON}" "cannot determine a base revision to diff ${BUILDS_JSON} against, so added builds cannot be checked in R2"
    exit 1
  fi
  if ! load_base_builds "${base_sha}" > "${base_file}"; then
    emit_error "${BUILDS_JSON}" "unable to load ${BUILDS_JSON} from ${base_sha} to determine added builds"
    exit 1
  fi
  echo "    comparing against ${base_sha}"
fi

if ! jq empty "${base_file}" >/dev/null 2>&1; then
  emit_error "${BUILDS_JSON}" "base builds.json is not valid JSON; cannot diff added builds"
  exit 1
fi

# JSONL: {kind, version, field, filename}
checks_file="${tmp_dir}/r2-checks.jsonl"
missing_files_file="${tmp_dir}/added-without-files.txt"

jq -c --slurpfile old "${base_file}" '
  def nonempty($v):
    $v != null and $v != "";

  def files_for($build):
    (
      if nonempty($build.winFile) then
        {field: "winFile", filename: $build.winFile}
      else empty end
    ),
    (
      if nonempty($build.linuxFile) then
        {field: "linuxFile", filename: $build.linuxFile}
      else empty end
    );

  def by_version:
    map(select(type == "object" and has("version")) | {key: (.version | tostring), value: .})
    | from_entries;

  ($old[0] | if type == "array" then by_version else {} end) as $prev
  | (if type == "array" then . else [] end)[]
  | select(type == "object" and has("version"))
  | . as $b
  | ($b.version | tostring) as $k
  | if ($prev | has($k) | not) then
      [files_for($b)] as $files
      | if ($files | length) == 0 then
          {kind: "added-without-files", version: $b.version}
        else
          $files[] | {kind: "added", version: $b.version, field, filename}
        end
    else
      $prev[$k] as $o
      | (
          if nonempty($b.winFile) and $b.winFile != $o.winFile then
            {kind: "updated", version: $b.version, field: "winFile", filename: $b.winFile}
          else empty end
        ),
        (
          if nonempty($b.linuxFile) and $b.linuxFile != $o.linuxFile then
            {kind: "updated", version: $b.version, field: "linuxFile", filename: $b.linuxFile}
          else empty end
        )
    end
' "${BUILDS_JSON}" > "${checks_file}"

jq -r 'select(.kind == "added-without-files") | .version | tostring' "${checks_file}" \
  > "${missing_files_file}" || true

if [[ -s "${missing_files_file}" ]]; then
  while IFS= read -r version; do
    [[ -z "${version}" ]] && continue
    emit_error "${BUILDS_JSON}" \
      "added build version ${version} has no winFile or linuxFile, so it cannot be verified in R2"
  done < "${missing_files_file}"
fi

r2_checks="$(jq -c 'select(.kind == "added" or .kind == "updated")' "${checks_file}")"

if [[ -z "${r2_checks}" ]]; then
  emit_notice "No added or retargeted build files to check in R2"
  if [[ "${errors}" -ne 0 ]]; then
    exit 1
  fi
  exit 0
fi

added_versions="$(
  jq -r 'select(.kind == "added") | .version | tostring' "${checks_file}" | sort -u | tr '\n' ' ' | sed 's/[[:space:]]*$//'
)"
updated_versions="$(
  jq -r 'select(.kind == "updated") | .version | tostring' "${checks_file}" | sort -u | tr '\n' ' ' | sed 's/[[:space:]]*$//'
)"

if [[ -n "${added_versions}" ]]; then
  echo "    added versions: ${added_versions}"
fi
if [[ -n "${updated_versions}" ]]; then
  echo "    retargeted versions: ${updated_versions}"
fi

echo "==> Checking files exist in R2 (${R2_BASE_URL}/<version>/<filename>)"

while IFS= read -r row; do
  [[ -z "${row}" ]] && continue
  version="$(jq -r '.version' <<<"${row}")"
  field="$(jq -r '.field' <<<"${row}")"
  filename="$(jq -r '.filename' <<<"${row}")"
  kind="$(jq -r '.kind' <<<"${row}")"
  url="$(
    jq -nr \
      --arg base "${R2_BASE_URL}" \
      --arg v "${version}" \
      --arg f "${filename}" \
      '"\($base)/\($v)/\($f | @uri)"'
  )"

  code=""
  if ! code="$(
    curl -sS -o /dev/null -w '%{http_code}' \
      -I --globoff --max-time "${CURL_MAX_TIME}" --url "${url}"
  )"; then
    emit_error "${BUILDS_JSON}" \
      "${kind} build version ${version} ${field} \"${filename}\": failed to contact R2 at ${url}"
    continue
  fi

  case "${code}" in
    200)
      echo "    OK  ${version} ${field}  ${filename}"
      ;;
    404)
      emit_error "${BUILDS_JSON}" \
        "${kind} build version ${version} ${field} \"${filename}\" is not in R2 (HTTP 404). Upload it to ${R2_BASE_URL}/${version}/${filename} before merging."
      ;;
    *)
      emit_error "${BUILDS_JSON}" \
        "${kind} build version ${version} ${field} \"${filename}\": unexpected HTTP ${code} from ${url}"
      ;;
  esac
done <<< "${r2_checks}"

if [[ "${errors}" -ne 0 ]]; then
  echo "error: ${errors} validation error(s)" >&2
  exit 1
fi

emit_notice "R2 checks passed"
exit 0
