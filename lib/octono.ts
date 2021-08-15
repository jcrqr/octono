import { Endpoints } from "../deps.ts";

const GITHUB_URL = Deno.env.get("GITHUB_URL") || "https://api.github.com";

export type Endpoint = string & keyof Endpoints;

export type EndpointMethod<E extends Endpoint = Endpoint> = string &
  keyof Endpoints[E];

export type EndpointParameters<
  E extends Endpoint,
  M extends EndpointMethod<E>
> = (Endpoints[E][M] extends { parameters: { path: Record<string, unknown> } }
  ? Endpoints[E][M]["parameters"]["path"]
  : Record<string, unknown>) &
  (Endpoints[E][M] extends { parameters: { query: Record<string, unknown> } }
    ? Endpoints[E][M]["parameters"]["query"]
    : Record<string, unknown>);

export type EndpointResponses<
  E extends Endpoint,
  M extends EndpointMethod<E>
> = Endpoints[E][M] extends {
  responses: { "200": { content: Record<string | number, unknown> } };
}
  ? // @ts-ignore FIXME: doesn't work if we add "application/json" to the extends check
    Endpoints[E][M]["responses"]["200"]["content"]["application/json"]
  : unknown;

export type EndpointPrefixed = Endpoint extends `${infer T}`
  ? T extends Endpoint
    ? `${Uppercase<EndpointMethod<T>>} ${T}`
    : never
  : never;

export type EndpointsMap = {
  [E in EndpointPrefixed]: {
    options: E extends `${infer M} ${infer E}`
      ? E extends Endpoint
        ? Lowercase<M> extends EndpointMethod<E>
          ? EndpointParameters<E, Lowercase<M>>
          : undefined
        : undefined
      : undefined;
    responses: E extends `${infer M} ${infer E}`
      ? E extends Endpoint
        ? Lowercase<M> extends EndpointMethod<E>
          ? EndpointResponses<E, Lowercase<M>>
          : unknown
        : unknown
      : unknown;
  };
};

export class OctonoResponse<T> extends Response {
  public data: T;

  constructor(body: T, resp: ResponseInit) {
    super(body as unknown as Uint8Array, resp);

    this.data = body;
  }
}

export async function request<
  E extends EndpointPrefixed = EndpointPrefixed,
  O extends EndpointsMap[E]["options"] = EndpointsMap[E]["options"],
  R extends EndpointsMap[E]["responses"] = EndpointsMap[E]["responses"]
>(
  endpointPrefixed: E,
  options?: O,
  init?: RequestInit
): Promise<OctonoResponse<R>> {
  const [method, endpoint, extraParams] = parseEndpoint(
    endpointPrefixed,
    options || {}
  );

  const url = new URL(endpoint, GITHUB_URL);

  if (method === "GET") {
    for (const [name, value] of Object.entries(extraParams)) {
      url.searchParams.set(name, value);
    }
  }

  const resp = await fetch(url, {
    ...init,
    method,
    body: method !== "GET" ? JSON.stringify(extraParams) : null,
  });

  return new OctonoResponse<R>(await resp.json(), resp);
}

function parseEndpoint(
  str: string,
  params: Record<string, unknown>
): [string, string, Record<string, string>] {
  const [method, endpoint] = str.split(" ");

  const pathParams = endpoint
    .split("/")
    .map((p) => (p.match(/{(.+)}/) || [])[1])
    .filter((p) => !!p);

  const extraParams = Object.entries(params)
    .filter(([p]) => !pathParams.includes(p))
    .reduce((m, [p, d]) => ({ ...m, [p]: d }), {});

  const endpointWithParams = endpoint
    .split("/")
    .map((part) => {
      const pathParam = pathParams.find((p) => part === `{${p}}`);

      if (!pathParam) {
        return part;
      }

      return part.replace(`{${pathParam}}`, params[pathParam] as string);
    })
    .join("/");

  return [method, endpointWithParams, extraParams];
}
