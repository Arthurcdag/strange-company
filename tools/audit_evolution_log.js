const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const inputIndex = args.indexOf("--input");
const logPath = inputIndex >= 0 && args[inputIndex + 1]
  ? path.resolve(process.cwd(), args[inputIndex + 1])
  : path.join(root, "EVOLUTION_LOG.md");
const failures = [];

function fail(message) {
  failures.push(message);
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    fail(`could not read evolution log: ${error.message}`);
    return "";
  }
}

function sectionBlocks(text) {
  const matches = [...text.matchAll(/^##\s+(\d{4}-\d{2}-\d{2})\s+-\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const start = match.index || 0;
    const next = matches[index + 1];
    const end = next ? next.index || text.length : text.length;
    return {
      date: match[1],
      title: match[2].trim(),
      body: text.slice(start, end),
    };
  });
}

function hasBulletAfter(label, body) {
  const pattern = new RegExp(`${label}:\\s*\\n\\s*\\n(?:-\\s+.+\\n?)+`, "m");
  return pattern.test(body);
}

function includesHeading(label, body) {
  return new RegExp(`^${label}:`, "m").test(body);
}

function validatePublicSafety(text) {
  const requiredIntro = [
    "public-safe repo evolution passes",
    "not customer evidence",
    "Private/local evidence remains in ignored `*.local.json` files",
  ];
  for (const snippet of requiredIntro) {
    if (!text.includes(snippet)) {
      fail(`EVOLUTION_LOG.md is missing public-safety intro snippet: ${snippet}`);
    }
  }

  const forbiddenClaims = [
    /\b(liveMode\s*:\s*true|live mode is approved|launch approved|legal approval granted|tax approval granted|payment approval granted)\b/i,
    /\b(CPF|CNPJ|bank account|routing number|card number|private key|access token|password)\s*[:=]\s*\S+/i,
  ];
  for (const pattern of forbiddenClaims) {
    if (pattern.test(text)) {
      fail(`EVOLUTION_LOG.md contains a forbidden approval or private-data claim: ${pattern}`);
    }
  }
}

function validateSection(section) {
  if (!section.title) {
    fail(`${section.date} has an empty title.`);
  }
  for (const label of ["Objective", "Changed", "Verified with", "Result"]) {
    if (!includesHeading(label, section.body)) {
      fail(`${section.date} - ${section.title} is missing ${label}.`);
    }
  }
  if (!hasBulletAfter("Changed", section.body)) {
    fail(`${section.date} - ${section.title} must list changed artifacts.`);
  }
  if (!hasBulletAfter("Verified with", section.body)) {
    fail(`${section.date} - ${section.title} must list verification commands or checks.`);
  }
  if (!/Result:\s+\S+/m.test(section.body)) {
    fail(`${section.date} - ${section.title} must state a concrete result.`);
  }
}

const text = readText(logPath);
if (text) {
  validatePublicSafety(text);
  const sections = sectionBlocks(text);
  if (!sections.length) {
    fail("EVOLUTION_LOG.md must contain at least one dated evolution pass.");
  }
  for (const section of sections) {
    validateSection(section);
  }
}

if (failures.length) {
  console.error("Evolution log audit failed:");
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log(`Evolution log audit passed: ${path.relative(root, logPath) || logPath}`);
