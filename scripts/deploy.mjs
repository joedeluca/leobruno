// npm run deploy                  build what's on GitHub's main at HEAD and put it live on the box
// npm run deploy -- --rollback    put the release before the live one back
// npm run deploy -- --build-only  only the build, HEAD as it is, nothing sent (a rehearsal)
//
// leobruno.it runs on the Bixinu box (Mythic Beasts, Amsterdam), beside Bixinu and sabotypist,
// as the `leobruno` user (deploy/), under /srv/leobruno. The release itself is
// deploy/release.mjs's; this is the site's part of it: the whole tree, the posts' history, and
// sharp for Linux.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { out, release, run } from "../deploy/release.mjs";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);

// What the site can't run without on the box; .env.box must have each.
const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY",
  "ICLOUD_APPLE_ID", "ICLOUD_EMAIL", "ICLOUD_APP_PASSWORD",
  "NEXT_PUBLIC_SITE_URL", "SITE_URL",
];

/** package.json's prebuild, which `next build` alone skips: each post's git history as JSON under
 *  public/history (components/ArticleTrace.tsx). The clean copy has no .git, so git is pointed at
 *  the repo's; with no work tree named, git takes the copy as the work tree, and the paths line up. */
function history(src) {
  run("node", ["scripts/generate-history.mjs"], { cwd: src, env: { ...process.env, GIT_DIR: path.join(ROOT, ".git") } });
}

/** Next copies the build machine's sharp (macOS); the box is Linux on x86-64. */
function linuxSharp(standalone, build) {
  const sharp = path.join(build, "node_modules", "sharp", "package.json");
  if (!fs.existsSync(path.join(standalone, "node_modules", "sharp"))) return;
  const optional = JSON.parse(fs.readFileSync(sharp, "utf8")).optionalDependencies ?? {};
  const imgDir = path.join(standalone, "node_modules", "@img");
  // Only the platform binaries go; @img also holds sharp's plain-JS helpers (@img/colour).
  for (const dir of fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [])
    if (/^sharp-(libvips-)?(darwin|linux|linuxmusl|win32)-/.test(dir)) fs.rmSync(path.join(imgDir, dir), { recursive: true });
  fs.mkdirSync(imgDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "leobruno-sharp-"));
  for (const name of ["@img/sharp-linux-x64", "@img/sharp-libvips-linux-x64"]) {
    if (!optional[name]) throw new Error(`sharp ${name} isn't in sharp's optional dependencies`);
    const tgz = out("npm", ["pack", `${name}@${optional[name]}`, "--silent", "--pack-destination", tmp]);
    const dest = path.join(imgDir, name.slice("@img/".length));
    fs.mkdirSync(dest);
    run("tar", ["-xzf", path.join(tmp, tgz), "-C", dest, "--strip-components=1"]);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

release({
  box: process.env.LB_BOX ?? "leobruno",
  dir: "",
  work: "leobruno-deploy",
  home: "/srv/leobruno",
  services: ["leobruno-web"],
  health: [{ port: 3003 }],
  archive: null,
  required: REQUIRED,
  // All that goes to the box: what the site reads (grep process.env). KIT_* and RESEND_API_KEY
  // sit in .env.local but nothing reads them.
  sent: REQUIRED,
  hint: ".env.local: copy it to .env.box with both SITE_URLs set to https://leobruno.it",
  prepare: history,
  postBuild: linuxSharp,
});
