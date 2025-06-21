import fs from "fs/promises";
import path from "path";

export default async function detectReactVersion() {
  try {
    const pkg = await fs.readFile(path.resolve(process.cwd(), "package.json"));
    const json = JSON.parse(pkg.toString());
    const semver = json.devDependencies.react ?? json.dependencies.react;
    const match = /[^0-9]*([0-9]+)/.exec(`${semver}`);
    if (match) {
      return parseInt(match[1], 10);
    }
    throw new Error("No react in dependencies");
  } catch {
    console.warn('Could not detect React version. Assuming "react@18"');
    return 18;
  }
}
