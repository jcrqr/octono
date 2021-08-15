# :fallen_leaf: Octono

> GitHub REST API for Deno projects.

:construction: Under active development.

## Installation

```typescript
import { request } from "https://deno.land/x/octono@v0.0.1/mod.ts";
```

## Usage

```typescript
import { request } from "https://deno.land/x/octono@v0.0.1/mod.ts";

const { data: repos } = await request("GET /orgs/{org}/repos", {
  org: "octocat"
})

for (const repo of repos) {
  console.log(`Found repo: ${repo.full_name}`)
}
```

See [example.ts](example.ts). Use `deno run --allow-env --allow-net example.ts` to run it.

## Permissions

This module requires `--allow-env` and `--allow-net` permissions.

## Contributing

Please, see [CONTRIBUTING.md](CONTRIBUTING.md) to learn how you can contribute to this repository.

## License

This project is released under the [MIT License](/LICENSE).