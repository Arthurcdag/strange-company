const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const force = args.includes("--force");
const check = args.includes("--check");

function argValue(name) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? String(args[index + 1]) : "";
}

const outputPath = path.resolve(process.cwd(), argValue("--output") || path.join(root, ".public-site-build.local"));
const failures = [];
const REVIEW_DOCUMENT_PATHS = Object.freeze([
  "TERMOS.md",
  "TERMS.md",
  "AVISO_DE_PRIVACIDADE.md",
  "PRIVACY.md",
  "BRAZIL_COMPLIANCE.md",
  "BRAZIL_COMPLIANCE_AGENTS.md",
  "CONKA8_LAW_INSTRUCTIONS.md",
  "AI_LEGAL_HANDOFF.md",
  "HUMAN_REVIEW_PACKET.md",
]);

function fail(message) {
  failures.push(message);
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function assertSafeOutput(target) {
  const base = path.basename(target);
  const safeNamedBuild = isInside(root, target) && (base === "_site" || base === ".public-site-build.local");
  const safeTempBuild = isInside(os.tmpdir(), target);
  if (!safeNamedBuild && !safeTempBuild) {
    fail(`Refusing to build into unsafe output path: ${target}`);
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function resetDir(dir) {
  assertSafeOutput(dir);
  if (failures.length) {
    return;
  }
  if (fs.existsSync(dir)) {
    if (!force && !check) {
      fail(`Refusing to overwrite ${dir}. Pass --force to replace it.`);
      return;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
  ensureDir(dir);
}

function copyFile(relativeSource, relativeDest = relativeSource) {
  const source = path.join(root, relativeSource);
  const dest = path.join(outputPath, relativeDest);
  if (!fs.existsSync(source)) {
    fail(`Missing source file: ${relativeSource}`);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(source, dest);
}

function copyMarkdownDocs() {
  for (const entry of fs.readdirSync(root)) {
    if (entry.endsWith(".md") && !/^MEI_/i.test(entry)) {
      copyFile(entry);
    }
  }
}

function buildSite() {
  resetDir(outputPath);
  if (failures.length) {
    return;
  }

  copyFile("public.html", "index.html");
  for (const file of [
    "public.js",
    "public-config.js",
    "public-live-receipt.js",
    "public-ama-answers.js",
    "styles.css",
    "EXTERNAL_LIVE_PACKET.template.json",
    "PUBLIC_AMA_QUEUE.template.json",
    "PUBLIC_AMA_ANSWERS.template.json",
    "REVIEWER_CANDIDATE_TRACKER.template.json",
    "REVENUE_SETUP_EVIDENCE_INDEX.template.json",
    "LIVE_REVIEW_CLOSURE.template.json",
    "DELIVERY_REVIEW_CHECKLIST.template.json"
  ]) {
    copyFile(file);
  }
  copyMarkdownDocs();
  for (const file of [
    "tools/strange_research_gate.py",
    "tools/reactive_research_tools_cors.patch",
    "tools/google_apps_script_order_intake.gs",
    "tools/audit_evolution_log.js",
    "tools/evolution_goal_status.js",
    "tools/generate_evolution_next_packet.js",
    "tools/local_evidence_status.js",
    "tools/draft_live_review_closure.js",
    "tools/render_live_review_public_config_patch.js",
    "tools/export_public_live_receipt.js",
    "tools/draft_reviewer_candidate_tracker.js",
    "tools/draft_revenue_setup_evidence_index.js",
    "tools/draft_delivery_review_checklist.js",
    "tools/draft_public_ama_queue.js",
    "tools/export_public_ama_answers.js",
    "tools/validate_external_live_packet.js",
    "tools/validate_live_review_closure.js",
    "tools/validate_public_ama_queue.js",
    "tools/validate_reviewer_candidate_tracker.js",
    "tools/validate_revenue_setup_evidence_index.js",
    "tools/validate_delivery_review_checklist.js",
    "tools/build_public_site.js"
  ]) {
    copyFile(file);
  }
  fs.writeFileSync(path.join(outputPath, ".nojekyll"), "", "utf8");
}

function walkFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkFiles(full));
    } else {
      found.push(full);
    }
  }
  return found;
}

function assertReviewDocumentParity() {
  for (const documentPath of REVIEW_DOCUMENT_PATHS) {
    const sourcePath = path.join(root, documentPath);
    const bundledPath = path.join(outputPath, documentPath);
    if (!fs.existsSync(sourcePath) || !fs.existsSync(bundledPath)) {
      continue;
    }
    const sourceBytes = fs.readFileSync(sourcePath);
    const bundledBytes = fs.readFileSync(bundledPath);
    if (sourceBytes.length !== bundledBytes.length) {
      fail(
        `Public bundle reviewed document size mismatch for ${documentPath}: source=${sourceBytes.length}, bundle=${bundledBytes.length}.`
      );
      continue;
    }
    if (!sourceBytes.equals(bundledBytes)) {
      fail(`Public bundle reviewed document byte mismatch for ${documentPath}.`);
    }
  }
}

function assertBundledReceipt() {
  const publicConfig = path.join(outputPath, "public-config.js");
  const publicReceipt = path.join(outputPath, "public-live-receipt.js");
  if (!fs.existsSync(publicConfig) || !fs.existsSync(publicReceipt)) {
    return;
  }
  const result = spawnSync(process.execPath, [
    path.join(root, "tools", "export_public_live_receipt.js"),
    "--check-public-js",
    "--public-config",
    publicConfig,
    "--public-js",
    publicReceipt,
    "--document-root",
    outputPath,
  ], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    fail(
      `Public bundle receipt validation failed against bundled config and nine-document root${output ? `:\n${output}` : "."}`
    );
  }
}

function assertBundle() {
  for (const file of [
    "index.html",
    "public.js",
    "public-config.js",
    "public-live-receipt.js",
    "public-ama-answers.js",
    "styles.css",
    ...REVIEW_DOCUMENT_PATHS,
    "PUBLIC_AMA.md",
    "PUBLIC_AMA_QUEUE.template.json",
    "PUBLIC_AMA_ANSWERS.template.json",
    "DELIVERY_REVIEW_LOOP.md",
    "DELIVERY_REVIEW_CHECKLIST.template.json",
    "LIVE_REVIEW_CLOSURE.template.json",
    "EVOLUTION_LOG.md",
    "tools/audit_evolution_log.js",
    "tools/evolution_goal_status.js",
    "tools/generate_evolution_next_packet.js",
    "tools/local_evidence_status.js",
    "tools/validate_live_review_closure.js",
    "tools/render_live_review_public_config_patch.js",
    "tools/export_public_live_receipt.js",
    "tools/validate_delivery_review_checklist.js",
    "tools/export_public_ama_answers.js",
    "tools/build_public_site.js",
    ".nojekyll"
  ]) {
    if (!fs.existsSync(path.join(outputPath, file))) {
      fail(`Public bundle is missing ${file}.`);
    }
  }

  const index = fs.existsSync(path.join(outputPath, "index.html"))
    ? fs.readFileSync(path.join(outputPath, "index.html"), "utf8")
    : "";
  if (!index.includes('src="public-ama-answers.js"')) {
    fail("Public bundle index.html must load public-ama-answers.js.");
  }
  if (!index.includes('src="public-live-receipt.js"')) {
    fail("Public bundle index.html must load public-live-receipt.js.");
  }

  assertReviewDocumentParity();
  assertBundledReceipt();

  const forbidden = [
    /EXTERNAL_LIVE_PACKET\.local\.json/i,
    /REVENUE_SETUP_EVIDENCE_INDEX\.local\.json/i,
    /REVIEWER_CANDIDATE_TRACKER\.local\.json/i,
    /PUBLIC_AMA_QUEUE\.local\.json/i,
    /PUBLIC_AMA_ANSWERS\.local\.json/i,
    /DELIVERY_REVIEW_CHECKLIST\.local\.json/i,
    /EVOLUTION_NEXT_ACTION\.local\.md/i,
    /LIVE_REVIEW_CLOSURE\.local\.json/i,
    /^MEI_/i
  ];
  for (const filePath of walkFiles(outputPath)) {
    const relative = path.relative(outputPath, filePath).replace(/\\/g, "/");
    for (const pattern of forbidden) {
      if (pattern.test(relative)) {
        fail(`Public bundle includes forbidden local/private file: ${relative}`);
      }
    }
  }
}

buildSite();
if (check) {
  assertBundle();
}

if (failures.length) {
  console.error("Public site build failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${check ? "Public site build check passed" : "Public site built"}: ${outputPath}`);
