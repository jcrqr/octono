const OAS_VERSION = Deno.env.get("GITHUB_OAS_VERSION") || "v1.1.3"

const OAS_URL =
  `https://raw.githubusercontent.com/github/rest-api-description/${OAS_VERSION}/descriptions/api.github.com/api.github.com.json`;

async function genOpenAPITypes(): Promise<boolean> {
  const p = Deno.run({
    cmd: [
      "npx",
      "openapi-typescript",
      OAS_URL,
      "--output",
      "./gen/openapi.d.ts",
    ],
  });

  const status = await p.status();

  return status.success;
}

genOpenAPITypes();
