import { request } from "https://deno.land/x/octono@v0.0.1/mod.ts";

const { data: repos } = await request("GET /users/{username}/repos", {
  username: "octocat"
})

for (const repo of repos) {
  console.log(`Found repo: ${repo.full_name} (${repo.stargazers_count} stars)`)
}