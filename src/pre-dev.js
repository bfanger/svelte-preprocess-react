import { execSync } from "child_process";
import fs from "fs";

// Repair the project if it's missing the .svelte-kit folder, which would result in:
// error TS5083: Cannot read file 'svelte-preprocess-react/.svelte-kit/tsconfig.json'.
if (!fs.existsSync(".svelte-kit")) {
  execSync("npx svelte-kit sync", { stdio: "inherit" });
}
