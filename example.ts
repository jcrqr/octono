import { Octono } from "./mod.ts";

const start = Date.now();
const octono = new Octono();

const resp = await octono.request("GET /users/{username}/repos", {
  username: "octocat",
});

const repos = await resp.json();

for (const repo of repos) {
  console.log(`Found repo: ${repo.full_name} (${repo.stargazers_count} stars)`);
}

console.log(`Time elapsed: ${Date.now() - start}ms`);
