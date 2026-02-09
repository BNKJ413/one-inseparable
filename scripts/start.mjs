import { spawn } from "node:child_process";

function run(cmd, args, name) {
  const p = spawn(cmd, args, { stdio: "inherit", shell: true });
  p.on("exit", (code) => process.exitCode = code ?? 1);
  console.log(`[start] started ${name}`);
  return p;
}

run("npm", ["-w", "apps/server", "run", "start"], "server");
run("npm", ["-w", "apps/web", "run", "start"], "web");
