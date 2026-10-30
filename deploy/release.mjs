// One release, for leobruno.it on the box; scripts/deploy.mjs is only its settings and calls
// this. A copy of sabotypist's deploy/release.mjs (itself Bixinu's scripts/deploy.mjs, adapted),
// with the standalone switch renamed: keep the two the same when one improves.
//
//   npm run deploy                  build what's on GitHub's main at HEAD and put it live on the box
//   npm run deploy -- --rollback    put the release before the live one back
//   npm run deploy -- --build-only  only the build, HEAD as it is, nothing sent (a rehearsal)
//
// The app at HEAD is exported from a clean copy of the committed tree (with what it needs from
// beside it — shared/, for one — put beside the copy), built with its .env.box's settings, sent
// to a new folder under <home>/releases, `current` flipped to it, the services restarted, and
// flipped back if the app doesn't answer within half a minute. Only the names the app lists of
// .env.box go to the box. Three releases stay.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const KEEP = 3;

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed (${r.status})`);
}
export const out = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", ...opts }).trim();
const step = (s) => console.log(`\n▸ ${s}`);

/**
 * @param {object} app
 * @param {string} app.box        the ~/.ssh/config Host
 * @param {string} app.dir        the app's folder in the repo: "" for the shop, "admin", "web"
 * @param {string} app.work       the folder under ~/.cache it is built in
 * @param {string} app.home       its folder on the box, holding releases/, current and env
 * @param {string[]} app.services the systemd units restarted on a flip
 * @param {{ port: number, path?: string, ok?: RegExp, tries?: number }[]} app.health
 *                                what must answer on the box, in order: any status under 500
 *                                unless `ok` says otherwise, 15 tries two seconds apart unless `tries`
 * @param {string[] | null} app.archive the paths git archive exports; null for the whole tree
 * @param {string[]} app.required what the app can't run without; .env.box must have each
 * @param {string[]} app.sent     every name that goes to the box (required among them)
 * @param {string} [app.hint]     where to read about .env.box when it is missing
 * @param {() => void} [app.before] checks before anything is copied
 * @param {(src: string, ctx: { exported: string, work: string }) => void} [app.prepare]
 *                                the copy readied, before npm ci
 * @param {(standalone: string, src: string) => void} [app.postBuild] the build readied for the box
 * @param {(live: { name: string, sha: string }) => void} [app.after] once the release answers on the box
 */
export function release(app) {
  const where = path.join(ROOT, app.dir);
  const label = path.join(app.dir, ".env.box");
  const work = path.join(os.homedir(), ".cache", app.work);
  const ssh = (script) => out("ssh", [app.box, script]);
  const journal = `ssh ${app.box} journalctl ${app.services.map((u) => `-u ${u}`).join(" ")} -n 100`;

  /** .env.box as name → value, quotes left as written (systemd reads them the same way). */
  function boxEnv(rehearsal) {
    let file = path.join(where, ".env.box");
    if (!fs.existsSync(file)) {
      if (!rehearsal) throw new Error(`${label} is missing${app.hint ? ` (see ${app.hint})` : ""}`);
      file = path.join(where, ".env.local");
      console.log("(no .env.box yet: rehearsing with .env.local)");
    }
    const env = {};
    if (fs.existsSync(file)) {
      for (const line of fs.readFileSync(file, "utf8").split("\n")) {
        const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
        if (m) env[m[1]] = m[2].replace(/\s+#.*$/, "").trim();
      }
    }
    const missing = app.required.filter((k) => !env[k]);
    if (missing.length && !rehearsal) throw new Error(`${label} lacks ${missing.join(", ")}`);
    if (missing.length) console.log(`(rehearsing without ${missing.join(", ")})`);
    return env;
  }

  /** Release folders on the box, oldest first (their names start with the UTC time). */
  function releases() {
    const list = ssh(`ls -1 ${app.home}/releases 2>/dev/null || true`);
    return list ? list.split("\n").sort() : [];
  }
  const live = () => path.basename(ssh(`readlink ${app.home}/current 2>/dev/null || true`));

  /** `current` to that release and the services restarted; false if the restart failed (the
   *  link has moved all the same, so the caller checks and flips back). */
  function flip(name) {
    ssh(`cd ${app.home} && ln -sfn releases/${name} current.new && mv -T current.new current`);
    try {
      ssh(`sudo systemctl restart ${app.services.join(" ")}`);
      return true;
    } catch {
      return false;
    }
  }

  /** Each of app.health answering on the box itself, in turn; the first one's status, or null. */
  function answers() {
    let first = null;
    for (const h of app.health) {
      const ok = h.ok ?? /^[1-4]\d\d$/;
      let code = null;
      for (let i = 0; i < (h.tries ?? 15) && !code; i++) {
        const c = ssh(`curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://[::1]:${h.port}${h.path ?? "/"} || true`);
        if (ok.test(c)) code = c; else spawnSync("sleep", ["2"]);
      }
      if (!code) return null;
      first ??= code;
    }
    return first;
  }

  function rollback() {
    const all = releases();
    const now = live();
    const before = all[all.indexOf(now) - 1];
    if (!before) throw new Error(`No release before ${now || "(none)"} on the box`);
    step(`back to ${before} (from ${now})`);
    const code = flip(before) ? answers() : null;
    if (!code) throw new Error(`The app doesn't answer after the rollback either: ssh in and look (${journal})`);
    console.log(`Live: ${before} (${code})`);
  }

  function deploy({ buildOnly }) {
    const env = boxEnv(buildOnly);
    const sha = out("git", ["rev-parse", "HEAD"], { cwd: ROOT });

    if (!buildOnly) {
      step("checking HEAD is on GitHub");
      run("git", ["fetch", "--quiet", "origin"], { cwd: ROOT });
      const onRemote = out("git", ["branch", "-r", "--contains", sha], { cwd: ROOT });
      if (!/origin\/main\b/.test(onRemote))
        throw new Error(`HEAD ${sha.slice(0, 7)} isn't on origin/main yet: push it first, then deploy`);
    }
    const name = `${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z-${sha.slice(0, 7)}`;
    app.before?.();

    step(`clean copy of ${sha.slice(0, 7)} in ${work}`);
    const src = path.join(work, "src");
    const exported = path.join(work, "export");
    fs.rmSync(exported, { recursive: true, force: true });
    fs.mkdirSync(exported, { recursive: true });
    execFileSync("sh", ["-c", `git -C "${ROOT}" archive ${sha} ${(app.archive ?? []).join(" ")} | tar -x -C "${exported}"`]);
    fs.mkdirSync(src, { recursive: true });
    // node_modules stays between deploys, so an unchanged lockfile installs in seconds.
    run("rsync", ["-a", "--delete", "--exclude=/node_modules", "--exclude=/.next", `${path.join(exported, app.dir)}/`, `${src}/`]);
    // What else was exported goes beside the copy, where the app reaches it (../shared, the
    // Mac's Info.plist).
    for (const p of app.dir ? (app.archive ?? []).filter((p) => p !== app.dir) : []) {
      fs.rmSync(path.join(work, p), { recursive: true, force: true });
      fs.cpSync(path.join(exported, p), path.join(work, p), { recursive: true });
    }
    app.prepare?.(src, { exported, work });
    run("npm", ["ci", "--silent", "--no-audit", "--no-fund"], { cwd: src });

    step("building for the box");
    const buildEnv = { ...process.env, ...env, LB_STANDALONE: "1", NODE_ENV: "production" };
    run("node_modules/.bin/next", ["build"], { cwd: src, env: buildEnv });
    const standalone = path.join(src, ".next", "standalone");
    fs.cpSync(path.join(src, ".next", "static"), path.join(standalone, ".next", "static"), { recursive: true });
    fs.cpSync(path.join(src, "public"), path.join(standalone, "public"), { recursive: true });
    app.postBuild?.(standalone, src);
    if (buildOnly) {
      console.log(`\nBuilt ${sha.slice(0, 7)} into ${standalone} (for Linux; nothing sent)`);
      return;
    }

    step(`sending ${name}`);
    const previous = live();
    run("rsync", [
      "-az",
      "--delete",
      ...(previous ? [`--link-dest=${app.home}/releases/${previous}/`] : []),
      `${standalone}/`,
      `${app.box}:${app.home}/releases/${name}/`,
    ]);
    const envFile = path.join(work, "env");
    const sent = app.sent.filter((k) => env[k] !== undefined);
    fs.writeFileSync(envFile, sent.map((k) => `${k}=${env[k]}`).join("\n") + "\n", { mode: 0o600 });
    // Written 0600 above, and -a keeps that (macOS's rsync has no --chmod=F600).
    run("rsync", ["-a", envFile, `${app.box}:${app.home}/env`]);
    fs.rmSync(envFile);

    step("going live");
    const code = flip(name) ? answers() : null;
    if (!code) {
      if (previous) {
        const back = flip(previous) ? answers() : null;
        if (!back) throw new Error(`${name} didn't answer, and ${previous} doesn't either after flipping back: ${journal}`);
        throw new Error(`${name} didn't answer; ${previous} is live again. Look: ${journal}`);
      }
      throw new Error(`${name} didn't answer, and there's nothing before it. Look: ${journal}`);
    }
    ssh(`echo "$(date -u +%FT%TZ) ${name}" >> ${app.home}/releases.log`);

    // Old releases go, never the live one or the one before it.
    const all = releases();
    const old = all.slice(0, Math.max(0, all.length - KEEP)).filter((r) => r !== name && r !== previous);
    if (old.length) ssh(`cd ${app.home}/releases && rm -rf ${old.join(" ")}`);
    console.log(`\nLive: ${name} (${code})${previous ? `; before it, ${previous} (npm run deploy -- --rollback)` : ""}`);
    app.after?.({ name, sha });
  }

  try {
    if (process.argv.includes("--rollback")) rollback();
    else deploy({ buildOnly: process.argv.includes("--build-only") });
  } catch (err) {
    console.error(`\n✗ ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
