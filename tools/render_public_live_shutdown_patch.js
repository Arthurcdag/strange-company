const args = process.argv.slice(2);
const asJson = args.includes("--json");
const unknownArgs = args.filter((arg) => arg !== "--json");

if (unknownArgs.length) {
  console.error(`Public live shutdown patch failed: unknown argument ${unknownArgs[0]}`);
  process.exit(1);
}

const plan = {
  system: "STRANGE_COMPANY_PUBLIC_LIVE_SHUTDOWN_PATCH",
  publicSafe: true,
  mutatesFiles: false,
  publicConfigPatch: {
    googleFormUrl: "",
    googleFormVerified: false,
    liveMode: false,
  },
  order: [
    "Disable external Google Form responses before applying this patch.",
    "Apply only the three publicConfigPatch values to public-config.js.",
    "Revoke public-live-receipt.js only after public-config.js is fail closed.",
    "Run the deployment preflight and publish the closed config and receipt together.",
  ],
  revokeCommand: "node tools/export_public_live_receipt.js --revoke --public-config public-config.js --output public-live-receipt.js",
  deploymentPreflightCommand: "node tools/preflight_public_launch.js --deployment",
};

if (asJson) {
  console.log(JSON.stringify(plan, null, 2));
} else {
  console.log(plan.system);
  console.log("Output only: no files were changed.");
  console.log("Disable external Google Form responses first, then apply:");
  console.log(JSON.stringify(plan.publicConfigPatch, null, 2));
  console.log(`Revoke: ${plan.revokeCommand}`);
  console.log(`Validate: ${plan.deploymentPreflightCommand}`);
}
